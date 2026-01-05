import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Camera, X, CheckCircle, AlertCircle, Save, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './NovaPeritagem.css';

type StatusColor = 'vermelho' | 'amarelo' | 'verde' | 'azul';

interface ChecklistItem {
    id: string;
    text: string;
    status: StatusColor;
    conformidade: 'conforme' | 'não conforme' | null;
    anomalia: string;
    solucao: string;
    fotos: string[];
}

const HIDRAULICO_CHECKLIST = [
    "Vazamento de óleo externo?",
    "Vazamento interno (perda de força)?",
    "Haste com riscos, empeno ou corrosão?",
    "Vedações danificadas ou ressecadas?",
    "Camisa com desgaste ou riscos?",
    "Êmbolo corretamente fixado?",
    "Óleo contaminado?",
    "Movimento irregular?",
    "Ruídos anormais?",
    "Pressão fora do especificado?",
    "Mangueiras/conexões com falhas?",
    "Fixações mecânicas comprometidas?"
];

const PNEUMATICO_CHECKLIST = [
    "Vazamento de ar?",
    "Perda de força no curso?",
    "Haste desgastada ou empenada?",
    "Vedações danificadas?",
    "Movimento irregular?",
    "Retorno incompleto?",
    "Conexões soltas?",
    "Pressão inadequada?",
    "Umidade excessiva?",
    "Amortecimento ineficiente?",
    "Fixações soltas?",
    "Resposta lenta aos comandos?"
];

const COMPONENTES = [
    "Êmbolo", "Haste", "Camisa", "Vedações", "Anel guia",
    "Anel retentor", "Olhal superior", "Olhal inferior",
    "Rótula", "Pino graxeiro", "Cabeçote da guia"
];

