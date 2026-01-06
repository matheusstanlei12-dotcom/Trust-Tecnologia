import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';
import './PcpCommon.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    status: string;
    numero_pedido?: string;
}

export const PcpFinalizaProcesso: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeritagens();
    }, []);

    const fetchPeritagens = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .eq('status', 'AGUARDANDO CONFERÊNCIA FINAL')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('peritagens')
                .update({ status: 'PROCESSO FINALIZADO' })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO CONFERÊNCIA FINAL',
                status_novo: 'PROCESSO FINALIZADO',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Processo finalizado e enviado para expedição!');
        } catch (err) {
            alert('Erro ao finalizar processo.');
        }
    };

    const filtered = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <h1 className="page-title">3. Conferência Final</h1>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="pcp-approval-grid">
                {loading ? (
                    <div className="loading-state"><Loader2 className="animate-spin" /></div>
                ) : (
                    filtered.map(p => (
                        <div key={p.id} className="pcp-action-card">
                            <div className="pcp-card-header">
                                <div>
                                    <h3 className="pcp-card-client">{p.cliente}</h3>
                                    <span className="pcp-card-id">ID: {p.numero_peritagem}</span>
                                </div>
                                <span className="status-badge" style={{ background: '#2d3748', color: 'white' }}>AGUARDANDO PCP</span>
                            </div>

                            <div style={{
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                borderLeft: '4px solid var(--primary)'
                            }}>
                                <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>Pedido Liberado:</span>
                                <h2 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>#{p.numero_pedido || 'NÃO INFORMADO'}</h2>
                            </div>

                            <button
                                className="btn-pcp-action"
                                onClick={() => handleFinalize(p.id)}
                            >
                                <CheckCircle2 size={18} /> Aprovar e Finalizar Processo
                            </button>
                        </div>
                    ))
                )}
                {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#718096' }}>Nenhum processo aguardando sua conferência.</p>}
            </div>
        </div>
    );
};
