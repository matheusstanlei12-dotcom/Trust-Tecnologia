import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ArrowLeft, FileText, CheckCircle2, ShoppingCart, DollarSign, ClipboardCheck, User, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Monitoramento.css';

interface Processo {
    id: string;
    os: string;
    cliente: string;
    equipamento: string;
    etapaAtual: number;
    statusTexto: string;
}

const ETAPAS = [
    { id: 1, titulo: 'PERITAGEM CRIADA', responsavel: 'PERITO', icone: <FileText size={24} /> },
    { id: 2, titulo: 'PERITAGEM FINALIZADA', responsavel: 'PERITO', icone: <CheckCircle2 size={24} /> },
    { id: 3, titulo: 'AGUARDANDO COMPRAS', responsavel: 'COMPRADOR', icone: <ShoppingCart size={24} /> },
    { id: 4, titulo: 'COTAÇÃO INSUMOS', responsavel: 'COMPRADOR', icone: <DollarSign size={24} /> },
    { id: 5, titulo: 'ORÇAMENTO EM ELABORAÇÃO', responsavel: 'ORÇAMENTISTA', icone: <ClipboardCheck size={24} /> },
    { id: 6, titulo: 'ORÇAMENTO FINALIZADO', responsavel: 'ORÇAMENTISTA', icone: <CheckCircle2 size={24} /> }
];

const getEtapaIndex = (status: string) => {
    const idx = ETAPAS.findIndex(e => e.titulo === status);
    return idx !== -1 ? idx + 1 : 1;
};

export const Monitoramento: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [selectedProcess, setSelectedProcess] = useState<Processo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProcessos();
    }, []);

    const fetchProcessos = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped = data.map((p: any) => ({
                    id: p.id,
                    os: p.numero_peritagem || p.os || 'S/N',
                    cliente: p.cliente,
                    equipamento: p.equipamento || 'Cilindro Hidráulico',
                    etapaAtual: getEtapaIndex(p.status),
                    statusTexto: p.status
                }));
                setProcessos(mapped);

                // Auto-selecionar se vier ID via URL
                const idFromUrl = searchParams.get('id');
                if (idFromUrl) {
                    const found = mapped.find((m: any) => m.id === idFromUrl);
                    if (found) setSelectedProcess(found);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar processos:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProcessos = processos.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.os.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedProcess) {
        return (
            <div className="monitoramento-container detail-view">
                <button className="btn-back-text" onClick={() => setSelectedProcess(null)}>
                    <ArrowLeft size={18} />
                    <span>Voltar para a lista</span>
                </button>

                <div className="process-header-summary">
                    <div className="summary-left">
                        <span className="summary-label">MONITORAMENTO: {selectedProcess.os} - {selectedProcess.cliente}</span>
                        <h1 className="current-step-title">
                            Etapa Atual: <span className="highlight">{selectedProcess.statusTexto}</span>
                        </h1>
                    </div>
                    <div className="responsible-card">
                        <div className="user-icon-bg">
                            <User size={24} />
                        </div>
                        <div className="responsible-info">
                            <span className="info-label">SETOR RESPONSÁVEL</span>
                            <span className="info-value">{ETAPAS[selectedProcess.etapaAtual - 1]?.responsavel}</span>
                        </div>
                    </div>
                </div>

                <div className="timeline-horizontal">
                    {ETAPAS.map((etapa, index) => {
                        const isCompleted = etapa.id < selectedProcess.etapaAtual;
                        const isActive = etapa.id === selectedProcess.etapaAtual;
                        const isPending = etapa.id > selectedProcess.etapaAtual;

                        return (
                            <React.Fragment key={etapa.id}>
                                <div className={`timeline-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}>
                                    <span className="step-number">0{etapa.id}</span>
                                    <div className="step-icon">
                                        {etapa.icone}
                                    </div>
                                    <h4 className="step-title">{etapa.titulo}</h4>
                                    <span className="step-responsible">{etapa.responsavel}</span>
                                    {isActive && <div className="active-badge">ATIVO</div>}
                                </div>
                                {index < ETAPAS.length - 1 && (
                                    <div className="timeline-connector">
                                        <ChevronRight size={16} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="monitoramento-container list-view">
            <h1 className="page-title">Monitoramento de Processos</h1>
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
                        {filteredProcessos.map(processo => (
                            <div key={processo.id} className="process-card" onClick={() => setSelectedProcess(processo)}>
                                <div className="process-info">
                                    <span className="process-tag">{processo.os}</span>
                                    <h3 className="process-title">{processo.cliente}</h3>
                                    <span className="process-client">{processo.equipamento}</span>
                                </div>
                                <div className="process-status-wrapper">
                                    <span className={`status-badge ${processo.statusTexto.toLowerCase().replace(/ /g, '-')}`}>
                                        {processo.statusTexto}
                                    </span>
                                    <ChevronRight size={20} color="#cbd5e0" />
                                </div>
                            </div>
                        ))}
                        {filteredProcessos.length === 0 && (
                            <div className="no-results">Nenhum processo encontrado.</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
