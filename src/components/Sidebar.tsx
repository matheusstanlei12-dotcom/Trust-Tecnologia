import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Clock,
    PlusCircle,
    DollarSign,
    FileSearch,
    LogOut,
    Wrench
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/logo.png" alt="HIDRAUP Logo" style={{ maxWidth: '100%', height: 'auto' }} />
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Painel</span>
                </NavLink>

                <NavLink to="/peritagens" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <FileText size={20} />
                    <span>Todas as Peritagens</span>
                </NavLink>

                <NavLink to="/monitoramento" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Clock size={20} />
                    <span>Status</span>
                </NavLink>

                <NavLink to="/nova-peritagem" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <PlusCircle size={20} />
                    <span>Nova Peritagem</span>
                </NavLink>

                <NavLink to="/clientes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <DollarSign size={20} />
                    <span>Aguardando Clientes</span>
                </NavLink>

                <NavLink to="/manutencao" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <Wrench size={20} />
                    <span>Cilindros em Manutenção</span>
                </NavLink>

                <NavLink to="/relatorios" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <FileSearch size={20} />
                    <span>Relatórios em PDF</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">M</div>
                    <div className="user-details">
                        <span className="user-name">Matheus Stanley</span>
                        <span className="user-role">GESTOR</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};
