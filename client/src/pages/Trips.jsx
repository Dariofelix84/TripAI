import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { getGradient, formatCurrency, formatDate } from '../utils/helpers';
import './Trips.css';

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await api.get('/trips');
            setTrips(res.data.trips);
        } catch (err) {
            toast.error('Erro ao carregar viagens.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta viagem?')) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips(prev => prev.filter(t => t.id !== id));
            toast.success('Viagem excluída.');
        } catch (err) {
            toast.error('Erro ao excluir viagem.');
        }
    };

    const filteredTrips = trips.filter(t =>
        t.destination.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="trips-page">
            {/* Mobile hamburger */}
            <button className="trips-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
                ☰
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar__header">
                    <div className="sidebar__logo">
                        <div className="sidebar__logo-icon">✦</div>
                        <div>
                            <span className="sidebar__brand">TripAI</span>
                            <span className="sidebar__tagline">SMART PLANNING</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar__nav">
                    <Link to="/" className="sidebar__item">
                        <span className="sidebar__item-icon">🏠</span> Início
                    </Link>
                    <Link to="/" className="sidebar__item">
                        <span className="sidebar__item-icon">🧭</span> Explorar
                    </Link>
                    <Link to="/trips" className="sidebar__item sidebar__item--active">
                        <span className="sidebar__item-icon">❤️</span> Minhas Viagens
                    </Link>
                    <button className="sidebar__item" onClick={() => { logout(); navigate('/login'); }}>
                        <span className="sidebar__item-icon">👤</span> Perfil
                    </button>
                </nav>

                <div className="sidebar__upgrade">
                    <div className="sidebar__upgrade-card">
                        <span className="sidebar__upgrade-title">UPGRADE PRO</span>
                        <span className="sidebar__upgrade-desc">Acesse roteiros ilimitados com IA.</span>
                        <button className="sidebar__upgrade-btn">Ver Planos</button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Main Area */}
            <main className="trips-main">
                <div className="trips-main__header">
                    <div>
                        <h1 className="trips-main__title">Minhas Viagens</h1>
                        <p className="trips-main__subtitle">Gerencie seus roteiros salvos e itinerários personalizados.</p>
                    </div>
                    <div className="trips-main__actions">
                        <div className="trips-main__search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Pesquisar roteiros..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Link to="/" className="trips-main__add">+</Link>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="trips-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="trip-card trip-card--skeleton">
                                <div className="skeleton" style={{ height: 180 }} />
                                <div style={{ padding: 16 }}>
                                    <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
                                    <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 6 }} />
                                    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 16 }} />
                                    <div className="skeleton" style={{ height: 40 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredTrips.length === 0 && !search ? (
                    <div className="trips-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                        </svg>
                        <p>Você ainda não salvou nenhuma viagem.</p>
                        <Link to="/" className="btn-navy">Gerar Meu Primeiro Roteiro</Link>
                    </div>
                ) : (
                    <div className="trips-grid">
                        {filteredTrips.map(trip => (
                            <div key={trip.id} className="trip-card">
                                <div className="trip-card__thumb" style={{ background: getGradient(trip.destination) }}>
                                    <svg className="trip-card__thumb-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {trip.is_active === 1 && (
                                        <span className="trip-card__active-badge">ITINERÁRIO ATIVO</span>
                                    )}
                                    <button
                                        className="trip-card__delete"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                                        title="Excluir viagem"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="trip-card__body">
                                    <div className="trip-card__row">
                                        <span className="trip-card__dest">{trip.destination}</span>
                                        <span className="trip-card__days-badge">{trip.days} Dias</span>
                                    </div>
                                    <p className="trip-card__meta">📅 Salvo em {formatDate(trip.created_at)}</p>
                                    {trip.budget_max && (
                                        <p className="trip-card__meta">💳 Orçamento: {formatCurrency(trip.budget_max)}</p>
                                    )}
                                    <Link to={`/trips/${trip.id}`} className="trip-card__btn">
                                        Visualizar Roteiro
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* New Trip Card */}
                        <div className="trip-card trip-card--new">
                            <div className="trip-card--new__content">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="10" y1="10" x2="14" y2="10" />
                                </svg>
                                <span className="trip-card--new__title">Novo Roteiro</span>
                                <span className="trip-card--new__desc">Peça para a IA criar um novo plano para sua próxima aventura.</span>
                                <Link to="/" className="btn-navy trip-card--new__btn">Criar Agora</Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="trips-bottom">
                    <div className="trips-bottom__left">
                        <span className="trips-bottom__info">ℹ️ Seus roteiros são sincronizados entre todos os seus dispositivos.</span>
                    </div>
                    <div className="trips-bottom__right">
                        <div className="trips-bottom__avatars">
                            <div className="trips-bottom__avatar" style={{ background: '#667eea' }}>D</div>
                            <div className="trips-bottom__avatar" style={{ background: '#11998e' }}>M</div>
                            <div className="trips-bottom__avatar" style={{ background: '#f7971e' }}>A</div>
                            <span className="trips-bottom__more">+12</span>
                        </div>
                        <span className="trips-bottom__label">Planejando com amigos</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
