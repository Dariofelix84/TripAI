import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

export default function Header({ variant = 'light' }) {
    const { user, logout, token } = useAuth();
    const isDark = variant === 'dark';

    return (
        <header className={`header ${isDark ? 'header--dark' : ''}`}>
            <div className="header__inner">
                <Link to="/" className="header__logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#fff' : '#1B2B4B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                    <span className="header__brand">TripAI</span>
                </Link>

                <nav className="header__nav">
                    <Link to="/trips" className="header__link">Minhas Viagens</Link>
                    <Link to="/" className="header__link">Destinos</Link>
                    <Link to="/" className="header__link">Ajuda</Link>
                </nav>

                <div className="header__actions">
                    {token ? (
                        <>
                            <button onClick={logout} className="header__link">Sair</button>
                            <Link to="/trips" className="header__avatar">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="header__link">Entrar</Link>
                            <Link to="/register" className="btn-navy header__cta">Criar Conta</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
