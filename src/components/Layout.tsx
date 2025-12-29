import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="layout-root">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mobile-menu-btn">
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <img src="/logo.png" alt="Logo" className="mobile-logo" />
            </header>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
                {children}
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};
