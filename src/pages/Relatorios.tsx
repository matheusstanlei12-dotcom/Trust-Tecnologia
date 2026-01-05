import React, { useState, useEffect } from 'react';
import { Search, FileText, Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportTemplate } from '../components/ReportTemplate';
import { supabase } from '../lib/supabase';
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
    setor?: string;
    itens?: any[];
}

export const Relatorios: React.FC = () => {
    const [peritagens, setPeritagens] = useState<Peritagem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [fullReportData, setFullReportData] = useState<any>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);

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

        try {
            // Buscar Itens
            const { data: itens } = await supabase
                .from('peritagem_itens')
                .select('*')
                .eq('peritagem_id', peritagem.id)
                .eq('selecionado', true);

            // Buscar Vedações (opcional se for incluir no relatório)
            // const { data: vedacoes } = await supabase...

            const reportData = {
                laudoNum: peritagem.numero_peritagem,
                data: new Date(peritagem.data_execucao).toLocaleDateString('pt-BR'),
                hora: new Date(peritagem.data_execucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                area: 'OFICINA', // Fixo ou vir do banco se tiver campo
                linha: 'GERAL',
                equipamento: peritagem.equipamento || 'CILINDRO HIDRÁULICO',
                tag: 'N/A',
                material: 'AÇO INDUSTRIAL',
                desenho: 'N/A',
                cliente: peritagem.cliente,
                os: peritagem.os,
                notaFiscal: peritagem.nota_fiscal,
                itens: itens?.map((i: any) => ({
                    id: i.item_id,
                    desc: i.descricao,
                    especificacao: i.dimensoes || '-',
                    quantidade: i.qtd || '1',
                    avaria: 'DESGASTE NATURAL', // Pode virar campo no futuro
                    recuperacao: 'SUBSTITUIÇÃO/RECUPERAÇÃO'
                })) || []
            };

            setFullReportData(reportData);
        } catch (err) {
            console.error('Erro ao preparar dados do relatório:', err);
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
                        placeholder="Buscar peritagem por cliente ou ID..."
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
                                    {p.cliente} <span className="report-id">#{p.numero_peritagem}</span>
                                </h3>
                                <span className="report-details">Data: {new Date(p.data_execucao).toLocaleDateString('pt-BR')}</span>
                                <span className={`status-badge small ${p.status.toLowerCase().replace(/ /g, '-')}`}>{p.status}</span>
                            </div>

                            <div className="report-actions">
                                <div onClick={() => handleGenerateData(p)}>
                                    {(selectedId === p.id && fullReportData) ? (
                                        <PDFDownloadLink
                                            document={<ReportTemplate data={fullReportData} />}
                                            fileName={`PERITAGEM_${fullReportData.laudoNum}.pdf`}
                                            className="pdf-download-link"
                                        >
                                            {/* @ts-ignore */}
                                            {({ loading: pdfLoading }) => (
                                                <button className="btn-outline" disabled={pdfLoading}>
                                                    <FileText size={18} />
                                                    <span>{pdfLoading ? '...' : 'PDF Peritagem'}</span>
                                                </button>
                                            )}
                                        </PDFDownloadLink>
                                    ) : (
                                        <button className="btn-outline" disabled={generatingPdf && selectedId === p.id}>
                                            <FileText size={18} />
                                            <span>PDF Peritagem</span>
                                        </button>
                                    )}
                                </div>

                                <div onClick={() => handleGenerateData(p)}>
                                    {(selectedId === p.id && fullReportData) ? (
                                        <PDFDownloadLink
                                            document={<ReportTemplate data={fullReportData} />}
                                            fileName={`LAUDO_${fullReportData.laudoNum}.pdf`}
                                            className="pdf-download-link"
                                        >
                                            {/* @ts-ignore */}
                                            {({ loading: pdfLoading }) => (
                                                <button className="btn-primary" style={{ width: 'auto' }} disabled={pdfLoading}>
                                                    <Download size={18} />
                                                    <span>{pdfLoading ? 'Gerando...' : 'PDF para o Cliente'}</span>
                                                </button>
                                            )}
                                        </PDFDownloadLink>
                                    ) : (
                                        <button className="btn-primary" style={{ width: 'auto' }} disabled={generatingPdf && selectedId === p.id}>
                                            {generatingPdf && selectedId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                            <span>PDF para o Cliente</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filteredPeritagens.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#718096' }}>Nenhuma peritagem encontrada.</p>
                )}
            </div>
        </div>
    );
};
