import React, { useState, useEffect } from 'react';
import { Search, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    data_execucao: string;
    status: string;
    prioridade: string;
    criado_por: string;
}

export const Peritagens: React.FC = () => {
    const { user, role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'recusadas'>('all'); // Filtro para Perito
    const navigate = useNavigate();

    useEffect(() => {
        if (user) fetchPeritagens();
    }, [user, role, filterStatus]);

    const fetchPeritagens = async () => {
        try {
            let query = supabase
                .from('peritagens')
                .select('*')
                .order('created_at', { ascending: false });

            // Se for PERITO, filtrar apenas as suas
            if (role === 'perito') {
                query = query.eq('criado_por', user.id);

                // Se estiver vendo recusadas
                if (filterStatus === 'recusadas') {
                    query = query.eq('status', 'REVISÃO NECESSÁRIA');
                }
            }

            const { data, error } = await query;

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro ao buscar peritagens:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPeritagens = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <div className="header-actions">
                <h1 className="page-title">{role === 'perito' ? 'Minhas Peritagens' : 'Todas as Peritagens'}</h1>

                {role === 'perito' && (
                    <div className="filter-group">
                        <button
                            className={`btn-filter ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            Todas
                        </button>
                        <button
                            className={`btn-filter recusadas ${filterStatus === 'recusadas' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('recusadas')}
                        >
                            🔴 Recusadas
                        </button>
                    </div>
                )}
                <button className="btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/nova-peritagem')}>
                    <Plus size={20} />
                    <span>Nova Peritagem</span>
                </button>
            </div>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou OS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                        <p>Carregando peritagens...</p>
                    </div>
                ) : (
                    <table className="peritagens-table">
                        <thead>
                            <tr>
                                <th>Número da Ordem de Serviço</th>
                                <th>Cliente</th>
                                <th>Data da Execução</th>
                                <th>Status</th>
                                <th>Prioridade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPeritagens.map((p) => (
                                <tr key={p.id}>
                                    <td className="peritagem-id" data-label="O.S">{p.numero_peritagem}</td>
                                    <td data-label="Cliente">{p.cliente}</td>
                                    <td data-label="Data">{new Date(p.data_execucao).toLocaleDateString('pt-BR')}</td>
                                    <td data-label="Status">
                                        <span className={`status-badge ${p.status.toLowerCase().replace(/ /g, '-')}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td data-label="Prioridade">{p.prioridade}</td>
                                    <td>
                                        <button
                                            className={`btn-action ${p.status === 'REVISÃO NECESSÁRIA' ? 'btn-edit' : ''}`}
                                            onClick={() => {
                                                if (p.status === 'REVISÃO NECESSÁRIA') {
                                                    navigate(`/nova-peritagem?id=${p.id}`);
                                                } else {
                                                    navigate(`/monitoramento?id=${p.id}`);
                                                }
                                            }}
                                        >
                                            {p.status === 'REVISÃO NECESSÁRIA' ? (
                                                <>
                                                    <span>EDITAR</span>
                                                    <ExternalLink size={16} />
                                                </>
                                            ) : (
                                                <>
                                                    <span>VER DETALHES</span>
                                                    <ExternalLink size={16} />
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPeritagens.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhuma peritagem encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
