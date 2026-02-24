import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import './Auth.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!name.trim()) errs.name = 'Nome é obrigatório.';
        if (!email.trim()) errs.email = 'Email é obrigatório.';
        if (!password) errs.password = 'Senha é obrigatória.';
        else if (password.length < 6) errs.password = 'Senha deve ter pelo menos 6 caracteres.';
        if (password !== confirmPassword) errs.confirmPassword = 'As senhas não conferem.';
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});

        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password });
            login(res.data.token, res.data.user);
            toast.success('Conta criada com sucesso!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <div className="auth-card__logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                    <span>TripAI</span>
                </div>

                <h1 className="auth-card__title">Crie sua conta</h1>

                <div className={`auth-field ${errors.name ? 'auth-field--error' : ''}`}>
                    <label className="label-uppercase">Nome</label>
                    <input
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <span className="auth-field__error">{errors.name}</span>}
                </div>

                <div className={`auth-field ${errors.email ? 'auth-field--error' : ''}`}>
                    <label className="label-uppercase">Email</label>
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <span className="auth-field__error">{errors.email}</span>}
                </div>

                <div className={`auth-field ${errors.password ? 'auth-field--error' : ''}`}>
                    <label className="label-uppercase">Senha</label>
                    <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <span className="auth-field__error">{errors.password}</span>}
                </div>

                <div className={`auth-field ${errors.confirmPassword ? 'auth-field--error' : ''}`}>
                    <label className="label-uppercase">Confirmar Senha</label>
                    <input
                        type="password"
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {errors.confirmPassword && <span className="auth-field__error">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="btn-navy auth-card__btn" disabled={loading}>
                    {loading ? <><span className="spinner-sm" /> Criando...</> : 'Criar Conta'}
                </button>

                <p className="auth-card__link">
                    Já tem conta? <Link to="/login">Entrar</Link>
                </p>
            </form>
        </div>
    );
}
