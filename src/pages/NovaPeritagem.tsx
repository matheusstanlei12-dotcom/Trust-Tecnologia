import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Camera, X, CheckCircle, AlertCircle, Save, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { USIMINAS_ITEMS } from '../constants/usiminasItems';
import { STANDARD_ITEMS } from '../constants/standardItems';
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
    dimensoes?: string;
    qtd?: string;
    tipo?: 'componente' | 'vedação';
    unidade?: string;
    observacao?: string;
    diametro_encontrado?: string;
    diametro_ideal?: string;
    material_faltante?: string;
    // Novos campos dimensionais padronizados
    diametro_externo_encontrado?: string;
    diametro_externo_especificado?: string;
    desvio_externo?: string;
    diametro_interno_encontrado?: string;
    diametro_interno_especificado?: string;
    desvio_interno?: string;
    comprimento_encontrado?: string;
    comprimento_especificado?: string;
    desvio_comprimento?: string;
}

const COMPONENTES = [
    "Êmbolo", "Haste", "Camisa", "Vedações", "Anel guia",
    "Anel retentor", "Olhal superior", "Olhal inferior",
    "Rótula", "Pino graxeiro", "Cabeçote da guia"
];

export const NovaPeritagem: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0); // 0: Seleção, 1: Formulário
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const camInputRef = React.useRef<HTMLInputElement>(null);
    const galleryInputRef = React.useRef<HTMLInputElement>(null);

    // Pergunta Inicial
    const [cylinderType, setCylinderType] = useState<'Cilindros' | null>(null);

    // Campos Fixos
    const [fixedData, setFixedData] = useState({
        tag: '',
        local_equipamento: '',
        data_inspecao: new Date().toISOString().split('T')[0],
        responsavel_tecnico: '',
        cliente: '',
        numero_os: '',
        ni: '',
        pedido: '',
        ordem: '',
        nota_fiscal: '',
        // Novos campos conforme imagem do formulário
        desenho_conjunto: '',
        tipo_modelo: '',
        fabricante: '',
        lubrificante: '',
        volume: '',
        acoplamento_polia: '',
        sistema_lubrificacao: '',
        outros_especificar: '',
        observacoes_gerais: ''
    });

    // Dimensões
    const [dimensions, setDimensions] = useState({
        diametroInterno: '',
        diametroHaste: '',
        curso: '',
        comprimentoTotal: '',
        diametroExterno: '',
        comprimentoHaste: '',
        montagem: '',
        pressaoNominal: '',
        fabricanteModelo: ''
    });
    const [dimStatus, setDimStatus] = useState<StatusColor>('vermelho');
    const [fotoFrontal, setFotoFrontal] = useState<string>('');
    const frontalPhotoRef = React.useRef<HTMLInputElement>(null);

    // Checklist
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
    const [vedacoes, setVedacoes] = useState<ChecklistItem[]>([]);

    // Quando mudar o tipo de cilindro, inicializa o checklist
    useEffect(() => {
        if (cylinderType) {
            let list = [];
            if (fixedData.cliente === 'USIMINAS') {
                list = USIMINAS_ITEMS;
            } else {
                list = STANDARD_ITEMS;
            }

            setChecklistItems(list.map((text, index) => {
                // Itens 79, 80 e 81 do padrão têm Qtd 1 por padrão
                const isDefaultService = !fixedData.cliente.includes('USIMINAS') && index >= 78;

                return {
                    id: crypto.randomUUID(),
                    text,
                    status: 'vermelho',
                    conformidade: isDefaultService ? 'conforme' : null,
                    anomalia: '',
                    solucao: '',
                    fotos: [],
                    dimensoes: '',
                    qtd: '',
                    tipo: 'componente'
                };
            }));

            // Inicializa 10 linhas de vedações para padrão, vazio para USIMINAS
            if (fixedData.cliente !== 'USIMINAS') {
                const emptyVedacoes = Array.from({ length: 10 }).map(() => ({
                    id: crypto.randomUUID(),
                    text: '',
                    qtd: '',
                    unidade: 'PC',
                    status: 'azul' as StatusColor,
                    conformidade: 'não conforme' as 'não conforme',
                    anomalia: '',
                    solucao: '',
                    fotos: [],
                    observacao: '',
                    tipo: 'vedação' as 'vedação'
                }));
                setVedacoes(emptyVedacoes);
            } else {
                setVedacoes([]);
            }
        }
    }, [cylinderType, fixedData.cliente]);

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
                        diametroExterno: data.camisa_ext || '',
                        comprimentoHaste: data.haste_comp || '',
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

    const handleResetItem = (itemId: string) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, conformidade: null, status: 'vermelho' };
            }
            return item;
        }));
    };

    const updateItemDetails = (itemId: string, field: 'anomalia' | 'solucao' | 'fotos' | 'text' | 'dimensoes' | 'qtd' | 'diametro_encontrado' | 'diametro_ideal' | 'material_faltante' | 'diametro_externo_encontrado' | 'diametro_externo_especificado' | 'desvio_externo' | 'diametro_interno_encontrado' | 'diametro_interno_especificado' | 'desvio_interno' | 'comprimento_encontrado' | 'comprimento_especificado' | 'desvio_comprimento', value: any) => {
        setChecklistItems(prev => prev.map(item => {
            if (item.id === itemId) {
                // Se estiver alterando o texto de um componente novo, vira amarelo
                const newStatus = field === 'text' && item.status === 'vermelho' ? 'amarelo' : item.status;
                return { ...item, [field]: value, status: newStatus };
            }
            return item;
        }));
    };

    const handlePhotoUpload = (itemId: string, mode: 'cam' | 'gallery') => {
        setEditingItemId(itemId);
        if (mode === 'cam') camInputRef.current?.click();
        else galleryInputRef.current?.click();
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingItemId) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                const currentItem = checklistItems.find(i => i.id === editingItemId);
                if (currentItem) {
                    const newPhotos = [...currentItem.fotos, base64String];
                    updateItemDetails(editingItemId, 'fotos', newPhotos);
                }
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!fotoFrontal) {
            alert('A foto frontal do equipamento é obrigatória!');
            setLoading(false);
            return;
        }

        if (!fixedData.cliente || !fixedData.numero_os || !fixedData.tag) {
            alert('Por favor, preencha os campos obrigatórios (*): Cliente, O.S e TAG.');
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const numeroPeritagem = fixedData.numero_os.toUpperCase();

            // 1. Salvar Peritagem
            const { data: peritagem, error: pError } = await supabase
                .from('peritagens')
                .insert([{
                    numero_peritagem: numeroPeritagem,
                    os: numeroPeritagem,
                    tag: fixedData.tag,
                    cliente: fixedData.cliente,
                    local_equipamento: fixedData.local_equipamento,
                    responsavel_tecnico: fixedData.responsavel_tecnico,
                    tipo_cilindro: cylinderType,
                    ni: fixedData.ni,
                    numero_pedido: fixedData.pedido,
                    ordem: fixedData.ordem,
                    nota_fiscal: fixedData.nota_fiscal,
                    camisa_int: dimensions.diametroInterno,
                    camisa_ext: dimensions.diametroExterno,
                    haste_diam: dimensions.diametroHaste,
                    haste_comp: dimensions.comprimentoHaste,
                    curso: dimensions.curso,
                    camisa_comp: dimensions.comprimentoTotal,
                    montagem: dimensions.montagem,
                    pressao_nominal: dimensions.pressaoNominal,
                    fabricante_modelo: dimensions.fabricanteModelo,
                    foto_frontal: fotoFrontal,
                    criado_por: user?.id,
                    status: 'AGUARDANDO APROVAÇÃO DO PCP',
                    // Novos campos de cabeçalho
                    desenho_conjunto: fixedData.desenho_conjunto,
                    lubrificante: fixedData.lubrificante,
                    volume: fixedData.volume,
                    acoplamento_polia: fixedData.acoplamento_polia,
                    sistema_lubrificacao: fixedData.sistema_lubrificacao,
                    outros_especificar: fixedData.outros_especificar,
                    observacoes_gerais: fixedData.observacoes_gerais,
                    fabricante: fixedData.fabricante,
                    tipo_modelo: fixedData.tipo_modelo
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
                    dimensoes: item.dimensoes,
                    qtd: item.qtd,
                    diametro_encontrado: item.diametro_encontrado,
                    diametro_ideal: item.diametro_ideal,
                    material_faltante: item.material_faltante,
                    tipo: item.tipo || 'componente',
                    status_indicador: 'azul'
                }));

            const analysesVedacoes = vedacoes
                .filter(item => item.text && item.text.trim() !== '')
                .map(item => ({
                    peritagem_id: peritagem.id,
                    componente: item.text,
                    conformidade: 'não conforme',
                    anomalias: item.observacao || '',
                    solucao: '',
                    fotos: [],
                    dimensoes: item.unidade || '',
                    qtd: item.qtd,
                    tipo: 'vedação',
                    status_indicador: 'azul'
                }));

            const allAnalyses = [...analyses, ...analysesVedacoes];

            if (allAnalyses.length > 0) {
                const { error: aError } = await supabase
                    .from('peritagem_analise_tecnica')
                    .insert(allAnalyses);
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
        return <div className="status-dot-animated" style={{ backgroundColor: colors[status], width: '14px', height: '14px' }} />;
    };

    if (step === 0) {
        return (
            <div className="nova-peritagem-container start-screen">
                <div className="selection-card">
                    <h2>Selecione o Tipo de Cilindro</h2>
                    <p>Inicie o formulário de peritagem escolhendo a tecnologia do equipamento.</p>
                    <div className="type-options">
                        <button className={`type-btn ${cylinderType === 'Cilindros' ? 'active' : ''}`} onClick={() => setCylinderType('Cilindros')}>
                            Cilindros
                        </button>
                        <div className="divider-or">ou atalho rápido</div>
                        <button
                            className="type-btn usiminas-btn"
                            onClick={() => {
                                setCylinderType('Cilindros');
                                setFixedData(prev => ({ ...prev, cliente: 'USIMINAS' }));
                                setStep(1);
                            }}
                        >
                            <span className="btn-label">Cliente Usiminas</span>
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
                {/* FOTO FRONTAL OBRIGATÓRIA */}
                <section className="form-card frontal-photo-section">
                    <div className="card-header">
                        <Camera size={20} color="#2980b9" />
                        <h3>Foto Frontal do Equipamento *</h3>
                    </div>
                    <div className="frontal-photo-upload" onClick={() => frontalPhotoRef.current?.click()}>
                        {fotoFrontal ? (
                            <div className="frontal-preview">
                                <img src={fotoFrontal} alt="Foto Frontal" />
                                <div className="change-photo-overlay">
                                    <Camera size={24} />
                                    <span>Alterar Foto</span>
                                </div>
                            </div>
                        ) : (
                            <div className="frontal-placeholder">
                                <Camera size={48} color="#bdc3c7" />
                                <p>Clique para capturar ou anexar a foto frontal</p>
                                <span>(Obrigatório)</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            ref={frontalPhotoRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setFotoFrontal(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                </section>

                <section className="form-card">
                    <div className="card-header main-card-header">
                        <CheckCircle className="header-icon-blue" />
                        <div className="header-titles">
                            <h3>FORMULÁRIO DE PERITAGEM</h3>
                            <span className="subtitle">CILINDROS HIDRÁULICOS E PNEUMÁTICOS | PÁG.: 1 DE 2</span>
                        </div>
                    </div>
                    <div className="grid-form">
                        {fixedData.cliente === 'USIMINAS' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%' }}>
                                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                    <label style={{ fontWeight: 'bold' }}>CLIENTE *</label>
                                    <input
                                        required
                                        placeholder="Nome do cliente..."
                                        value={fixedData.cliente}
                                        onChange={e => setFixedData({ ...fixedData, cliente: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>ORDEM DE SERVIÇO *</label>
                                    <input
                                        required
                                        placeholder="Ex: 1234"
                                        value={fixedData.numero_os}
                                        onChange={e => setFixedData({ ...fixedData, numero_os: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>NI</label>
                                    <input
                                        placeholder="Ex: NI-99"
                                        value={fixedData.ni}
                                        onChange={e => setFixedData({ ...fixedData, ni: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>PEDIDO</label>
                                    <input
                                        placeholder="Ex: P-123"
                                        value={fixedData.pedido}
                                        onChange={e => setFixedData({ ...fixedData, pedido: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>NF</label>
                                    <input
                                        placeholder="Ex: 9012"
                                        value={fixedData.nota_fiscal}
                                        onChange={e => setFixedData({ ...fixedData, nota_fiscal: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>TAG DO CILINDRO *</label>
                                    <input
                                        required
                                        placeholder="Digite a TAG..."
                                        value={fixedData.tag}
                                        onChange={e => setFixedData({ ...fixedData, tag: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 'bold' }}>LOCAL / EQUIPAMENTO</label>
                                    <input
                                        placeholder="Ex: Prensa 01"
                                        value={fixedData.local_equipamento}
                                        onChange={e => setFixedData({ ...fixedData, local_equipamento: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                                    <label style={{ fontWeight: 'bold' }}>RESPONSÁVEL TÉCNICO</label>
                                    <input
                                        placeholder="Nome do Responsável"
                                        value={fixedData.responsavel_tecnico}
                                        onChange={e => setFixedData({ ...fixedData, responsavel_tecnico: e.target.value })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', width: '100%' }}>
                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>CLIENTE *</label>
                                    <input
                                        required
                                        placeholder="Nome do cliente..."
                                        value={fixedData.cliente}
                                        onChange={e => setFixedData({ ...fixedData, cliente: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 'bold' }}>ORDEM DE SERVIÇO *</label>
                                        <input
                                            required
                                            placeholder="Ex: 1234"
                                            value={fixedData.numero_os}
                                            onChange={e => setFixedData({ ...fixedData, numero_os: e.target.value.toUpperCase() })}
                                            style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 'bold' }}>NF</label>
                                        <input
                                            placeholder="Ex: 9012"
                                            value={fixedData.nota_fiscal}
                                            onChange={e => setFixedData({ ...fixedData, nota_fiscal: e.target.value.toUpperCase() })}
                                            style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 'bold' }}>NI</label>
                                        <input
                                            placeholder="Ex: NI-99"
                                            value={fixedData.ni}
                                            onChange={e => setFixedData({ ...fixedData, ni: e.target.value.toUpperCase() })}
                                            style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>DESENHO DE CONJUNTO</label>
                                    <input
                                        placeholder="Referência do desenho..."
                                        value={fixedData.desenho_conjunto}
                                        onChange={e => setFixedData({ ...fixedData, desenho_conjunto: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>TIPO/MODELO</label>
                                    <input
                                        placeholder="Ex: H-123"
                                        value={fixedData.tipo_modelo}
                                        onChange={e => setFixedData({ ...fixedData, tipo_modelo: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>FABRICANTE</label>
                                    <input
                                        placeholder="Fabricante..."
                                        value={fixedData.fabricante}
                                        onChange={e => setFixedData({ ...fixedData, fabricante: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>LUBRIFICANTE</label>
                                    <input
                                        placeholder="Óleo, Graxa..."
                                        value={fixedData.lubrificante}
                                        onChange={e => setFixedData({ ...fixedData, lubrificante: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>VOLUME</label>
                                    <input
                                        placeholder="Volume..."
                                        value={fixedData.volume}
                                        onChange={e => setFixedData({ ...fixedData, volume: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>RECEBIDO COM ACOPLAMENTO OU POLIA?</label>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="acoplamento" value="SIM" checked={fixedData.acoplamento_polia === 'SIM'} onChange={e => setFixedData({ ...fixedData, acoplamento_polia: e.target.value })} />
                                            Sim (OLHAL)
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="acoplamento" value="NÃO" checked={fixedData.acoplamento_polia === 'NÃO'} onChange={e => setFixedData({ ...fixedData, acoplamento_polia: e.target.value })} />
                                            Não
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>RECEBIDO COM SISTEMA DE LUBRIFICAÇÃO?</label>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="sistema_lub" value="SIM" checked={fixedData.sistema_lubrificacao === 'SIM'} onChange={e => setFixedData({ ...fixedData, sistema_lubrificacao: e.target.value })} />
                                            Sim
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'normal', cursor: 'pointer' }}>
                                            <input type="radio" name="sistema_lub" value="NÃO" checked={fixedData.sistema_lubrificacao === 'NÃO'} onChange={e => setFixedData({ ...fixedData, sistema_lubrificacao: e.target.value })} />
                                            Não
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>OUTROS (ESPECIFICAR)</label>
                                    <input
                                        placeholder="Outros detalhes..."
                                        value={fixedData.outros_especificar}
                                        onChange={e => setFixedData({ ...fixedData, outros_especificar: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>TAG DO CILINDRO *</label>
                                    <input
                                        required
                                        placeholder="Digite a TAG..."
                                        value={fixedData.tag}
                                        onChange={e => setFixedData({ ...fixedData, tag: e.target.value.toUpperCase() })}
                                        style={{ width: '100%', borderBottom: '1px solid #000', borderRadius: 0, padding: '8px 5px' }}
                                    />
                                </div>

                                <div className="form-group full-row">
                                    <label style={{ fontWeight: 'bold' }}>OBSERVAÇÕES</label>
                                    <textarea
                                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '2px solid #f1f3f5' }}
                                        placeholder="Observações complementares..."
                                        value={fixedData.observacoes_gerais}
                                        onChange={e => setFixedData({ ...fixedData, observacoes_gerais: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* DIMENSÕES */}
                <section className="form-card dimensions-section">
                    <div className="card-header">
                        {renderIndicator(dimStatus)}
                        <h3>Dimensões do Cilindro</h3>

                    </div>
                    <div className="dimensions-horizontal-grid">
                        <div className="dim-group-main">
                            <span className="dim-label">DIMENSÕES:</span>
                            <div className="dim-fields-wrapper">
                                <div className="dim-part">
                                    <span>CAMISA ØINT.</span>
                                    <input placeholder="ØINT" value={dimensions.diametroInterno} onChange={e => { setDimensions({ ...dimensions, diametroInterno: e.target.value }); setDimStatus('verde'); }} className="dim-input-mini" />
                                    <span>x Ø EXT.</span>
                                    <input placeholder="ØEXT" value={dimensions.diametroExterno} onChange={e => { setDimensions({ ...dimensions, diametroExterno: e.target.value }); setDimStatus('verde'); }} className="dim-input-mini" />
                                    <span>X COMP.</span>
                                    <input placeholder="COMP" value={dimensions.comprimentoTotal} onChange={e => { setDimensions({ ...dimensions, comprimentoTotal: e.target.value }); setDimStatus('verde'); }} className="dim-input-mini" />
                                </div>
                                <div className="dim-part divider-left">
                                    <span>/ HASTE Ø</span>
                                    <input placeholder="Ø" value={dimensions.diametroHaste} onChange={e => { setDimensions({ ...dimensions, diametroHaste: e.target.value }); setDimStatus('verde'); }} className="dim-input-mini" />
                                    <span>X COMP.</span>
                                    <input placeholder="COMP" value={dimensions.comprimentoHaste} onChange={e => { setDimensions({ ...dimensions, comprimentoHaste: e.target.value }); setDimStatus('verde'); }} className="dim-input-mini" />
                                </div>
                                <div className="dim-part divider-left">
                                    <span>/ CURSO:</span>
                                    <input placeholder="CURSO" value={dimensions.curso} onChange={e => { setDimensions({ ...dimensions, curso: e.target.value }); setDimStatus('verde'); }} className="dim-input-medium" />
                                    <span>MM</span>
                                </div>
                            </div>
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
                        <div className="checklist-header-row">
                            <span className="cl-num" style={{ width: '60px' }}>N°</span>
                            <span className="cl-desc">DESCRIÇÃO DE PEÇAS / SERVIÇOS</span>
                            <span className="cl-x" style={{ width: '30px', textAlign: 'center' }}></span>
                            <span className="cl-qtd" style={{ width: '60px', textAlign: 'center' }}></span>
                        </div>
                        {checklistItems.map((item, index) => (
                            <div key={item.id} className="checklist-row" onClick={() => handleChecklistItemClick(item.id)}>
                                <div className="row-main">
                                    <div className="item-info">
                                        <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className={`status-dot-animated ${item.conformidade ? 'verde' : 'vermelho'}`} />
                                            <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{index + 1}</span>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {COMPONENTES.includes(item.text) || item.text === 'Selecione o componente...' ? (
                                                <select
                                                    className="item-select"
                                                    value={item.text}
                                                    onChange={e => updateItemDetails(item.id, 'text', e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <option disabled value="Selecione o componente...">Selecione o componente...</option>
                                                    {COMPONENTES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            ) : (
                                                <span>{item.text}</span>
                                            )}
                                        </div>

                                        {/* Coluna X (Vazia para manter estrutura do cabeçalho se necessário) */}
                                        <div style={{ width: '30px' }} />

                                        {/* Coluna QTD */}
                                        <div style={{ width: '60px', textAlign: 'center' }}>
                                            <input
                                                className="inline-input"
                                                value={item.qtd || ''}
                                                onChange={e => updateItemDetails(item.id, 'qtd', e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent' }}
                                            />
                                        </div>
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
                                    {item.conformidade && (
                                        <button
                                            type="button"
                                            className="clear-item-btn"
                                            onClick={(e) => { e.stopPropagation(); handleResetItem(item.id); }}
                                            title="Limpar resposta"
                                        >
                                            <X size={20} color="#000" />
                                        </button>
                                    )}
                                </div>

                                {
                                    item.conformidade === 'não conforme' && (
                                        <div className="non-conformity-block slide-in" onClick={(e) => e.stopPropagation()}>
                                            {/* FOTOS EM PRIMEIRO - Conforme solicitado pelo usuário */}
                                            <div className="photo-section" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Evidências Fotográficas (Componente)</label>
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
                                                        <button
                                                            type="button"
                                                            className="btn-action-photo camera"
                                                            onClick={(e) => { e.stopPropagation(); handlePhotoUpload(item.id, 'cam'); }}
                                                        >
                                                            <Camera size={20} />
                                                            <span>Câmera</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-photo gallery"
                                                            onClick={(e) => { e.stopPropagation(); handlePhotoUpload(item.id, 'gallery'); }}
                                                        >
                                                            <Plus size={20} />
                                                            <span>Galeria</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="usiminas-item-fields" style={{ marginBottom: '1rem' }}>
                                                <div className="input-field" style={{ flex: '0 0 80px' }}>
                                                    <label>Qtd</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Qtd"
                                                        value={item.qtd}
                                                        onChange={e => updateItemDetails(item.id, 'qtd', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* BLOCO DE DIMENSÕES PADRONIZADO */}
                                            <div className="dimensional-block" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748', borderBottom: '1px solid #cbd5e0', paddingBottom: '5px' }}>ANÁLISE DIMENSIONAL</div>

                                                {/* 1. Diâmetro Externo */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Diâmetro Externo Encontrado Ø</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.diametro_externo_encontrado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(val || '0');
                                                                const spec = parseFloat(item.diametro_externo_especificado || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'diametro_externo_encontrado', val);
                                                                // Só atualiza o desvio se houver valores
                                                                if (val && item.diametro_externo_especificado) {
                                                                    updateItemDetails(item.id, 'desvio_externo', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_externo', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Diâmetro Externo Especificado Ø</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.diametro_externo_especificado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(item.diametro_externo_encontrado || '0');
                                                                const spec = parseFloat(val || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'diametro_externo_especificado', val);
                                                                if (val && item.diametro_externo_encontrado) {
                                                                    updateItemDetails(item.id, 'desvio_externo', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_externo', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Desvio</label>
                                                        <div style={{
                                                            height: '38px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            fontSize: '13px',
                                                            color: item.desvio_externo ? (parseFloat(item.desvio_externo) < 0 ? '#e53e3e' : '#2f855a') : '#a0aec0'
                                                        }}>
                                                            {item.desvio_externo ? `${parseFloat(item.desvio_externo) >= 0 ? '+' : ''}${item.desvio_externo.replace('.', ',')} mm` : '-'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Diâmetro Interno */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Diâmetro Interno Encontrado Ø</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.diametro_interno_encontrado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(val || '0');
                                                                const spec = parseFloat(item.diametro_interno_especificado || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'diametro_interno_encontrado', val);
                                                                if (val && item.diametro_interno_especificado) {
                                                                    updateItemDetails(item.id, 'desvio_interno', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_interno', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Diâmetro Interno Especificado Ø</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.diametro_interno_especificado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(item.diametro_interno_encontrado || '0');
                                                                const spec = parseFloat(val || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'diametro_interno_especificado', val);
                                                                if (val && item.diametro_interno_encontrado) {
                                                                    updateItemDetails(item.id, 'desvio_interno', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_interno', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Desvio</label>
                                                        <div style={{
                                                            height: '38px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            fontSize: '13px',
                                                            color: item.desvio_interno ? (parseFloat(item.desvio_interno) < 0 ? '#e53e3e' : '#2f855a') : '#a0aec0'
                                                        }}>
                                                            {item.desvio_interno ? `${parseFloat(item.desvio_interno) >= 0 ? '+' : ''}${item.desvio_interno.replace('.', ',')} mm` : '-'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 3. Comprimento */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Comprimento Encontrado</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.comprimento_encontrado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(val || '0');
                                                                const spec = parseFloat(item.comprimento_especificado || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'comprimento_encontrado', val);
                                                                if (val && item.comprimento_especificado) {
                                                                    updateItemDetails(item.id, 'desvio_comprimento', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_comprimento', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Comprimento Especificado</label>
                                                        <input
                                                            type="number"
                                                            step="0.0001"
                                                            placeholder="0.0000"
                                                            value={item.comprimento_especificado || ''}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const found = parseFloat(item.comprimento_encontrado || '0');
                                                                const spec = parseFloat(val || '0');
                                                                const diff = (found - spec).toFixed(4);
                                                                updateItemDetails(item.id, 'comprimento_especificado', val);
                                                                if (val && item.comprimento_encontrado) {
                                                                    updateItemDetails(item.id, 'desvio_comprimento', diff);
                                                                } else {
                                                                    updateItemDetails(item.id, 'desvio_comprimento', '');
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="input-field">
                                                        <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Desvio</label>
                                                        <div style={{
                                                            height: '38px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            fontWeight: 'bold',
                                                            fontSize: '13px',
                                                            color: item.desvio_comprimento ? (parseFloat(item.desvio_comprimento) < 0 ? '#e53e3e' : '#2f855a') : '#a0aec0'
                                                        }}>
                                                            {item.desvio_comprimento ? `${parseFloat(item.desvio_comprimento) >= 0 ? '+' : ''}${item.desvio_comprimento.replace('.', ',')} mm` : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

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
                                        </div>
                                    )
                                }
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
                            fotos: [],
                            tipo: 'componente'
                        };
                        setChecklistItems([...checklistItems, newItem]);
                    }}>
                        <Plus size={18} /> Adicionar Componente
                    </button>
                </section>

                <section className="form-card">
                    <div className="card-header">
                        <Info size={20} color="#7f8c8d" />
                        <h3>Empenho de Materiais</h3>
                    </div>
                    <div className="vedacoes-list">
                        <div className="vedacao-row header" style={{ background: '#f8fafc', fontWeight: 'bold', fontSize: '0.7rem', display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '10px' }}>
                            <span style={{ width: '60px' }}>N°</span>
                            <span style={{ flex: 1 }}>DESCRIÇÃO DO MATERIAL</span>
                            <span style={{ width: '60px', textAlign: 'center' }}>QTD</span>
                            <span style={{ width: '60px', textAlign: 'center' }}>UN.</span>
                            <span style={{ flex: 1 }}>OBSERVAÇÃO</span>
                        </div>
                        {vedacoes.map((item, index) => (
                            <div key={item.id} className="vedacao-row" style={{ display: 'flex', alignItems: 'center', padding: '5px 10px', borderBottom: '1px solid #f1f3f5' }}>
                                <div style={{ width: '60px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className={`status-dot-animated ${item.text.trim() !== '' ? 'verde' : 'vermelho'}`} />
                                    <span style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>{index + 1}</span>
                                </div>
                                <input
                                    placeholder="Descrição do material..."
                                    value={item.text}
                                    onChange={e => {
                                        const newVedacoes = [...vedacoes];
                                        newVedacoes[index].text = e.target.value;
                                        setVedacoes(newVedacoes);
                                    }}
                                    style={{ flex: 1, border: 'none', borderBottom: '1px solid #edf2f7', margin: '0 5px', fontSize: '0.85rem' }}
                                />
                                <input
                                    placeholder="Qtd"
                                    value={item.qtd}
                                    onChange={e => {
                                        const newVedacoes = [...vedacoes];
                                        newVedacoes[index].qtd = e.target.value;
                                        setVedacoes(newVedacoes);
                                    }}
                                    style={{ width: '60px', textAlign: 'center', border: 'none', borderBottom: '1px solid #edf2f7', margin: '0 5px', fontSize: '0.85rem' }}
                                />
                                <input
                                    placeholder="UN"
                                    value={item.unidade}
                                    onChange={e => {
                                        const newVedacoes = [...vedacoes];
                                        newVedacoes[index].unidade = e.target.value;
                                        setVedacoes(newVedacoes);
                                    }}
                                    style={{ width: '60px', textAlign: 'center', border: 'none', borderBottom: '1px solid #edf2f7', margin: '0 5px', fontSize: '0.85rem' }}
                                />
                                <input
                                    placeholder="Obs..."
                                    value={item.observacao}
                                    onChange={e => {
                                        const newVedacoes = [...vedacoes];
                                        newVedacoes[index].observacao = e.target.value;
                                        setVedacoes(newVedacoes);
                                    }}
                                    style={{ flex: 1, border: 'none', borderBottom: '1px solid #edf2f7', margin: '0 5px', fontSize: '0.85rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newVedacoes = vedacoes.filter((_, i) => i !== index);
                                        setVedacoes(newVedacoes);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#e53e3e', cursor: 'pointer', padding: '5px' }}
                                    title="Remover vedação"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" className="btn-add-comp" style={{ marginTop: '1.5rem' }} onClick={() => {
                        setVedacoes([...vedacoes, {
                            id: crypto.randomUUID(),
                            text: '',
                            qtd: '1',
                            unidade: 'PC',
                            status: 'azul',
                            conformidade: 'não conforme',
                            anomalia: '',
                            solucao: '',
                            fotos: [],
                            observacao: '',
                            tipo: 'vedação'
                        }]);
                    }}>
                        <Plus size={18} /> Adicionar Vedação
                    </button>
                </section>

                <div className="footer-actions">
                    <button type="submit" className="btn-finalize" disabled={loading}>
                        {loading ? 'Processando...' : 'Finalizar e Registrar Peritagem'}
                    </button>
                </div>
            </form>

            {/* Inputs de arquivo invisíveis */}
            <input
                type="file"
                ref={camInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
            />
            <input
                type="file"
                ref={galleryInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={onFileChange}
            />
        </div >
    );
};