export const NovaPeritagem: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Seleção, 1: Formulário

    // Pergunta Inicial
    const [cylinderType, setCylinderType] = useState<'Hidráulico' | 'Pneumático' | null>(null);

    // Campos Fixos
    const [fixedData, setFixedData] = useState({
        tag: '',
        local_equipamento: '',
        data_inspecao: new Date().toISOString().split('T')[0],
        responsavel_tecnico: '',
        cliente: ''
    });

    // Dimensões
    const [dimensions, setDimensions] = useState({
        diametroInterno: '',
        diametroHaste: '',
        curso: '',
        comprimentoTotal: '',
        montagem: '',
        pressaoNominal: '',
        fabricanteModelo: ''
    });
    const [dimStatus, setDimStatus] = useState<StatusColor>('vermelho');

    // Checklist
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);

    // Quando mudar o tipo de cilindro, inicializa o checklist
    useEffect(() => {
        if (cylinderType) {
            const list = cylinderType === 'Hidráulico' ? HIDRAULICO_CHECKLIST : PNEUMATICO_CHECKLIST;
            setChecklistItems(list.map(text => ({
                id: crypto.randomUUID(),
                text,
                status: 'vermelho',
                conformidade: null,
                anomalia: '',
                solucao: '',
                fotos: []
            })));
        }
    }, [cylinderType]);

    // Lógica de Autoload por TAG
    useEffect(() => {
        const fetchLastTagData = async () => {
            if (fixedData.tag.length >= 3) {
                const { data, error } = await supabase
                    .from('peritagens')
                    .select('*')
                    .eq('tag', fixedData.tag)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && !error) {
                    setDimensions({
                        diametroInterno: data.camisa_int || '',
                        diametroHaste: data.haste_diam || '',
                        curso: data.curso || '',
                        comprimentoTotal: data.camisa_comp || '',
                        montagem: data.montagem || '',
                        pressaoNominal: data.pressao_nominal || '',
                        fabricanteModelo: data.fabricante_modelo || ''
                    });
                    setDimStatus('verde');
                    setFixedData(prev => ({ ...prev, local_equipamento: data.local_equipamento || prev.local_equipamento, cliente: data.cliente || prev.cliente }));
                } else if (fixedData.tag.length > 0) {
                    setDimStatus('amarelo');
                }
            }
        };
        fetchLastTagData();
    }, [fixedData.tag]);

    const handleChecklistItemClick = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Se ainda for vermelho, vira amarelo (clicou mas não respondeu)
                const newStatus = item.status === 'vermelho' ? 'amarelo' : item.status;
                return { ...item, status: newStatus };
            }
            return item;
        }));
    };

    const handleResponse = (itemId: string, conformidade: 'conforme' | 'não conforme') => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, conformidade, status: 'verde' };
            }
            return item;
        }));
    };

    const updateItemDetails = (itemId: string, field: 'anomalia' | 'solucao' | 'fotos' | 'text', value: any) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Se estiver alterando o texto de um componente novo, vira amarelo
                const newStatus = field === 'text' && item.status === 'vermelho' ? 'amarelo' : item.status;
                return { ...item, [field]: value, status: newStatus };
            }
            return item;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const timestamp = new Date().getTime().toString().slice(-4);
            const numeroPeritagem = `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${timestamp}`;

            // 1. Salvar Peritagem
            const { data: peritagem, error: pError } = await supabase
                .from('peritagens')
                .insert([{
                    numero_peritagem: numeroPeritagem,
                    tag: fixedData.tag,
                    cliente: fixedData.cliente,
                    local_equipamento: fixedData.local_equipamento,
                    responsavel_tecnico: fixedData.responsavel_tecnico,
                    tipo_cilindro: cylinderType,
                    camisa_int: dimensions.diametroInterno,
                    haste_diam: dimensions.diametroHaste,
                    curso: dimensions.curso,
                    camisa_comp: dimensions.comprimentoTotal,
                    montagem: dimensions.montagem,
                    pressao_nominal: dimensions.pressaoNominal,
                    fabricante_modelo: dimensions.fabricanteModelo,
                    criado_por: user?.id,
                    status: 'AGUARDANDO APROVAÇÃO DO PCP'
                }])
                .select()
                .single();

            if (pError) throw pError;

            // 2. Salvar Itens do Checklist
            const analyses = checklistItems
                .filter(item => item.conformidade !== null)
                .map(item => ({
                    peritagem_id: peritagem.id,
                    componente: item.text,
                    conformidade: item.conformidade,
                    anomalias: item.anomalia,
                    solucao: item.solucao,
                    fotos: item.fotos,
                    status_indicador: 'azul'
                }));

            if (analyses.length > 0) {
                const { error: aError } = await supabase
                    .from('peritagem_analise_tecnica')
                    .insert(analyses);
                if (aError) throw aError;
            }

            // Atualizar status local para azul
            setChecklistItems(prev => prev.map(item => ({ ...item, status: 'azul' })));
            setDimStatus('azul');

            alert('Peritagem salva e registrada no histórico!');
            navigate('/peritagens');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar peritagem: ' + (err.message || 'Erro interno'));
        } finally {
            setLoading(false);
        }
    };

    const renderIndicator = (status: StatusColor) => {
        const colors = {
            vermelho: '#ff4d4d',
            amarelo: '#ffcc00',
            verde: '#27ae60',
            azul: '#2980b9'
        };
        return <div className="status-dot" style={{ backgroundColor: colors[status] }} />;
    };

    if (step === 0) {
        return (
            <div className="nova-peritagem-container start-screen">
                <div className="selection-card">
                    <h2>Selecione o Tipo de Cilindro</h2>
                    <p>Inicie o formulário de peritagem escolhendo a tecnologia do equipamento.</p>
                    <div className="type-options">
                        <button className={`type-btn ${cylinderType === 'Hidráulico' ? 'active' : ''}`} onClick={() => setCylinderType('Hidráulico')}>
                            Cilindro Hidráulico
                        </button>
                        <button className={`type-btn ${cylinderType === 'Pneumático' ? 'active' : ''}`} onClick={() => setCylinderType('Pneumático')}>
                            Cilindro Pneumático
                        </button>
                    </div>
                    {cylinderType && (
                        <button className="btn-start" onClick={() => setStep(1)}>
                            Avançar para Formulário
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="nova-peritagem-container">
            <header className="header-sticky">
                <div className="header-content">
                    <button className="btn-back-circle" onClick={() => setStep(0)}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="title-group">
                        <h1 className="page-title">Peritagem - {cylinderType}</h1>
                        <span className="subtitle">Preencha os dados técnicos abaixo</span>
                    </div>
                </div>
                <div className="header-actions-top">
                    <button className="btn-save-top" onClick={handleSubmit} disabled={loading}>
                        <Save size={20} />
                        {loading ? 'Salvando...' : 'Salvar Peritagem'}
                    </button>
                </div>
            </header>

            <form className="peritagem-dynamic-form" onSubmit={handleSubmit}>
                {/* CAMPOS FIXOS */}
                <section className="form-card">
                    <div className="card-header">
                        <CheckCircle size={20} color="#2980b9" />
                        <h3>Identificação do Equipamento</h3>
                    </div>
                    <div className="grid-form">
                        <div className="form-group">
                            <label>TAG DO CILINDRO *</label>
                            <input
                                required
                                placeholder="Digite a TAG..."
                                value={fixedData.tag}
                                onChange={e => setFixedData({ ...fixedData, tag: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="form-group">
                            <label>LOCAL / EQUIPAMENTO</label>
                            <input
                                placeholder="Ex: Prensa 01"
                                value={fixedData.local_equipamento}
                                onChange={e => setFixedData({ ...fixedData, local_equipamento: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>CLIENTE</label>
                            <input
                                placeholder="Nome do Cliente"
                                value={fixedData.cliente}
                                onChange={e => setFixedData({ ...fixedData, cliente: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>RESPONSÁVEL TÉCNICO</label>
                            <input
                                placeholder="Nome do Responsável"
                                value={fixedData.responsavel_tecnico}
                                onChange={e => setFixedData({ ...fixedData, responsavel_tecnico: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* DIMENSÕES */}
                <section className="form-card dimensions-section">
                    <div className="card-header">
                        {renderIndicator(dimStatus)}
                        <h3>Dimensões do Cilindro</h3>
                        <span className="auto-msg">Autoload por TAG habilitado</span>
                    </div>
                    <div className="grid-dimensions">
                        <div className="dim-group">
                            <label>Ø Interno (mm)</label>
                            <input type="text" value={dimensions.diametroInterno} onChange={e => { setDimensions({ ...dimensions, diametroInterno: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                        <div className="dim-group">
                            <label>Ø Haste (mm)</label>
                            <input type="text" value={dimensions.diametroHaste} onChange={e => { setDimensions({ ...dimensions, diametroHaste: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                        <div className="dim-group">
                            <label>Curso (mm)</label>
                            <input type="text" value={dimensions.curso} onChange={e => { setDimensions({ ...dimensions, curso: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                        <div className="dim-group">
                            <label>Comp. Total (mm)</label>
                            <input type="text" value={dimensions.comprimentoTotal} onChange={e => { setDimensions({ ...dimensions, comprimentoTotal: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                        <div className="dim-group">
                            <label>Montagem</label>
                            <select value={dimensions.montagem} onChange={e => { setDimensions({ ...dimensions, montagem: e.target.value }); setDimStatus('verde'); }}>
                                <option value="">Selecione...</option>
                                <option value="Flange Dianteira">Flange Dianteira</option>
                                <option value="Flange Traseira">Flange Traseira</option>
                                <option value="Munhão Central">Munhão Central</option>
                                <option value="Pés Lateral">Pés Lateral</option>
                                <option value="Olhal Traseiro">Olhal Traseiro</option>
                            </select>
                        </div>
                        <div className="dim-group">
                            <label>Pressão Nominal</label>
                            <input type="text" value={dimensions.pressaoNominal} onChange={e => { setDimensions({ ...dimensions, pressaoNominal: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                        <div className="dim-group full-width">
                            <label>Fabricante / Modelo</label>
                            <input type="text" value={dimensions.fabricanteModelo} onChange={e => { setDimensions({ ...dimensions, fabricanteModelo: e.target.value }); setDimStatus('verde'); }} />
                        </div>
                    </div>
                </section>

                {/* CHECKLIST TÉCNICO */}
                <section className="form-card">
                    <div className="card-header">
                        <AlertCircle size={20} color="#f39c12" />
                        <h3>Checklist Técnico de Inspeção</h3>
                    </div>
                    <div className="checklist-items">
                        {checklistItems.map((item) => (
                            <div key={item.id} className="checklist-row" onClick={() => handleChecklistItemClick(item.id)}>
                                <div className="row-main">
                                    <div className="item-info">
                                        {renderIndicator(item.status)}
                                        {COMPONENTES.includes(item.text) || item.text === 'Selecione o componente...' ? (
                                            <select
                                                className="item-select"
                                                value={item.text}
                                                onChange={(e) => updateItemDetails(item.id, 'text', e.target.value)}
                                            >
                                                <option disabled value="Selecione o componente...">Selecione o componente...</option>
                                                {COMPONENTES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <span className="item-text">{item.text}</span>
                                        )}
                                    </div>
                                    <div className="conformity-toggle">
                                        <button
                                            type="button"
                                            className={`conf-btn conforme ${item.conformidade === 'conforme' ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleResponse(item.id, 'conforme'); }}
                                        >
                                            Conforme
                                        </button>
                                        <button
                                            type="button"
                                            className={`conf-btn nao-conforme ${item.conformidade === 'não conforme' ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleResponse(item.id, 'não conforme'); }}
                                        >
                                            Não Conforme
                                        </button>
                                    </div>
                                </div>

                                {item.conformidade === 'não conforme' && (
                                    <div className="non-conformity-block slide-in" onClick={(e) => e.stopPropagation()}>
                                        <div className="analysis-inputs">
                                            <div className="input-field">
                                                <label>Anomalia encontrada</label>
                                                <textarea
                                                    placeholder="Descreva o defeito..."
                                                    value={item.anomalia}
                                                    onChange={(e) => updateItemDetails(item.id, 'anomalia', e.target.value)}
                                                />
                                            </div>
                                            <div className="input-field">
                                                <label>Solução recomendada</label>
                                                <textarea
                                                    placeholder="O que deve ser feito?"
                                                    value={item.solucao}
                                                    onChange={(e) => updateItemDetails(item.id, 'solucao', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="photo-section">
                                            <div className="photo-grid">
                                                {item.fotos.map((foto, idx) => (
                                                    <div key={idx} className="photo-preview">
                                                        <img src={foto} alt={`Anomalia ${idx}`} />
                                                        <button type="button" className="btn-remove-photo" onClick={() => {
                                                            const newPhotos = item.fotos.filter((_, i) => i !== idx);
                                                            updateItemDetails(item.id, 'fotos', newPhotos);
                                                        }}><X size={14} /></button>
                                                    </div>
                                                ))}
                                                <div className="photo-upload-actions">
                                                    <button type="button" className="btn-action-photo camera">
                                                        <Camera size={20} />
                                                        <span>Câmera</span>
                                                    </button>
                                                    <button type="button" className="btn-action-photo gallery">
                                                        <Plus size={20} />
                                                        <span>Galeria</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ITENS INSPECIONÁVEIS ADICIONAIS */}
                <section className="form-card">
                    <div className="card-header">
                        <Info size={20} color="#7f8c8d" />
                        <h3>Análise por Componente</h3>
                    </div>
                    <p className="section-instruction">Selecione componentes específicos para detalhamento adicional.</p>
                    <button type="button" className="btn-add-comp" onClick={() => {
                        const newItem: ChecklistItem = {
                            id: crypto.randomUUID(),
                            text: 'Selecione o componente...',
                            status: 'vermelho',
                            conformidade: null,
                            anomalia: '',
                            solucao: '',
                            fotos: []
                        };
                        setChecklistItems([...checklistItems, newItem]);
                    }}>
                        <Plus size={18} /> Adicionar Componente
                    </button>
                </section>

                <div className="footer-actions">
                    <button type="submit" className="btn-finalize" disabled={loading}>
                        {loading ? 'Processando...' : 'Finalizar e Registrar Peritagem'}
                    </button>
                </div>
            </form>
        </div>
    );
};
