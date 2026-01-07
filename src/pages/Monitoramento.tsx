import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    ShoppingCart,
    ClipboardCheck,
    User,
    Loader2,
    Wrench,
    XCircle,
    Check,
    FilePlus,
    CheckSquare
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Monitoramento.css';

interface Processo {
    id: string;
    os: string;
    cliente: string;
    equipamento: string;
    etapaAtual: number;
    statusTexto: string;
    numero_pedido?: string;
    ordem_servico?: string;
    nota_fiscal?: string;
    camisa_int?: string;
    camisa_ext?: string;
    camisa_comp?: string;
    haste_diam?: string;
    haste_comp?: string;
    curso?: string;
    montagem?: string;
    pressao_nominal?: string;
    fabricante_modelo?: string;
    foto_frontal?: string;
    created_at?: string;
    criado_por_nome?: string;
    desenho_conjunto?: string;
    lubrificante?: string;
    volume?: string;
    acoplamento_polia?: string;
    sistema_lubrificacao?: string;
    outros_especificar?: string;
    observacoes_gerais?: string;
    fabricante?: string;
    tipo_modelo?: string;
    ni?: string;
    ordem?: string;
    tag?: string;
    tipo_cilindro?: string;
}

interface Historico {
    id: string;
    status_novo: string;
    created_at: string;
    responsavel_nome: string;
    responsavel_cargo?: string;
}

const ETAPAS = [
    { id: 1, titulo: 'PERITAGEM CRIADA', responsavel: 'PERITO', icone: <div className="icon-inner"><FilePlus size={24} /></div> },
    { id: 2, titulo: 'EM ANÁLISE PCP', responsavel: 'PCP', icone: <div className="icon-inner"><CheckSquare size={24} /></div> },
    { id: 3, titulo: 'AGUARDANDO CLIENTE', responsavel: 'COMERCIAL', icone: <div className="icon-inner"><User size={24} /></div> },
    { id: 4, titulo: 'EM MANUTENÇÃO', responsavel: 'OFICINA', icone: <div className="icon-inner"><Wrench size={24} /></div> },
    { id: 5, titulo: 'CONFERÊNCIA FINAL', responsavel: 'PCP', icone: <div className="icon-inner"><ClipboardCheck size={24} /></div> },
    { id: 6, titulo: 'PROCESSO FINALIZADO', responsavel: 'EXPEDIÇÃO', icone: <div className="icon-inner"><CheckCircle2 size={24} /></div> }
];

const getEtapaIndex = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === 'PERITAGEM CRIADA' || s === 'REVISÃO NECESSÁRIA') return 1;
    if (s === 'AGUARDANDO APROVAÇÃO DO PCP' || s === 'PERITAGEM FINALIZADA') return 2;
    if (s === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || s === 'AGUARDANDO CLIENTES' || s === 'AGUARDANDO ORÇAMENTO') return 3;
    if (s === 'EM MANUTENÇÃO' || s === 'CILINDROS EM MANUTENÇÃO') return 4;
    if (s === 'AGUARDANDO CONFERÊNCIA FINAL') return 5;
    if (s === 'PROCESSO FINALIZADO' || s === 'FINALIZADOS' || s === 'FINALIZADO') return 6;
    return 1;
};

