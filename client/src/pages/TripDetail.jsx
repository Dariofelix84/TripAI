import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { getGradient, formatCurrency } from '../utils/helpers';
import './Result.css';

export default function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedDays, setExpandedDays] = useState([1]);

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            setTrip(res.data.trip);
        } catch (err) {
            toast.error('Viagem não encontrada.');
            navigate('/trips');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (dayNum) => {
        setExpandedDays(prev =>
            prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
        );
    };

    if (loading) {
        return (
            <div className="result">
                <header className="result-header">
                    <div className="result-header__inner">
                        <div className="result-header__left">
                            <button className="result-header__back" onClick={() => navigate(-1)}>←</button>
                            <span className="result-header__brand">TRIPAI</span>
                        </div>
                    </div>
                </header>
                <div style={{ padding: 40, textAlign: 'center' }}>
                    <div className="spinner-sm" style={{ margin: '40px auto', width: 32, height: 32, borderWidth: 4 }} />
                    <p style={{ color: 'var(--text-gray)' }}>Carregando roteiro...</p>
                </div>
            </div>
        );
    }

    if (!trip) return null;

    const itinerary = typeof trip.itinerary === 'string' ? JSON.parse(trip.itinerary) : trip.itinerary;
    const totalBudget = itinerary.days?.reduce((sum, d) => sum + (d.dayTotal || 0), 0) || 0;

    return (
        <div className="result">
            {/* Header */}
            <header className="result-header">
                <div className="result-header__inner">
                    <div className="result-header__left">
                        <button className="result-header__back" onClick={() => navigate(-1)}>←</button>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                        </svg>
                        <span className="result-header__brand">TRIPAI</span>
                    </div>
                    <div className="result-header__right">
                        <Link to="/trips" className="result-header__link">MEUS ROTEIROS</Link>
                        <Link to="/" className="result-header__link">EXPLORAR</Link>
                        <div className="result-header__avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner */}
            <div className="result-banner" style={{ background: getGradient(itinerary.destination || trip.destination) }}>
                <div className="result-banner__overlay" />
                <div className="result-banner__content">
                    <div className="result-banner__badges">
                        {itinerary.country && <span className="result-banner__badge">{itinerary.country.toUpperCase()}</span>}
                        {itinerary.region && <span className="result-banner__badge">{itinerary.region.toUpperCase()}</span>}
                    </div>
                    <h1 className="result-banner__title">{itinerary.destination || trip.destination}</h1>
                    <p className="result-banner__meta">📅 {itinerary.summary || 'Roteiro personalizado'} • {itinerary.month || ''}</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="result-stats">
                <div className="result-stats__card">
                    <div className="result-stats__items">
                        <div className="result-stats__item">
                            <span className="result-stats__icon">🕐</span>
                            <div>
                                <span className="result-stats__label">DURAÇÃO</span>
                                <span className="result-stats__value">{itinerary.days?.length || trip.days} Dias</span>
                            </div>
                        </div>
                        <div className="result-stats__item">
                            <span className="result-stats__icon">💳</span>
                            <div>
                                <span className="result-stats__label">ORÇAMENTO</span>
                                <span className="result-stats__value">{formatCurrency(totalBudget)}</span>
                            </div>
                        </div>
                        <div className="result-stats__item">
                            <span className="result-stats__icon">🔄</span>
                            <div>
                                <span className="result-stats__label">ATIVIDADES</span>
                                <span className="result-stats__value">{itinerary.totalActivities || (itinerary.days?.length * 3)} Locais</span>
                            </div>
                        </div>
                    </div>
                    <button className="result-stats__share">⇄ Compartilhar</button>
                </div>
            </div>

            {/* Timeline */}
            <div className="result-timeline">
                <h2 className="result-timeline__title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    Seu Cronograma
                </h2>

                {itinerary.days?.map((day) => {
                    const isExpanded = expandedDays.includes(day.day);
                    return (
                        <div key={day.day} className={`day-card ${isExpanded ? 'day-card--expanded' : ''}`}>
                            <button className="day-card__header" onClick={() => toggleDay(day.day)}>
                                <div className="day-card__badge">{String(day.day).padStart(2, '0')}</div>
                                <div className="day-card__info">
                                    <span className="day-card__title">Dia {day.day}: {day.title}</span>
                                    <span className="day-card__subtitle">{day.subtitle}</span>
                                </div>
                                <span className="day-card__chevron">{isExpanded ? '▲' : '▼'}</span>
                            </button>

                            {isExpanded && (
                                <div className="day-card__body">
                                    {day.morning && (
                                        <div className="activity">
                                            <div className="activity__icon activity__icon--morning">🌅</div>
                                            <div className="activity__content">
                                                <div className="activity__header">
                                                    <span className="activity__name">Manhã: {day.morning.title}</span>
                                                    <span className="activity__cost">{formatCurrency(day.morning.estimatedCost)}</span>
                                                </div>
                                                <p className="activity__desc">{day.morning.description}</p>
                                            </div>
                                        </div>
                                    )}
                                    {day.afternoon && (
                                        <div className="activity">
                                            <div className="activity__icon activity__icon--afternoon">🌤</div>
                                            <div className="activity__content">
                                                <div className="activity__header">
                                                    <span className="activity__name">Tarde: {day.afternoon.title}</span>
                                                    <span className="activity__cost">{formatCurrency(day.afternoon.estimatedCost)}</span>
                                                </div>
                                                <p className="activity__desc">{day.afternoon.description}</p>
                                            </div>
                                        </div>
                                    )}
                                    {day.evening && (
                                        <div className="activity">
                                            <div className="activity__icon activity__icon--evening">🌙</div>
                                            <div className="activity__content">
                                                <div className="activity__header">
                                                    <span className="activity__name">Noite: {day.evening.title}</span>
                                                    <span className="activity__cost">{formatCurrency(day.evening.estimatedCost)}</span>
                                                </div>
                                                <p className="activity__desc">{day.evening.description}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="day-card__footer">
                                        <span className="day-card__total-label">TOTAL DO DIA</span>
                                        <span className="day-card__total-value">{formatCurrency(day.dayTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
