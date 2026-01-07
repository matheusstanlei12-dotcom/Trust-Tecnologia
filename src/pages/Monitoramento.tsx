import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, CheckCircle2, ShoppingCart, ClipboardCheck, User, Loader2, Wrench, XCircle, Check, FilePlus, CheckSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Monitoramento.css';

// Atualizado: Fluxo de PCP


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

interface AnaliseTecnica {
    id: string;
    componente: string;
    conformidade: string;
    anomalias?: string;
    solucao?: string;
    fotos?: string[];
    dimensoes?: string;
    qtd?: string | number;
    tipo?: string;
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
    const [searchParams] = useSearchParams();
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [historico, setHistorico] = useState<Historico[]>([]);
    const [selectedStepInfo, setSelectedStepInfo] = useState<Historico | null>(null);
    const [technicalAnalyses, setTechnicalAnalyses] = useState<AnaliseTecnica[]>([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(false);

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
                    criador:profiles!criado_por(full_name)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro Supabase:', error);
                // Fallback para busca sem join se o join falhar por algum motivo de relação
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('peritagens')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (fallbackError) throw fallbackError;
                processMappedData(fallbackData || []);
            } else {
                processMappedData(data || []);
            }
        } catch (err) {
            console.error('Erro ao buscar processos:', err);
        } finally {
            setLoading(false);
        }
    };

    const processMappedData = (data: any[]) => {
        const mapped = data.map((p: any) => ({
            id: p.id,
            os: p.numero_peritagem || p.os || 'S/N',
            cliente: p.cliente || 'Sem Cliente',
            equipamento: p.equipamento || 'Cilindro Hidráulico',
            etapaAtual: getEtapaIndex(p.status),
            statusTexto: p.status || 'PERITAGEM CRIADA',
            numero_pedido: p.numero_pedido,
            ordem_servico: p.ordem_servico,
            nota_fiscal: p.nota_fiscal,
            camisa_int: p.camisa_int,
            camisa_ext: p.camisa_ext,
            camisa_comp: p.camisa_comp,
            haste_diam: p.haste_diam,
            haste_comp: p.haste_comp,
            curso: p.curso,
            montagem: p.montagem,
            pressao_nominal: p.pressao_nominal,
            fabricante_modelo: p.fabricante_modelo,
            foto_frontal: p.foto_frontal,
            created_at: p.created_at,
            criado_por_nome: p.criador?.full_name || 'Usuário do Sistema',
            desenho_conjunto: p.desenho_conjunto,
            lubrificante: p.lubrificante,
            volume: p.volume,
            acoplamento_polia: p.acoplamento_polia,
            sistema_lubrificacao: p.sistema_lubrificacao,
            outros_especificar: p.outros_especificar,
            observacoes_gerais: p.observacoes_gerais,
            fabricante: p.fabricante,
            tipo_modelo: p.tipo_modelo,
            ni: p.ni,
            ordem: p.ordem,
            tag: p.tag,
            tipo_cilindro: p.tipo_cilindro
        }));

        setProcessos(mapped);

        // Auto-selecionar se vier ID via URL
        const idFromUrl = searchParams.get('id');
        if (idFromUrl) {
            const found = mapped.find((m: any) => m.id === idFromUrl);
            if (found) setSelectedProcess(found);
        }
    };

    const fetchHistory = async (peritagemId: string) => {
        try {
            // Primeiro, pegamos o histórico de mudanças de status
            const { data: histData, error: histError } = await supabase
                .from('peritagem_historico')
                .select(`
                    id,
                    status_novo,
                    created_at,
                    alterado_por
                `)
                .eq('peritagem_id', peritagemId)
                .order('created_at', { ascending: true });

            if (histError) throw histError;

            // Buscamos os nomes dos perfis separadamente para garantir o join
            const userIds = [...new Set(histData?.map(h => h.alterado_por) || [])];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', userIds);

            // Mapeamos os dados
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
            console.error('Erro ao buscar análises técnicas:', err);
        } finally {
            setLoadingAnalyses(false);
        }
    };

    useEffect(() => {
        if (selectedProcess) {
            fetchHistory(selectedProcess.id);
            fetchAnalyses(selectedProcess.id);
            setSelectedStepInfo(null);
        }
    }, [selectedProcess]);

    const { user, role } = useAuth(); // Contexto Auth

    const [pedidoInput, setPedidoInput] = useState('');

    const handleUpdateStatus = async (newStatus: string, additionalData: any = {}) => {
        if (!selectedProcess || !user) return;

        const oldStatus = selectedProcess.statusTexto;

        try {
            // 1. Atualizar Peritagem
            const { error } = await supabase
                .from('peritagens')
                .update({
                    status: newStatus,
                    ...additionalData
                })
                .eq('id', selectedProcess.id);

            if (error) throw error;

            // 2. Criar Histórico
            await supabase.from('peritagem_historico').insert([{
                peritagem_id: selectedProcess.id,
                status_antigo: oldStatus,
                status_novo: newStatus,
                alterado_por: user.id
            }]);

            // Atualiza localmente
            const updated = {
                ...selectedProcess,
                ...additionalData,
                statusTexto: newStatus,
                etapaAtual: getEtapaIndex(newStatus)
            };
            setSelectedProcess(updated);
            setProcessos(prev => prev.map(p => p.id === updated.id ? updated : p));
            setPedidoInput(''); // Limpa input de pedido
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
            return matchesSearch && (status === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || status === 'Aguardando Clientes');
        }
        if (filterParams === 'finalizar') {
            return matchesSearch && (status === 'EM MANUTENÇÃO' || status === 'Cilindros em Manutenção' || status === 'AGUARDANDO CONFERÊNCIA FINAL');
        }

        return matchesSearch;
    });

    if (selectedProcess) {
        return (
            <div className="monitoramento-container detail-view">
                <button className="btn-back-text" onClick={() => setSelectedProcess(null)}>
                    <ArrowLeft size={18} />
                    <span>Voltar para a lista</span>
                </button>

                <div className="process-header-summary">
                    <div className="summary-left">
                        <span className="monitoring-label">
                            <Loader2 size={14} className="spinning-icon" /> MONITORAMENTO DE PROCESSO
                        </span>
                        <h2 className="current-step-title">
                            Etapa atual: <span className="highlight-status">{selectedProcess.statusTexto}</span>
                        </h2>
                    </div>
                    <div className="responsible-card-new">
                        <div className="user-icon-container">
                            <User size={24} />
                        </div>
                        <div className="responsible-text">
                            <span className="label">SETOR RESPONSÁVEL</span>
                            <span className="value">{ETAPAS[selectedProcess.etapaAtual - 1]?.responsavel}</span>
                        </div>
                    </div>
                </div>

                {/* AREA DE AÇÃO DO PCP / GESTOR */}
                <div className="pcp-actions-card">
                    <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem' }}>Dados Completos da Peritagem</h3>

                    <div className="peritagem-full-review">
                        {selectedProcess.foto_frontal && (
                            <div className="review-section">
                                <h4 className="review-subtitle">Foto Frontal do Equipamento</h4>
                                <div className="review-image-container">
                                    <img src={selectedProcess.foto_frontal} alt="Frontal" className="review-image-main" />
                                </div>
                            </div>
                        )}

                        <div className="review-section">
                            <h4 className="review-subtitle">Identificação e Dimensões</h4>
                            <div className="peritagem-details-grid">
                                <div className="detail-item"><strong>O.S.:</strong> {selectedProcess.os}</div>
                                <div className="detail-item"><strong>Cliente:</strong> {selectedProcess.cliente}</div>
                                <div className="detail-item"><strong>TAG:</strong> {selectedProcess.tag || '---'}</div>
                                <div className="detail-item"><strong>Tipo:</strong> {selectedProcess.tipo_cilindro || '---'}</div>
                                <div className="detail-item"><strong>N.F.:</strong> {selectedProcess.nota_fiscal || '---'}</div>
                                <div className="detail-item"><strong>NI:</strong> {selectedProcess.ni || '---'}</div>
                                <div className="detail-item"><strong>Ordem:</strong> {selectedProcess.ordem || '---'}</div>
                                <div className="detail-item"><strong>Ø Interno:</strong> {selectedProcess.camisa_int || '---'}mm</div>
                                <div className="detail-item"><strong>Ø Haste:</strong> {selectedProcess.haste_diam || '---'}mm</div>
                                <div className="detail-item"><strong>Curso:</strong> {selectedProcess.curso || '---'}mm</div>
                                <div className="detail-item"><strong>Comp. Total:</strong> {selectedProcess.camisa_comp || '---'}mm</div>
                                <div className="detail-item"><strong>Comp. Haste:</strong> {selectedProcess.haste_comp || '---'}mm</div>
                                <div className="detail-item"><strong>Pressão Nom.:</strong> {selectedProcess.pressao_nominal || '---'}</div>
                                <div className="detail-item full-row"><strong>Montagem:</strong> {selectedProcess.montagem || '---'}</div>
                                <div className="detail-item full-row"><strong>Fabricante/Modelo:</strong> {selectedProcess.fabricante_modelo || '---'}</div>

                                {/* Novos campos */}
                                <div className="detail-item"><strong>Desenho:</strong> {selectedProcess.desenho_conjunto || '---'}</div>
                                <div className="detail-item"><strong>Lubrificante:</strong> {selectedProcess.lubrificante || '---'}</div>
                                <div className="detail-item"><strong>Volume:</strong> {selectedProcess.volume || '---'}</div>
                                <div className="detail-item"><strong>Acoplamento:</strong> {selectedProcess.acoplamento_polia || '---'}</div>
                                <div className="detail-item"><strong>Sist. Lub.:</strong> {selectedProcess.sistema_lubrificacao || '---'}</div>
                                <div className="detail-item"><strong>Fabricante:</strong> {selectedProcess.fabricante || '---'}</div>
                                <div className="detail-item"><strong>Modelo:</strong> {selectedProcess.tipo_modelo || '---'}</div>
                                {selectedProcess.outros_especificar && (
                                    <div className="detail-item full-row"><strong>Outros:</strong> {selectedProcess.outros_especificar}</div>
                                )}
                                {selectedProcess.observacoes_gerais && (
                                    <div className="detail-item full-row"><strong>Obs. Gerais:</strong> {selectedProcess.observacoes_gerais}</div>
                                )}
                            </div>
                        </div>

                        <div className="review-section">
                            <h4 className="review-subtitle">Análise Técnica (Componentes)</h4>
                            {loadingAnalyses ? (
                                <div className="loading-mini"><Loader2 size={24} className="spinning-icon" /> Carregando análise...</div>
                            ) : (
                                <div className="analysis-review-list">
                                    {technicalAnalyses.filter(a => a.tipo !== 'vedação').length > 0 ? (
                                        technicalAnalyses.filter(a => a.tipo !== 'vedação').map(analise => (
                                            <div key={analise.id} className={`review-item-card ${analise.conformidade === 'não conforme' ? 'not-ok' : 'ok'}`}>
                                                <div className="review-item-header">
                                                    <div className="item-info">
                                                        <span className="item-name">{analise.componente}</span>
                                                        {(analise.dimensoes || analise.qtd) && (
                                                            <div className="item-subtext">
                                                                {analise.dimensoes && <span>Dim: {analise.dimensoes}</span>}
                                                                {analise.qtd && <span>Qtd: {analise.qtd}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={`badge-conformity ${analise.conformidade === 'conforme' ? 'ok' : 'nok'}`}>
                                                        {analise.conformidade.toUpperCase()}
                                                    </span>
                                                </div>

                                                {analise.conformidade === 'não conforme' && (
                                                    <div className="review-item-details">
                                                        {analise.anomalias && (
                                                            <div className="detail-field">
                                                                <label>Anomalia</label>
                                                                <p>{analise.anomalias}</p>
                                                            </div>
                                                        )}
                                                        {analise.solucao && (
                                                            <div className="detail-field">
                                                                <label>Solução Sugerida</label>
                                                                <p>{analise.solucao}</p>
                                                            </div>
                                                        )}
                                                        {analise.fotos && analise.fotos.length > 0 && (
                                                            <div className="detail-field">
                                                                <label>Evidências Fotográficas</label>
                                                                <div className="review-photo-grid">
                                                                    {analise.fotos.map((foto, idx) => (
                                                                        <div key={idx} className="review-photo-item" onClick={() => window.open(foto, '_blank')}>
                                                                            <img src={foto} alt={`Dano ${idx + 1}`} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>Nenhuma análise de componente encontrada.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nova seção de vedações */}
                        <div className="review-section">
                            <h4 className="review-subtitle">Lista de Vedações Necessárias</h4>
                            {loadingAnalyses ? (
                                <div className="loading-mini"><Loader2 size={24} className="spinning-icon" /> Carregando...</div>
                            ) : (
                                <div className="analysis-review-list">
                                    {technicalAnalyses.filter(a => a.tipo === 'vedação').length > 0 ? (
                                        <div className="vedacoes-table-view">
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f7fafc', textAlign: 'left' }}>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #edf2f7' }}>Descrição</th>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #edf2f7', textAlign: 'center' }}>Qtd</th>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #edf2f7', textAlign: 'center' }}>UN</th>
                                                        <th style={{ padding: '8px', borderBottom: '2px solid #edf2f7' }}>Observação</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {technicalAnalyses.filter(a => a.tipo === 'vedação').map(v => (
                                                        <tr key={v.id}>
                                                            <td style={{ padding: '8px', borderBottom: '1px solid #edf2f7' }}>{v.componente}</td>
                                                            <td style={{ padding: '8px', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>{v.qtd}</td>
                                                            <td style={{ padding: '8px', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>{v.dimensoes}</td>
                                                            <td style={{ padding: '8px', borderBottom: '1px solid #edf2f7' }}>{v.anomalias}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>Nenhuma vedação registrada.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AREA DE AÇÃO DO PCP / GESTOR (Apenas botões agora) */}
                    {(role === 'pcp' || role === 'gestor') && (
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px dashed #edf2f7' }}>
                            {(selectedProcess.statusTexto === 'AGUARDANDO APROVAÇÃO DO PCP' || selectedProcess.statusTexto === 'PERITAGEM CRIADA' || selectedProcess.statusTexto === 'REVISÃO NECESSÁRIA') && (
                                <div className="pcp-buttons">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleUpdateStatus('AGUARDANDO APROVAÇÃO DO CLIENTE')}
                                    >
                                        <Check size={18} />
                                        <span>Aprovar para Comercial</span>
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleUpdateStatus('REVISÃO NECESSÁRIA')}
                                    >
                                        <XCircle size={18} />
                                        <span>Solicitar Revisão ao Perito</span>
                                    </button>
                                </div>
                            )}

                            {(selectedProcess.statusTexto === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || selectedProcess.statusTexto === 'Aguardando Clientes') && (
                                <>
                                    <p>Informe o número do pedido do cliente para liberar para manutenção:</p>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <input
                                            type="text"
                                            className="pcp-input"
                                            placeholder="Digite o número do pedido..."
                                            value={pedidoInput}
                                            onChange={(e) => setPedidoInput(e.target.value)}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e0',
                                                width: '100%',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div className="pcp-buttons">
                                        <button
                                            className="btn-approve"
                                            disabled={!pedidoInput}
                                            onClick={() => handleUpdateStatus('EM MANUTENÇÃO', { numero_pedido: pedidoInput })}
                                        >
                                            <ShoppingCart size={18} />
                                            <span>Aprovar Liberação do Cliente</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {(selectedProcess.statusTexto === 'EM MANUTENÇÃO' || selectedProcess.statusTexto === 'Cilindros em Manutenção') && (
                                <>
                                    <p>A manutenção foi concluída? Envie para conferência final do PCP.</p>
                                    <div className="pcp-buttons">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleUpdateStatus('AGUARDANDO CONFERÊNCIA FINAL')}
                                        >
                                            <Wrench size={18} />
                                            <span>Finalizar Manutenção</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedProcess.statusTexto === 'AGUARDANDO CONFERÊNCIA FINAL' && (
                                <>
                                    <p>Confira todos os dados e o pedido <strong>#{selectedProcess.numero_pedido}</strong> antes de finalizar o processo.</p>
                                    <div className="pcp-buttons">
                                        <button
                                            className="btn-approve"
                                            onClick={() => handleUpdateStatus('PROCESSO FINALIZADO')}
                                        >
                                            <CheckCircle2 size={18} />
                                            <span>Aprovar Finalização e Expedir</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {selectedProcess.statusTexto === 'PROCESSO FINALIZADO' && (
                        <p style={{ color: '#38a169', fontWeight: 'bold', marginTop: '1rem' }}>✅ Este processo já foi finalizado e aprovado.</p>
                    )}

                    {selectedProcess.statusTexto === 'REVISÃO NECESSÁRIA' && (
                        <p style={{ color: '#e53e3e', fontWeight: 'bold', marginTop: '1rem' }}>⚠️ Aguardando revisão dos dados da peritagem.</p>
                    )}
                </div>

                <h2 className="page-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Monitoramento de Processos</h2>

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

                {/* MODAL DE HISTÓRICO - ESTILO PREMIUM COM DESFOQUE */}
                {
                    selectedStepInfo && (
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
                    )
                }
            </div >
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
                            const showActions = (role === 'pcp' || role === 'gestor');
                            const isPcpAwaiting = processo.statusTexto === 'PERITAGEM CRIADA' || processo.statusTexto === 'AGUARDANDO APROVAÇÃO DO PCP';
                            const isClientAwaiting = processo.statusTexto === 'AGUARDANDO APROVAÇÃO DO CLIENTE' || processo.statusTexto === 'Aguardando Clientes';
                            const isMaintenance = processo.statusTexto === 'EM MANUTENÇÃO' || processo.statusTexto === 'Cilindros em Manutenção';

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
                                            {isPcpAwaiting && (
                                                <button
                                                    className="btn-quick-approve"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus('AGUARDANDO APROVAÇÃO DO CLIENTE'); }}
                                                >
                                                    <Check size={16} />
                                                    <span>Aprovar Peritagem</span>
                                                </button>
                                            )}
                                            {isClientAwaiting && (
                                                <button
                                                    className="btn-quick-client"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus('EM MANUTENÇÃO'); }}
                                                >
                                                    <ShoppingCart size={16} />
                                                    <span>Liberar Pedido</span>
                                                </button>
                                            )}
                                            {isMaintenance && (
                                                <button
                                                    className="btn-quick-finish"
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus('AGUARDANDO CONFERÊNCIA FINAL'); }}
                                                >
                                                    <Wrench size={16} />
                                                    <span>Finalizar Oficina</span>
                                                </button>
                                            )}
                                            {processo.statusTexto === 'AGUARDANDO CONFERÊNCIA FINAL' && (
                                                <button
                                                    className="btn-quick-finish"
                                                    style={{ background: '#2d3748' }}
                                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus('PROCESSO FINALIZADO'); }}
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