export const Monitoramento: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<Historico[]>([]);
    const [selectedStepInfo, setSelectedStepInfo] = useState<Historico | null>(null);

    useEffect(() => {
        fetchProcessos();
    }, []);

    const fetchProcessos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('peritagens')
                .select(`
                    *,
                    criador: profiles!criado_por(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mappedData: Processo[] = data.map(p => ({
                id: p.id,
                os: p.numero_os,
                cliente: p.cliente,
                equipamento: p.equipamento || 'Cilindro Hidráulico',
                statusTexto: p.status,
                etapaAtual: getEtapaIndex(p.status),
                ...p,
                criado_por_nome: p.criador?.full_name || 'Usuário do Sistema'
            }));

            setProcessos(mappedData);
        } catch (err) {
            console.error('Erro ao buscar processos:', err);
        } finally {
            setLoading(false);
        }
    };

    // Efeito para selecionar processo via URL (vindo de "Ver Detalhes" em Peritagens)
    useEffect(() => {
        const urlId = searchParams.get('id');
        if (urlId && processos.length > 0) {
            const found = processos.find(p => p.id === urlId);
            if (found) {
                setSelectedProcess(found);
            }
        }
    }, [searchParams, processos]);

    const fetchHistory = async (peritagemId: string) => {
        try {
            const { data: histData } = await supabase
                .from('peritagem_historico')
                .select('*')
                .eq('peritagem_id', peritagemId)
                .order('created_at', { ascending: true });

            const userIds = Array.from(new Set(histData?.map(h => h.alterado_por) || []));
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', userIds);

            const mappedHist = histData?.map(h => {
                const profile = profiles?.find(p => p.id === h.alterado_por);
                return {
                    id: h.id,
                    status_novo: h.status_novo,
                    created_at: h.created_at,
                    responsavel_nome: profile?.full_name || 'Usuário do Sistema',
                    responsavel_cargo: profile?.role?.toUpperCase() || 'COLABORADOR'
                };
            }) || [];

            setHistorico(mappedHist);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
        }
    };

    useEffect(() => {
        if (selectedProcess) {
            fetchHistory(selectedProcess.id);
            setSelectedStepInfo(null);
        }
    }, [selectedProcess]);

    const { user, role, isAdmin } = useAuth();

    const handleUpdateStatus = async (targetProcess: any, newStatus: string, additionalData: any = {}) => {
        if (!targetProcess || !user) return;

        const oldStatus = targetProcess.statusTexto;

        try {
            const { error } = await supabase
                .from('peritagens')
                .update({
                    status: newStatus,
                    ...additionalData
                })
                .eq('id', targetProcess.id);

            if (error) throw error;

            await supabase.from('peritagem_historico').insert([{
                peritagem_id: targetProcess.id,
                status_antigo: oldStatus,
                status_novo: newStatus,
                alterado_por: user.id
            }]);

            const updated = {
                ...targetProcess,
                ...additionalData,
                statusTexto: newStatus,
                etapaAtual: getEtapaIndex(newStatus)
            };

            if (selectedProcess && selectedProcess.id === targetProcess.id) {
                setSelectedProcess(updated);
                fetchHistory(updated.id);
            }

            setProcessos(prev => prev.map(p => p.id === updated.id ? updated : p));
            alert(`Status atualizado para: ${newStatus}`);
        } catch (err: any) {
            console.error('Erro ao atualizar status:', err);
            alert('Erro ao atualizar status.');
        }
    };

    const filterParams = searchParams.get('filter');

    const filteredProcessos = processos.filter(p => {
        const cValue = (p.cliente || "").toLowerCase();
        const osValue = (p.os || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch = cValue.includes(search) || osValue.includes(search);

        if (!filterParams) return matchesSearch;

        const status = (p.statusTexto || "").toUpperCase();

        if (filterParams === 'pcp') {
            return matchesSearch && (status === 'PERITAGEM CRIADA' || status === 'AGUARDANDO APROVAÇÃO DO PCP');
        }
        if (filterParams === 'cliente') {
            return matchesSearch && (status === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || status === 'AGUARDANDO CLIENTES');
        }
        if (filterParams === 'finalizar') {
            return matchesSearch && (status === 'EM MANUTENÇÃO' || status === 'CILINDROS EM MANUTENÇÃO' || status === 'AGUARDANDO CONFERÊNCIA FINAL');
        }

        return matchesSearch;
    });

    const handleBackToList = () => {
        setSelectedProcess(null);
        setSearchParams({}); // Limpa o ID da URL ao voltar
    };

    if (selectedProcess) {
        return (
            <div className="monitoramento-container detail-view">
                <button className="btn-back-text" onClick={handleBackToList}>
                    <ArrowLeft size={18} />
                    <span>Voltar para a lista</span>
                </button>

                <div className="process-header-summary mini">
                    <div className="summary-left">
                        <span className="monitoring-label">
                            <Loader2 size={14} className="spinning-icon" /> MONITORAMENTO DE PROCESSO
                        </span>
                        <h2 className="current-step-title">
                            {selectedProcess.os} - <span className="highlight-status">{selectedProcess.cliente}</span>
                        </h2>
                    </div>
                </div>

                <div className="timeline-grid">
                    {ETAPAS.map((etapa, index) => {
                        const isCompleted = etapa.id < selectedProcess.etapaAtual;
                        const isActive = etapa.id === selectedProcess.etapaAtual;
                        const isPending = etapa.id > selectedProcess.etapaAtual;

                        let stageHistory = historico.find(h => getEtapaIndex(h.status_novo) === etapa.id);

                        if (etapa.id === 1 && !stageHistory && selectedProcess) {
                            stageHistory = {
                                id: 'initial',
                                status_novo: 'PERITAGEM CRIADA',
                                created_at: selectedProcess.created_at || '',
                                responsavel_nome: selectedProcess.criado_por_nome || 'Sistema (Criação)',
                                responsavel_cargo: 'SISTEMA'
                            };
                        }

                        const canClick = !!stageHistory;

                        return (
                            <React.Fragment key={etapa.id}>
                                <div
                                    className={`stage-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''} ${canClick ? 'clickable' : ''}`}
                                    onClick={() => canClick && setSelectedStepInfo(stageHistory!)}
                                >
                                    <span className="stage-number">{etapa.id < 10 ? `0${etapa.id}` : etapa.id}</span>

                                    <div className="stage-icon-box">
                                        {etapa.icone}
                                    </div>

                                    <div className="stage-content">
                                        <h4 className="stage-title">{etapa.titulo}</h4>
                                        <span className="stage-responsible-role">{etapa.responsavel}</span>
                                    </div>

                                    {isActive && <div className="active-pill">ATIVO</div>}
                                </div>
                                {index < ETAPAS.length - 1 && (
                                    <div className="stage-connector">
                                        <ChevronRight size={24} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="timeline-footer">
                    <div className="legend">
                        <div className="legend-item"><span className="dot dot-executed"></span> EXECUTADO</div>
                        <div className="legend-item"><span className="dot dot-active"></span> ETAPA ATUAL</div>
                        <div className="legend-item"><span className="dot dot-pending"></span> PENDENTE</div>
                    </div>

                    <div className="instruction-text">
                        CLIQUE NOS CARDS PARA VER DETALHES
                    </div>

                    <div className="process-id-display">
                        O.S: {selectedProcess.os}
                    </div>
                </div>

                {selectedStepInfo && (
                    <div className="history-modal-overlay" onClick={() => setSelectedStepInfo(null)}>
                        <div className="history-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-icon-container">
                                    {ETAPAS.find(e => getEtapaIndex(selectedStepInfo.status_novo) === e.id)?.icone || <ClipboardCheck size={24} />}
                                </div>
                                <div className="modal-header-text">
                                    <h3>{selectedStepInfo.status_novo}</h3>
                                    <span>INFORMAÇÕES DE EXECUÇÃO</span>
                                </div>
                                <button className="modal-close-x" onClick={() => setSelectedStepInfo(null)}>
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="info-row">
                                    <div className="info-icon-box"><CheckCircle2 size={20} color="#3182ce" /></div>
                                    <div className="info-text-box">
                                        <label>EXECUTADO EM</label>
                                        <strong>{selectedStepInfo.created_at ? new Date(selectedStepInfo.created_at).toLocaleDateString('pt-BR') : '---'}</strong>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-icon-box"><Loader2 size={20} color="#3182ce" /></div>
                                    <div className="info-text-box">
                                        <label>HORÁRIO</label>
                                        <strong>{selectedStepInfo.created_at ? new Date(selectedStepInfo.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '---'}</strong>
                                    </div>
                                </div>

                                <div className="info-row">
                                    <div className="info-icon-box"><User size={20} color="#3182ce" /></div>
                                    <div className="info-text-box">
                                        <label>RESPONSÁVEL</label>
                                        <strong>{selectedStepInfo.responsavel_nome}</strong>
                                        <span className="sub-role" style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>
                                            {selectedStepInfo.responsavel_cargo}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button className="modal-close-btn" onClick={() => setSelectedStepInfo(null)}>
                                FECHAR DETALHES
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="monitoramento-container list-view">

            <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Monitoramento de Processos</h1>
            <p className="page-subtitle">Selecione uma peritagem para visualizar a linha do tempo e o status atual.</p>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar por O.S. ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="process-list">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                        <p>Buscando processos...</p>
                    </div>
                ) : (
                    <>
                        {filteredProcessos.map(processo => {
                            const showActions = (role === 'pcp' || role === 'gestor' || role === 'perito');
                            const isPcpAwaiting = processo.statusTexto === 'PERITAGEM CRIADA' || processo.statusTexto === 'AGUARDANDO APROVAÇÃO DO PCP';
                            const isClientAwaiting = processo.statusTexto === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || processo.statusTexto === 'AGUARDANDO CLIENTES';
                            const isMaintenance = processo.statusTexto === 'EM MANUTENÇÃO' || processo.statusTexto === 'CILINDROS EM MANUTENÇÃO';

                            return (
                                <div key={processo.id} className="process-card">
                                    <div className="process-main-info" onClick={() => setSelectedProcess(processo)}>
                                        <div className="process-info">
                                            <span className="process-tag">{processo.os}</span>
                                            <h3 className="process-title">{processo.cliente}</h3>
                                            <span className="process-client">{processo.equipamento}</span>
                                        </div>

                                        <div className="process-flow-indicator">
                                            {ETAPAS.map(e => (
                                                <div
                                                    key={e.id}
                                                    className={`flow-dot ${e.id <= processo.etapaAtual ? 'filled' : ''} ${e.id === processo.etapaAtual ? 'current' : ''}`}
                                                    title={e.titulo}
                                                />
                                            ))}
                                        </div>

                                        <div className="process-status-wrapper">
                                            <span className={`status-badge ${processo.statusTexto.toLowerCase().replace(/ /g, '-')}`}>
                                                {processo.statusTexto}
                                            </span>
                                            <ChevronRight size={20} color="#cbd5e0" />
                                        </div>
                                    </div>

                                    {showActions && (
                                        <div className="process-quick-actions">
                                            {isPcpAwaiting && isAdmin && (
                                                <button
                                                    className="btn-quick-approve"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(processo, 'AGUARDANDO APROVAÇÃO DO CLIENTE'); }}
                                                >
                                                    <Check size={16} />
                                                    <span>Aprovar Peritagem</span>
                                                </button>
                                            )}
                                            {isClientAwaiting && (isAdmin || role === 'perito') && (
                                                <button
                                                    className="btn-quick-client"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(processo, 'EM MANUTENÇÃO'); }}
                                                >
                                                    <ShoppingCart size={16} />
                                                    <span>Empenho de Materiais</span>
                                                </button>
                                            )}
                                            {isMaintenance && (isAdmin || role === 'perito') && (
                                                <button
                                                    className="btn-quick-finish"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(processo, 'AGUARDANDO CONFERÊNCIA FINAL'); }}
                                                >
                                                    <Wrench size={16} />
                                                    <span>Finalizar Oficina</span>
                                                </button>
                                            )}
                                            {processo.statusTexto === 'AGUARDANDO CONFERÊNCIA FINAL' && (isAdmin || role === 'perito') && (
                                                <button
                                                    className="btn-quick-finish"
                                                    style={{ background: '#2d3748' }}
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(processo, 'PROCESSO FINALIZADO'); }}
                                                >
                                                    <CheckCircle2 size={16} />
                                                    <span>Conferir e Finalizar</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filteredProcessos.length === 0 && (
                            <div className="no-results">Nenhum processo encontrado.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
