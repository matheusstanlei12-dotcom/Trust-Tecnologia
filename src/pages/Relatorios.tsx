import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { UsiminasReportTemplate } from '../components/UsiminasReportTemplate';
import { ReportTemplate } from '../components/ReportTemplate';
import { supabase } from '../lib/supabase';
import { generateTechnicalOpinion } from '../lib/reportUtils';
import './Relatorios.css';

interface Peritagem {
    id: string;
    numero_peritagem: string;
    cliente: string;
    data_execucao: string;
    status: string;
    // Dados completos para o relatório
    os?: string;
    ordem_servico?: string;
    nota_fiscal?: string;
    equipamento?: string;
    tag?: string;
    tipo_cilindro?: string;
    camisa_int?: string;
    haste_diam?: string;
    curso?: string;
    camisa_comp?: string;
    setor?: string;
    local_equipamento?: string;
    responsavel_tecnico?: string;
    ni?: string;
    numero_pedido?: string;
    camisa_ext?: string;
    haste_comp?: string;
    foto_frontal?: string;
    desenho_conjunto?: string;
    tipo_modelo?: string;
    fabricante?: string;
    lubrificante?: string;
    volume?: string;
    acoplamento_polia?: string;
    sistema_lubrificacao?: string;
    outros_especificar?: string;
    observacoes_gerais?: string;
    itens?: any[];
}

