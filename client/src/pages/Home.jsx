import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

const DAY_OPTIONS = ['1-3', '4-7', '8-14', '15+'];

const MIN_BUDGET = 1000;
const MAX_BUDGET = 100000;

function getBudgetLabel(value) {
    if (value <= 5000) return 'Econômico';
    if (value <= 15000) return 'Moderado';
    if (value <= 30000) return 'Confortável';
    return 'Luxo';
}

function getDaysFromOption(opt, customDays) {
    if (opt === '15+') return customDays || 15;
    const parts = opt.split('-');
    return parseInt(parts[1] || parts[0]);
}

export default function Home() {
    const [destination, setDestination] = useState('');
    const [selectedDays, setSelectedDays] = useState('4-7');
    const [customDays, setCustomDays] = useState(15);
    const [budgetValue, setBudgetValue] = useState(10000);
    const [loading, setLoading] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoRef = useRef(null);
    const { token } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!destination.trim()) {
            toast.error('Informe um destino para gerar o roteiro.');
            return;
        }

        if (!token) {
            toast.info('Faça login para gerar seu roteiro.');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const days = getDaysFromOption(selectedDays, customDays);
            const budgetLabel = getBudgetLabel(budgetValue);
            const res = await api.post('/trips/generate', {
                destination: destination.trim(),
                days,
                budgetMin: MIN_BUDGET,
                budgetMax: budgetValue,
                budgetLabel,
            });

            toast.success('Roteiro gerado com sucesso!');
            navigate('/result', {
                state: {
                    itinerary: res.data.itinerary,
                    destination: destination.trim(),
                    days,
                    budgetMin: MIN_BUDGET,
                    budgetMax: budgetValue,
                    budgetLabel,
                },
            });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao gerar roteiro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home">
            <Header />

            <section className="hero">
                <video
                    ref={videoRef}
                    className={`hero__video ${videoLoaded ? 'hero__video--visible' : ''}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onCanPlay={() => setVideoLoaded(true)}
                    onError={() => setVideoLoaded(false)}
                >
                    <source src="/videos/hero-travel.mp4" type="video/mp4" />
                    <source src="/videos/hero-travel.webm" type="video/webm" />
                </video>
                <div className="hero__overlay" />
                <div className="hero__content">
                    <h1 className="hero__title">Sua próxima aventura<br />começa aqui</h1>
                    <p className="hero__subtitle">Crie roteiros personalizados com o poder da Inteligência Artificial.</p>

                    <form className="form-card" onSubmit={handleGenerate}>
                        <div className="form-card__row">
                            <div className="form-card__field form-card__field--dest">
                                <label className="label-uppercase">Para onde você quer ir?</label>
                                <div className="form-card__input-wrap">
                                    <svg className="form-card__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Ex: Paris, Tóquio, Rio de Janeiro..."
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="form-card__input"
                                    />
                                </div>
                            </div>

                            <div className="form-card__field form-card__field--days">
                                <label className="label-uppercase">Quantos dias?</label>
                                <div className="form-card__pills">
                                    {DAY_OPTIONS.map(opt => (
                                        <button
                                            type="button"
                                            key={opt}
                                            className={`form-card__pill ${selectedDays === opt ? 'form-card__pill--active' : ''}`}
                                            onClick={() => setSelectedDays(opt)}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {selectedDays === '15+' && (
                                    <input
                                        type="number"
                                        min="15"
                                        max="60"
                                        value={customDays}
                                        onChange={(e) => setCustomDays(parseInt(e.target.value) || 15)}
                                        className="form-card__input form-card__input--small"
                                        placeholder="Número de dias"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="form-card__budget">
                            <div className="form-card__budget-header">
                                <label className="label-uppercase">Orçamento estimado</label>
                                <span className="form-card__budget-value">
                                    R$ {budgetValue.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step="1000"
                                value={budgetValue}
                                onChange={(e) => setBudgetValue(parseInt(e.target.value))}
                                className="form-card__slider"
                            />
                            <div className="form-card__budget-labels">
                                <span>R$ 1.000</span>
                                <span>R$ 100.000</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="form-card__submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-sm" />
                                    Gerando seu roteiro...
                                </>
                            ) : (
                                <>✦ Gerar Meu Roteiro</>
                            )}
                        </button>

                        <p className="form-card__hint">
                            Nossa IA analisa voos, hotéis e atrações em segundos.
                        </p>
                    </form>

                    <div className="hero__badges">
                        <span className="hero__badge">🛡 SEGURO</span>
                        <span className="hero__badge">⚡ INSTANTÂNEO</span>
                        <span className="hero__badge">◎ PERSONALIZADO</span>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
