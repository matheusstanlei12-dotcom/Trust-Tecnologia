import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: trimmedPassword,
            });

            if (authError) throw authError;

            if (data.user) {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <header className="login-header">
                    <div className="logo-placeholder">
                        <img src="/logo.png" alt="Trust Tecnologia Logo" style={{ maxWidth: '180px' }} />
                    </div>
                    <h1>TRUST TECNOLOGIA - SISTEMA DE PERITAGEM</h1>
                </header>

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="login-error">{error}</div>}

                    <div className="input-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <footer className="login-footer">
                    <a href="#forgot" className="forgot-link">Esqueci a senha</a>
                    <p className="no-account">
                        Não tem uma conta? <Link to="/register" className="create-account">Criar conta</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};