export const Relatorios: React.FC = () => {
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [fullReportData, setFullReportData] = useState<any>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [showParecerModal, setShowParecerModal] = useState(false);
    const [currentParecer, setCurrentParecer] = useState('');

    useEffect(() => {
        fetchPeritagens();
    }, []);

    const fetchPeritagens = async () => {
        try {
            const { data, error } = await supabase
                .from('peritagens')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPeritagens(data || []);
        } catch (err) {
            console.error('Erro ao buscar peritagens:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateData = async (peritagem: Peritagem) => {
        if (selectedId === peritagem.id && fullReportData) return; // Já carregado

        setGeneratingPdf(true);
        setSelectedId(peritagem.id);
        setFullReportData(null);

        try {
            // Buscar Análise Técnica (Checklist para o PDF)
            const { data: analise } = await supabase
                .from('peritagem_analise_tecnica')
                .select('*')
                .eq('peritagem_id', peritagem.id);

            const parecer = generateTechnicalOpinion(peritagem as any, analise || []);

            const reportData = {
                laudoNum: String(peritagem.numero_peritagem || ''),
                numero_os: String(peritagem.numero_peritagem || ''),
                data: peritagem.data_execucao ? new Date(peritagem.data_execucao).toLocaleDateString('pt-BR') : '',
                hora: peritagem.data_execucao ? new Date(peritagem.data_execucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                area: String(peritagem.setor || 'GERAL'),
                linha: String(peritagem.local_equipamento || 'OFICINA'),
                local_equipamento: String(peritagem.local_equipamento || 'OFICINA'),
                equipamento: String(peritagem.equipamento || 'CILINDRO HIDRÁULICO'),
                tag: String(peritagem.tag || 'N/A'),
                material: 'AÇO INDUSTRIAL',
                desenho: 'N/A',
                cliente: String(peritagem.cliente || ''),
                nota_fiscal: String(peritagem.nota_fiscal || ''),
                ni: String(peritagem.ni || ''),
                pedido: String(peritagem.numero_pedido || ''),
                camisa_ext: String(peritagem.camisa_ext || ''),
                haste_comp: String(peritagem.haste_comp || ''),
                camisa_int: String(peritagem.camisa_int || ''),
                camisa_comp: String(peritagem.camisa_comp || ''),
                haste_diam: String(peritagem.haste_diam || ''),
                curso: String(peritagem.curso || ''),
                responsavel_tecnico: String(peritagem.responsavel_tecnico || ''),
                logo_trusteng: '/logo.png',
                itens: (analise || [])
                    .filter((i: any) => i.conformidade === 'não conforme')
                    .map((i: any, idx: number) => ({
                        id: idx + 1,
                        desc: String(i.componente || ''),
                        especificacao: '-',
                        quantidade: String(i.qtd || '1'),
                        avaria: String(i.anomalias || ''),
                        recuperacao: String(i.solucao || ''),
                        conformidade: String(i.conformidade || 'conforme'),
                        diametro_encontrado: i.diametro_encontrado,
                        diametro_ideal: i.diametro_ideal,
                        material_faltante: i.material_faltante,
                        foto: i.fotos && i.fotos.length > 0 ? i.fotos[0] : undefined
                    })),
                items: (analise || [])
                    .filter((i: any) => i.tipo !== 'vedação' && i.conformidade === 'não conforme')
                    .map((i: any, idx: number) => ({
                        id: idx + 1,
                        descricao: String(i.componente || ''),
                        qtd: String(i.qtd || '1'),
                        dimensoes: String(i.dimensoes || '-'),
                        conformidade: String(i.conformidade || ''),
                        selecionado: i.conformidade === 'não conforme',
                        diametro_encontrado: i.diametro_encontrado,
                        diametro_ideal: i.diametro_ideal,
                        material_faltante: i.material_faltante,
                        anomalias: i.anomalias,
                        solucao: i.solucao,
                        fotos: i.fotos || []
                    })),
                vedacoes: (analise || [])
                    .filter((i: any) => i.tipo === 'vedação' && i.conformidade === 'não conforme')
                    .map((i: any) => ({
                        descricao: String(i.componente || ''),
                        qtd: String(i.qtd || '1'),
                        unidade: 'UN',
                        observacao: String(i.anomalias || ''),
                        conformidade: String(i.conformidade || 'não conforme'),
                        selecionado: true
                    })),
                parecer_tecnico: String(parecer || ''),
                parecerTecnico: String(parecer || ''),
                foto_frontal: peritagem.foto_frontal,
                desenho_conjunto: String(peritagem.desenho_conjunto || '-'),
                tipo_modelo: String(peritagem.tipo_modelo || '-'),
                fabricante: String(peritagem.fabricante || '-'),
                lubrificante: String(peritagem.lubrificante || '-'),
                volume: String(peritagem.volume || '-'),
                acoplamento_polia: String(peritagem.acoplamento_polia || 'NÃO'),
                sistema_lubrificacao: String(peritagem.sistema_lubrificacao || 'NÃO'),
                outros_especificar: String(peritagem.outros_especificar || '-'),
                observacoes_gerais: String(peritagem.observacoes_gerais || '-')
            };

            setFullReportData(reportData);
            return reportData;
        } catch (err) {
            console.error('Erro ao preparar dados do relatório:', err);
            alert('Erro ao buscar dados da peritagem. Verifique sua conexão ou contate o suporte.');
            return null;
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handleDownloadPdf = async (peritagem: Peritagem, type: 'peritagem' | 'laudo') => {
        setGeneratingPdf(true);
        setSelectedId(peritagem.id);

        try {
            const data = await handleGenerateData(peritagem);
            if (!data) return;

            const isUsiminas = data.cliente && data.cliente.toUpperCase().includes('USIMINAS');
            const template = isUsiminas
                ? <UsiminasReportTemplate data={data} />
                : <ReportTemplate data={data} />;

            const blob = await pdf(template).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            let fileName = '';
            // Se for Usiminas, usa prefixo específico. Caso contrário, padrão.
            // O usuário pediu "Peritagem Usiminas" para o relatório Usiminas.
            if (isUsiminas) {
                fileName = `Peritagem Usiminas_${data.laudoNum}.pdf`;
            } else {
                fileName = type === 'peritagem'
                    ? `PERITAGEM_${data.laudoNum}.pdf`
                    : `LAUDO_${data.laudoNum}.pdf`;
            }

            link.download = fileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao baixar PDF:', err);
            alert('Erro ao gerar o arquivo PDF. Tente novamente.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const filteredPeritagens = peritagens.filter(p =>
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_peritagem.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relatorios-container">
            <h1 className="page-title">Central de Relatórios PDF</h1>

            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={20} color="#718096" />
                    <input
                        type="text"
                        placeholder="Buscar OS por cliente ou número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="report-list">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                        <p>Carregando...</p>
                    </div>
                ) : (
                    filteredPeritagens.map(p => (
                        <div key={p.id} className="report-card">
                            <div className="report-info">
                                <h3 className="report-title">
                                    {p.cliente} <span className="report-id">O.S: {p.numero_peritagem}</span>
                                </h3>
                                <span className="report-details">Data: {new Date(p.data_execucao).toLocaleDateString('pt-BR')}</span>
                                <span className={`status-badge small ${p.status.toLowerCase().replace(/ /g, '-')}`}>{p.status}</span>
                            </div>

                            <div className="report-actions">
                                <button
                                    className="btn-outline"
                                    onClick={() => handleDownloadPdf(p, 'peritagem')}
                                    disabled={generatingPdf && selectedId === p.id}
                                >
                                    {generatingPdf && selectedId === p.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                    <span>PDF Peritagem</span>
                                </button>

                                <button
                                    className="btn-primary"
                                    style={{ width: 'auto' }}
                                    onClick={() => handleDownloadPdf(p, 'laudo')}
                                    disabled={generatingPdf && selectedId === p.id}
                                >
                                    {generatingPdf && selectedId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                    <span>{generatingPdf && selectedId === p.id ? 'Gerando...' : 'PDF para o Cliente'}</span>
                                </button>

                                <button
                                    className="btn-outline"
                                    style={{ width: 'auto' }}
                                    onClick={async () => {
                                        const { data: analise } = await supabase
                                            .from('peritagem_analise_tecnica')
                                            .select('*')
                                            .eq('peritagem_id', p.id);
                                        const text = generateTechnicalOpinion(p as any, analise || []);
                                        setCurrentParecer(text);
                                        setShowParecerModal(true);
                                    }}
                                >
                                    <span>Ver Parecer</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filteredPeritagens.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#718096' }}>Nenhuma peritagem encontrada.</p>
                )}
            </div>

            {showParecerModal && (
                <div className="modal-overlay" onClick={() => setShowParecerModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Parecer Técnico Automático</h2>
                            <button className="close-btn" onClick={() => setShowParecerModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <pre className="parecer-text">{currentParecer}</pre>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => {
                                navigator.clipboard.writeText(currentParecer);
                                alert('Texto copiado para a área de transferência!');
                            }}>Copiar Texto</button>
                            <button className="btn-outline" onClick={() => setShowParecerModal(false)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
