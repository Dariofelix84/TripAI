import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('tripai_token');
        const savedUser = localStorage.getItem('tripai_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('tripai_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('tripai_token', newToken);
        localStorage.setItem('tripai_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('tripai_token');
        localStorage.removeItem('tripai_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}
