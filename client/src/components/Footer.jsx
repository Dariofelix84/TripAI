import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__left">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                    <span>© 2026 TripAI Travel.</span>
                </div>
                <div className="footer__right">
                    <a href="#">TERMOS DE USO</a>
                    <span>·</span>
                    <a href="#">PRIVACIDADE</a>
                    <span>·</span>
                    <a href="#">COOKIES</a>
                </div>
            </div>
        </footer>
    );
}
