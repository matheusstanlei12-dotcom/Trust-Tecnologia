import React, { useState } from 'react';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PERITAGEM_CATALOG } from '../constants/peritagemItems';
import './NovaPeritagem.css';

interface SelectedItem {
    id: number;
    descricao: string;
    selecionado: boolean;
    qtd: string;
    dimensoes: string;
}

interface Vedacao {
    id: number;
    descricao: string;
    qtd: string;
    un: string;
    observacao: string;
}

export const NovaPeritagem: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Dados Gerais
    const [formData, setFormData] = useState({
        cliente: '',

        ordem: '',
        notaFiscal: '',
        camisaInt: '',
        camisaExt: '',
        camisaComp: '',
        hasteDiam: '',
        hasteComp: '',
        curso: '',
    });

    // Checklist
    const [items, setItems] = useState<SelectedItem[]>(
        PERITAGEM_CATALOG.map(item => ({
            ...item,
            selecionado: false,
            qtd: '',
            dimensoes: ''
        }))
    );

    // Vedações
    const [vedacoes, setVedacoes] = useState<Vedacao[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleItem = (id: number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, selecionado: !item.selecionado } : item
        ));
    };

    const handleItemValueChange = (id: number, field: 'qtd' | 'dimensoes', value: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addVedacao = () => {
        const newId = vedacoes.length > 0 ? Math.max(...vedacoes.map(v => v.id)) + 1 : 1;
        setVedacoes([...vedacoes, { id: newId, descricao: '', qtd: '', un: '', observacao: '' }]);
    };

    const removeVedacao = (id: number) => {
        setVedacoes(vedacoes.filter(v => v.id !== id));
    };

    const updateVedacao = (id: number, field: keyof Vedacao, value: string) => {
        setVedacoes(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Obter usuário atual
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Gerar número de peritagem único (ex: H-20251229-XXXX)
            const timestamp = new Date().getTime().toString().slice(-4);
            const numeroPeritagem = `P-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${timestamp}`;

            // 3. Inserir Peritagem Principal
            const { data: peritagem, error: pError } = await supabase
                .from('peritagens')
                .insert([{
                    numero_peritagem: numeroPeritagem,
                    cliente: formData.cliente,

                    ordem_servico: formData.ordem,
                    nota_fiscal: formData.notaFiscal,
                    camisa_int: formData.camisaInt,
                    camisa_ext: formData.camisaExt,
                    camisa_comp: formData.camisaComp,
                    haste_diam: formData.hasteDiam,
                    haste_comp: formData.hasteComp,
                    curso: formData.curso,
                    criado_por: user?.id,
                    status: 'AGUARDANDO APROVAÇÃO DO PCP',
                    prioridade: 'Normal'
                }])
                .select()
                .single();

            if (pError) throw pError;

            // 4. Inserir Itens Selecionados
            const selectedItems = items
                .filter(i => i.selecionado)
                .map(i => ({
                    peritagem_id: peritagem.id,
                    item_id: i.id,
                    descricao: i.descricao,
                    selecionado: true,
                    qtd: i.qtd,
                    dimensoes: i.dimensoes
                }));

            if (selectedItems.length > 0) {
                const { error: iError } = await supabase
                    .from('peritagem_itens')
                    .insert(selectedItems);
                if (iError) throw iError;
            }

            // 5. Inserir Vedações
            const validVedacoes = vedacoes
                .filter(v => v.descricao.trim() !== '')
                .map(v => ({
                    peritagem_id: peritagem.id,
                    descricao: v.descricao,
                    qtd: v.qtd,
                    un: v.un,
                    observacao: v.observacao
                }));

            if (validVedacoes.length > 0) {
                const { error: vError } = await supabase
                    .from('peritagem_vedacoes')
                    .insert(validVedacoes);
                if (vError) throw vError;
            }

            alert('Peritagem salva com sucesso!');
            navigate('/peritagens');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar peritagem: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="nova-peritagem-container">
            <div className="header-actions">
                <button className="btn-back" onClick={() => navigate('/peritagens')}>
                    <ArrowLeft size={20} />
                    <span>Voltar</span>
                </button>
                <h1 className="page-title">Formulário de Peritagem</h1>
            </div>

            <form className="peritagem-form" onSubmit={handleSubmit}>
                {/* SEÇÃO 1: DADOS GERAIS */}
                <div className="form-section">
                    <h2 className="section-title">Dados Gerais e DIMENSÕES</h2>
                    <div className="grid-inputs">
                        <div className="form-group full-width">
                            <label>CLIENTE</label>
                            <input name="cliente" value={formData.cliente} onChange={handleInputChange} placeholder="Nome do Cliente" required />
                        </div>

                        <div className="form-group">
                            <label>ORDEM DE SERVIÇO</label>
                            <input name="ordem" value={formData.ordem} onChange={handleInputChange} placeholder="Número da Ordem" />
                        </div>
                        <div className="form-group">
                            <label>NOTA FISCAL</label>
                            <input name="notaFiscal" value={formData.notaFiscal} onChange={handleInputChange} />
                        </div>
                    </div>

                    <div className="dimensions-grid">
                        <div className="form-group">
                            <label>CAMISA Ø INT</label>
                            <input name="camisaInt" value={formData.camisaInt} onChange={handleInputChange} placeholder="mm" />
                        </div>
                        <div className="form-group">
                            <label>Ø EXT</label>
                            <input name="camisaExt" value={formData.camisaExt} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>X COMP.</label>
                            <input name="camisaComp" value={formData.camisaComp} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>HASTE Ø</label>
                            <input name="hasteDiam" value={formData.hasteDiam} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>X COMP.</label>
                            <input name="hasteComp" value={formData.hasteComp} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>CURSO</label>
                            <input name="curso" value={formData.curso} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                {/* SEÇÃO 2: CHECKLIST TÉCNICO */}
                <div className="form-section">
                    <h2 className="section-title">Descrição de Peças / Serviços</h2>
                    <div className="checklist-table-wrapper">
                        <table className="checklist-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>Nº</th>
                                    <th>Descrição</th>
                                    <th style={{ width: '60px' }}>X</th>
                                    <th style={{ width: '80px' }}>QTD</th>
                                    <th>DIMENSÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className={item.selecionado ? 'selected-row' : ''}>
                                        <td>{item.id}</td>
                                        <td>{item.descricao}</td>
                                        <td className="center-cell">
                                            <input
                                                type="checkbox"
                                                checked={item.selecionado}
                                                onChange={() => toggleItem(item.id)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="small-input"
                                                value={item.qtd}
                                                onChange={(e) => handleItemValueChange(item.id, 'qtd', e.target.value)}
                                                disabled={!item.selecionado}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                className="full-input"
                                                value={item.dimensoes}
                                                onChange={(e) => handleItemValueChange(item.id, 'dimensoes', e.target.value)}
                                                disabled={!item.selecionado}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SEÇÃO 3: VEDAÇÕES */}
                <div className="form-section">
                    <div className="section-header">
                        <h2 className="section-title">Vedações</h2>
                        <button type="button" className="btn-add" onClick={addVedacao}>
                            <Plus size={16} />
                            <span>Adicionar Vedação</span>
                        </button>
                    </div>
                    <div className="vedacoes-table-wrapper">
                        <table className="vedacoes-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>Nº</th>
                                    <th>Descrição</th>
                                    <th style={{ width: '80px' }}>QTD</th>
                                    <th style={{ width: '80px' }}>UN</th>
                                    <th>Observação</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {vedacoes.map((v, index) => (
                                    <tr key={v.id}>
                                        <td>{index + 1}</td>
                                        <td><input value={v.descricao} onChange={(e) => updateVedacao(v.id, 'descricao', e.target.value)} placeholder="Componente..." /></td>
                                        <td><input value={v.qtd} onChange={(e) => updateVedacao(v.id, 'qtd', e.target.value)} /></td>
                                        <td><input value={v.un} onChange={(e) => updateVedacao(v.id, 'un', e.target.value)} placeholder="un, kit..." /></td>
                                        <td><input value={v.observacao} onChange={(e) => updateVedacao(v.id, 'observacao', e.target.value)} /></td>
                                        <td className="center-cell">
                                            <button type="button" className="btn-delete" onClick={() => removeVedacao(v.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {vedacoes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="empty-msg">Nenhuma vedação adicionada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="form-actions-footer">
                    <button type="submit" className="btn-primary-large" disabled={loading}>
                        <Save size={22} />
                        <span>{loading ? 'Processando...' : 'SALVAR PERITAGEM'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
