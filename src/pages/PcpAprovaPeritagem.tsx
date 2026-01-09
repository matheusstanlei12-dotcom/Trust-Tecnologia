import React, { useState, useEffect } from 'react';
import { Search, Loader2, Check, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Peritagens.css';
import './PcpCommon.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    ordem_servico: string;
    nota_fiscal: string;
    camisa_int: string;
    camisa_ext: string;
    camisa_comp: string;
    haste_diam: string;
    haste_comp: string;
    curso: string;
    montagem?: string;
    pressao_nominal?: string;
    fabricante_modelo?: string;
    foto_frontal?: string;
    status: string;
}

interface AnaliseTecnica {
    id: string;
    componente: string;
    conformidade: string;
    anomalias?: string;
    solucao?: string;
    fotos?: string[];
    dimensoes?: string;
    qtd?: string;
}

export const PcpAprovaPeritagem: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeritagem, setSelectedPeritagem] = useState<Peritagem | null>(null);
    const [technicalAnalyses, setTechnicalAnalyses] = useState<AnaliseTecnica[]>([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(false);

    useEffect(() => {
        fetchPeritagens();
    }, []);

    const fetchPeritagens = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .or('status.eq.PERITAGEM CRIADA,status.eq.AGUARDANDO APROVAÇÃO DO PCP')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalyses = async (peritagemId: string) => {
        try {
            setLoadingAnalyses(true);
            const { data, error } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', peritagemId);

            if (error) throw error;
            setTechnicalAnalyses(data || []);
        } catch (err) {
            console.error('Erro ao buscar análises:', err);
        } finally {
            setLoadingAnalyses(false);
        }
    };

    useEffect(() => {
        if (selectedPeritagem) {
            fetchAnalyses(selectedPeritagem.id);
        }
    }, [selectedPeritagem]);

    const handleApprove = async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('peritagens')
                .update({ status: 'AGUARDANDO APROVAÇÃO DO CLIENTE' })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO APROVAÇÃO DO PCP',
                status_novo: 'AGUARDANDO APROVAÇÃO DO CLIENTE',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Peritagem aprovada e enviada para o comercial.');
        } catch (err) {
            alert('Erro ao aprovar.');
        }
    };

    const handleReject = async (id: string) => {
        if (!user) return;
        // Opcional: Solicitar motivo
        const motivo = window.prompt("Motivo da reprovação (será enviado ao perito):");
        if (motivo === null) return; // Cancelou

        try {
            const { error } = await supabase
                .from('peritagens')
                .update({ status: 'REVISÃO NECESSÁRIA' })
                .eq('id', id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: id,
                status_antigo: 'AGUARDANDO APROVAÇÃO DO PCP',
                status_novo: 'REVISÃO NECESSÁRIA',
                alterado_por: user.id
            }]);

            setPeritagens(prev => prev.filter(p => p.id !== id));
            alert('Peritagem reprovada e devolvida ao perito.');
        } catch (err) {
            console.error(err);
            alert('Erro ao reprovar.');
        }
    };

    const filtered = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="peritagens-container">
            <h1 className="page-title">1. Aprovação de Peritagem</h1>

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
                    <div className="loading-state" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                    </div>
                ) : (
                    <>
                        {selectedPeritagem ? (
                            <div className="detailed-review-flow">
                                <button className="btn-back-action" onClick={() => setSelectedPeritagem(null)}>
                                    ← Voltar para a lista
                                </button>

                                <div className="peritagem-full-review card">
                                    <h2 className="review-title">Revisão Detalhada: {selectedPeritagem.cliente}</h2>

                                    {selectedPeritagem.foto_frontal && (
                                        <div className="review-section">
                                            <h4 className="review-subtitle">Foto Frontal do Equipamento</h4>
                                            <div className="review-photo-container">
                                                <img src={selectedPeritagem.foto_frontal} alt="Frontal" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="review-section">
                                        <h4 className="review-subtitle">Identificação e Dimensões</h4>
                                        <div className="review-details-grid">
                                            <div className="review-detail-item"><label>CLIENTE</label> <strong>{selectedPeritagem.cliente}</strong></div>
                                            <div className="review-detail-item"><label>ID PERITAGEM</label> <strong>{selectedPeritagem.numero_peritagem}</strong></div>
                                            <div className="review-detail-item"><label>ORDEM DE SERVIÇO</label> <strong>{selectedPeritagem.ordem_servico || '---'}</strong></div>
                                            <div className="review-detail-item"><label>NOTA FISCAL</label> <strong>{selectedPeritagem.nota_fiscal || '---'}</strong></div>
                                            <div className="review-detail-item"><label>Ø INTERNO</label> <strong>{selectedPeritagem.camisa_int || '---'} mm</strong></div>
                                            <div className="review-detail-item"><label>Ø HASTE</label> <strong>{selectedPeritagem.haste_diam || '---'} mm</strong></div>
                                            <div className="review-detail-item"><label>CURSO</label> <strong>{selectedPeritagem.curso || '---'} mm</strong></div>
                                            <div className="review-detail-item"><label>FABRICANTE/MODELO</label> <strong>{selectedPeritagem.fabricante_modelo || '---'}</strong></div>
                                        </div>
                                    </div>

                                    <div className="review-section">
                                        <h4 className="review-subtitle">Análise Técnica (Checklist)</h4>
                                        {loadingAnalyses ? (
                                            <div className="loading-small"><Loader2 className="animate-spin" /> Carregando checklists...</div>
                                        ) : (
                                            <div className="analysis-review-list">
                                                {technicalAnalyses.map(analise => (
                                                    <div key={analise.id} className={`review-item-card ${analise.conformidade === 'não conforme' ? 'not-ok' : 'ok'}`}>
                                                        <div className="review-item-header">
                                                            <div className="item-info">
                                                                <strong className="item-comp-name">{analise.componente}</strong>
                                                                {(analise.dimensoes || analise.qtd) && (
                                                                    <div className="item-meta">
                                                                        {analise.dimensoes && <span>{analise.dimensoes}</span>}
                                                                        {analise.dimensoes && analise.qtd && <span className="divider">|</span>}
                                                                        {analise.qtd && <span>Qtd: {analise.qtd}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className={`item-badge ${analise.conformidade === 'conforme' ? 'ok' : 'nok'}`}>
                                                                {analise.conformidade.toUpperCase()}
                                                            </span>
                                                        </div>

                                                        {analise.conformidade === 'não conforme' && (
                                                            <div className="review-item-details">
                                                                <div className="details-stack">
                                                                    {analise.anomalias && (
                                                                        <div className="detail-field critical">
                                                                            <label>Anomalia Encontrada</label>
                                                                            <p>{analise.anomalias}</p>
                                                                        </div>
                                                                    )}
                                                                    {analise.solucao && (
                                                                        <div className="detail-field">
                                                                            <label>Solução Recomendada</label>
                                                                            <p>{analise.solucao}</p>
                                                                        </div>
                                                                    )}
                                                                    {analise.fotos && analise.fotos.length > 0 && (
                                                                        <div className="detail-field">
                                                                            <label>Evidências Fotográficas</label>
                                                                            <div className="photo-evidence-grid">
                                                                                {analise.fotos.map((f, i) => (
                                                                                    <img key={i} src={f} alt="Evidência" className="photo-evidence-item" onClick={() => window.open(f, '_blank')} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pcp-approval-actions">
                                        <button
                                            className="btn-pcp-action"
                                            style={{ backgroundColor: '#ef4444' }}
                                            onClick={() => { handleReject(selectedPeritagem.id); setSelectedPeritagem(null); }}
                                        >
                                            <XCircle size={24} /> Reprovar
                                        </button>
                                        <button
                                            className="btn-pcp-action approve-all"
                                            onClick={() => { handleApprove(selectedPeritagem.id); setSelectedPeritagem(null); }}
                                        >
                                            <Check size={24} /> Confirmar e Enviar para Comercial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filtered.map(p => (
                                <div key={p.id} className="pcp-action-card clickable" onClick={() => setSelectedPeritagem(p)}>
                                    <div className="pcp-card-header">
                                        <div>
                                            <h3 className="pcp-card-client">{p.cliente}</h3>
                                            <span className="pcp-card-id">ID: {p.numero_peritagem}</span>
                                        </div>
                                        <span className="status-badge peritagem-criada">{p.status}</span>
                                    </div>

                                    <div className="pcp-details-mini-grid">
                                        <div className="pcp-detail-item"><small>O.S.</small><strong>{p.ordem_servico || '---'}</strong></div>
                                        <div className="pcp-detail-item"><small>C. INT/EXT</small><strong>{p.camisa_int || '---'}/{p.camisa_ext || '---'}</strong></div>
                                        <div className="pcp-detail-item"><small>H. DIÂMETRO</small><strong>{p.haste_diam || '---'}</strong></div>
                                        <div className="pcp-detail-item"><small>CURSO</small><strong>{p.curso || '---'}</strong></div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn-pcp-action">
                                            <Search size={18} /> Ver Detalhes e Aprovar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
                {!loading && filtered.length === 0 && !selectedPeritagem && <p style={{ textAlign: 'center', color: '#718096' }}>Nenhuma peritagem pendente.</p>}
            </div>
        </div>
    );
};
