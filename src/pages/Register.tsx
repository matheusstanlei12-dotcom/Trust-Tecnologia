import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Register.css';

export const RegisterPage: React.FC = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('Perito');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        const cleanedEmail = email.trim();
        const cleanedPassword = password.trim();

        console.log("Tentando cadastrar:", { cleanedEmail });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanedEmail)) {
            setError('Formato de e-mail inválido detectado pelo sistema.');
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: cleanedEmail,
                password: cleanedPassword,
                options: {
                    data: {
                        full_name: fullName.trim(),
                        role: role.toLowerCase(),
                        status: 'PENDENTE'
                    }
                }
            });

            if (signUpError) {
                console.error('Supabase Sign Up Error:', signUpError);
                throw signUpError;
            }

            if (data?.user && data?.session === null) {
                // Email confirmation is likely enabled
                setSuccess(true);
            } else if (data?.user) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao solicitar acesso');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-card success-card">
                    <h2>Solicitação Enviada!</h2>
                    <p>Sua solicitação de acesso foi enviada para análise do administrador.</p>
                    <p>Você será redirecionado para a tela de login em instantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-card register-card">
                <header className="login-header">
                    <div className="logo-placeholder">
                        <img src="/logo.png" alt="Trust Tecnologia Logo" style={{ maxWidth: '180px' }} />
                    </div>
                    <h1>TRUST TECNOLOGIA - SOLICITAR ACESSO</h1>
                </header>

                <form className="login-form" onSubmit={handleRegister}>
                    {error && <div className="login-error">{error}</div>}

                    <div className="input-group">
                        <label htmlFor="fullName">Nome Completo</label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="Seu nome completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

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

                    <div className="input-row">
                        <div className="input-group">
                            <label htmlFor="password">Senha</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirmPassword">Repetir Senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="role">Nível de Acesso</label>
                        <select
                            id="role"
                            className="custom-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Perito">Perito</option>
                            <option value="PCP">PCP</option>
                            <option value="Gestor">Gestor</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Processando...' : 'Criar Conta'}
                    </button>
                </form>

                <footer className="login-footer">
                    <p className="no-account">
                        Já tem uma conta? <Link to="/login" className="create-account">Fazer login</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
};
