import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Fontes nativas para evitar erros de rede
const FONT_FAMILY = 'Helvetica';

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 60,
        paddingLeft: 30,
        paddingRight: 30,
        fontSize: 10,
        fontFamily: FONT_FAMILY,
        color: '#333',
        backgroundColor: '#fff'
    },
    // Estilos da Capa
    coverPage: {
        padding: 60,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#FFFFFF',
    },
    coverLogo: {
        width: 180,
        marginBottom: -35,
        marginTop: -30
    },
    coverTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    coverSubtitle: {
        fontSize: 10,
        color: '#7f8c8d',
        marginBottom: 30,
        textAlign: 'center',
    },
    coverDivider: {
        width: '60%',
        height: 1,
        backgroundColor: '#bdc3c7',
        marginBottom: 30,
    },
    coverDetails: {
        width: '100%',
        alignItems: 'center',
        gap: 15
    },
    coverDetailItem: {
        alignItems: 'center',
        marginBottom: 10
    },
    coverDetailLabel: {
        fontSize: 8,
        color: '#95a5a6',
        fontWeight: 'bold',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    coverDetailValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#005696',
        paddingBottom: 10
    },
    logo: {
        width: 120
    },
    titleContainer: {
        textAlign: 'right'
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#005696'
    },
    reportSubtitle: {
        fontSize: 10,
        color: '#666'
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#005696',
        color: '#fff',
        padding: 5,
        marginTop: 15,
        marginBottom: 8,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 5
    },
    infoItem: {
        width: '50%',
        marginBottom: 4
    },
    label: {
        fontWeight: 'bold',
        color: '#555'
    },
    value: {
        color: '#000'
    },
    // Tabela Usiminas
    table: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#005696',
        color: '#fff',
        fontWeight: 'bold',
        padding: 5
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 4,
        alignItems: 'center'
    },
    colNo: { width: '5%', textAlign: 'center' },
    colDesc: { width: '42%' },
    colX: { width: '20%', textAlign: 'center' }, // Largura para "NÃO CONFORME"
    colQtd: { width: '8%', textAlign: 'center' },
    colDim: { width: '25%' },

    technicalOpinion: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee'
    },
    // Estilos de Análise Detalhada (Similar ao App)
    analysisBlock: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#005696',
        borderRadius: 4,
        padding: 8,
    },
    analysisHeader: {
        backgroundColor: '#005696',
        color: '#fff',
        padding: 4,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    analysisRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    analysisField: {
        flex: 1,
    },
    analysisLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#000000',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    analysisValue: {
        fontSize: 9,
        borderWidth: 1,
        borderColor: '#fee2e2',
        padding: 4,
        borderRadius: 3,
        minHeight: 18,
    },
    materialFaltanteBox: {
        backgroundColor: '#f0fff4',
        borderWidth: 1,
        borderColor: '#27ae60',
        borderRadius: 4,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 25
    },
    // Estilos para Fotos nos Itens
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 5,
    },
    photoContainer: {
        width: '48%', // Slightly less than 50% to ensure gap fitting
        height: 220, // Increased height for better visibility
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
        padding: 2, // Small padding to prevent image touching border
        backgroundColor: '#fff'
    },
    itemPhoto: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        backgroundColor: '#f8fafc' // Light background to show boundaries if image is smaller
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        textAlign: 'center',
        fontSize: 8,
        color: '#999'
    }
});

interface Item {
    id?: number;
    descricao: string;
    selecionado: boolean;
    qtd: string;
    dimensoes: string;
    conformidade: string;
    diametro_encontrado?: string;
    diametro_ideal?: string;
    material_faltante?: string;
    diametro_externo_encontrado?: string;
    diametro_externo_especificado?: string;
    desvio_externo?: string;
    diametro_interno_encontrado?: string;
    diametro_interno_especificado?: string;
    desvio_interno?: string;
    comprimento_encontrado?: string;
    comprimento_especificado?: string;
    desvio_comprimento?: string;
    anomalias?: string;
    solucao?: string;
    fotos?: string[];
}

interface Vedacao {
    descricao: string;
    qtd: string;
    unidade: string;
    observacao: string;
    conformidade: string;
    selecionado: boolean;
}

interface ReportData {
    numero_os: string;
    ni: string;
    pedido: string;
    nota_fiscal: string;
    cliente: string;
    data: string;
    tag: string;
    local_equipamento: string;
    responsavel_tecnico: string;
    camisa_int: string;
    camisa_ext: string;
    camisa_comp: string;
    haste_diam: string;
    haste_comp: string;
    curso: string;
    items: Item[];
    vedacoes: Vedacao[];
    parecer_tecnico: string;
    logo_trusteng: string;
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
    area?: string;
    linha?: string;
}

export const ReportTemplate: React.FC<{ data: ReportData }> = ({ data }) => (
    <Document>
        {/* PÁGINA 0: CAPA */}
        <Page size="A4" style={styles.coverPage}>
            <Image src="/logo.png" style={styles.coverLogo} />
            <Text style={{ fontSize: 12, color: 'red', marginBottom: 30, fontWeight: 'bold', textTransform: 'uppercase' }}>Serviços Hidráulicos e Pneumáticos Ltda</Text>
            <Text style={styles.coverTitle}>RELATÓRIO TÉCNICO DE PERITAGEM</Text>


            <View style={styles.coverDivider} />

            <View style={styles.coverDetails}>
                <View style={styles.coverDetailItem}>
                    <Text style={styles.coverDetailLabel}>CLIENTE</Text>
                    <Text style={styles.coverDetailValue}>{data.cliente}</Text>
                </View>
                <View style={styles.coverDetailItem}>
                    <Text style={styles.coverDetailLabel}>ORDEM DE SERVIÇO</Text>
                    <Text style={styles.coverDetailValue}>{data.numero_os}</Text>
                </View>
                <View style={styles.coverDetailItem}>
                    <Text style={styles.coverDetailLabel}>EQUIPAMENTO</Text>
                    <Text style={styles.coverDetailValue}>CILINDRO HIDRÁULICO</Text>
                </View>
                <View style={styles.coverDetailItem}>
                    <Text style={styles.coverDetailLabel}>DATA DE EMISSÃO</Text>
                    <Text style={styles.coverDetailValue}>{data.data}</Text>
                </View>
            </View>
        </Page>

        {/* PÁGINA 1: Identificação e Lista de Peças */}
        <Page size="A4" style={styles.page}>
            {/* Foto Frontal no topo da página 2 */}
            {data.foto_frontal && (
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Image src={data.foto_frontal} style={{ width: '100%', maxHeight: 250, objectFit: 'contain' }} />
                </View>
            )}

            <View style={{ marginBottom: 20 }}>
                {/* Título Central */}


                {/* Tabela de Cabeçalho */}
                <View style={{ borderWidth: 1, borderColor: '#000' }}>
                    {/* Título */}
                    <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 5, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>GERÊNCIA DE OFICINAS DE MANUTENÇÃO</Text>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderColor: '#000', padding: 5 }}>
                        <Text style={{ fontSize: 10 }}>LAUDO REPARO: {data.numero_os}</Text>
                    </View>
                    {/* Linha 1 */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', height: 25 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>NOTA/LAUDO:</Text>
                            <Text style={{ fontSize: 9 }}>{data.nota_fiscal} / {data.numero_os}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>PROCESSO/OFICINAS:</Text>
                            <Text style={{ fontSize: 9 }}>{data.pedido}</Text>
                        </View>
                        <View style={{ flex: 0.8, padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>DATA:</Text>
                            <Text style={{ fontSize: 9 }}>{data.data}</Text>
                        </View>
                    </View>

                    {/* Linha 2 */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', height: 25 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>ÁREA:</Text>
                            <Text style={{ fontSize: 9 }}>{data.area || '-'}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>LINHA:</Text>
                            <Text style={{ fontSize: 9 }}>{data.linha || '-'}</Text>
                        </View>
                        <View style={{ flex: 0.8, padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>EQUIPAMENTO:</Text>
                            <Text style={{ fontSize: 9 }}>{data.local_equipamento}</Text>
                        </View>
                    </View>

                    {/* Linha 3 */}
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000', height: 25 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>TIPO DE EQUIPAMENTO:</Text>
                            <Text style={{ fontSize: 9 }}>{data.tipo_modelo || 'CILINDRO HIDRÁULICO'}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>TAG DO EQUIPAMENTO:</Text>
                            <Text style={{ fontSize: 9 }}>{data.tag}</Text>
                        </View>
                        <View style={{ flex: 0.8, padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>MATERIAL/NI:</Text>
                            <Text style={{ fontSize: 9 }}>{data.ni}</Text>
                        </View>
                    </View>

                    {/* Linha 4 */}
                    <View style={{ flexDirection: 'row', height: 25 }}>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>DESENHO:</Text>
                            <Text style={{ fontSize: 9 }}>{data.desenho_conjunto}</Text>
                        </View>
                        <View style={{ flex: 1, borderRightWidth: 1, borderColor: '#000', padding: 4 }} />
                        <View style={{ flex: 0.8, padding: 4 }} />
                    </View>
                </View>
            </View>

            <View style={styles.sectionTitle}>
                <Text>DIMENSÕES TÉCNICAS (MM)</Text>
            </View>
            <View style={styles.infoGrid} wrap={false}>
                <View style={{ width: '100%', marginBottom: 4 }}>
                    <Text style={styles.label}>CAMISA: <Text style={styles.value}>Ø INT. {data.camisa_int} x Ø EXT. {data.camisa_ext} x COMP. {data.camisa_comp}</Text></Text>
                </View>
                <View style={{ width: '100%', marginBottom: 4 }}>
                    <Text style={styles.label}>HASTE: <Text style={styles.value}>Ø {data.haste_diam} x COMP. {data.haste_comp}</Text></Text>
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={styles.label}>CURSO: <Text style={styles.value}>{data.curso} MM</Text></Text>
                </View>
                <View style={{ width: '50%' }}>
                    <Text style={styles.label}>TAG: <Text style={styles.value}>{data.tag}</Text></Text>
                </View>
            </View>

            <View style={styles.sectionTitle}>
                <Text>INFORMAÇÕES COMPLEMENTARES</Text>
            </View>
            <View style={styles.infoGrid} wrap={false}>
                <View style={{ width: '100%', marginBottom: 4 }}>
                    <Text style={styles.label}>DESENHO DE CONJUNTO: <Text style={styles.value}>{data.desenho_conjunto}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>TIPO/MODELO: <Text style={styles.value}>{data.tipo_modelo}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>FABRICANTE: <Text style={styles.value}>{data.fabricante}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>LUBRIFICANTE: <Text style={styles.value}>{data.lubrificante}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>VOLUME: <Text style={styles.value}>{data.volume}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>ACOPLAMENTO/POLIA: <Text style={styles.value}>{data.acoplamento_polia}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>SIST. LUBRIFICAÇÃO: <Text style={styles.value}>{data.sistema_lubrificacao}</Text></Text>
                    <View style={{ width: '100%', marginTop: 4 }}>
                        <Text style={styles.label}>OUTROS: <Text style={styles.value}>{data.outros_especificar}</Text></Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer} fixed>
                <Text>Documento gerado automaticamente pela TrustEng. LTDA - Unidade Especialista em Hidráulica</Text>
            </View>
        </Page>

        {/* PÁGINA 2: Tabela de Itens (0 a 30) */}
        <Page size="A4" style={styles.page}>
            <View style={styles.sectionTitle}>
                <Text>DESCRIÇÃO DE PEÇAS / SERVIÇOS</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colNo}>N°</Text>
                    <Text style={{ width: '67%' }}>DESCRIÇÃO</Text>
                    <Text style={styles.colX}>X</Text>
                    <Text style={styles.colQtd}>QTD</Text>
                </View>
                {data.items.slice(0, 30).map((item, index) => (
                    <View key={index} style={styles.tableRow} wrap={false}>
                        <Text style={styles.colNo}>{index + 1}</Text>
                        <Text style={{ width: '67%' }}>{item.descricao}</Text>
                        <Text style={[styles.colX, {
                            color: item.selecionado ? '#e67e22' : '#27ae60',
                            fontSize: item.selecionado ? 7 : 7,
                            fontWeight: 'bold'
                        }]}>
                            {item.selecionado ? 'NÃO CONFORME' : 'CONFORME'}
                        </Text>
                        <Text style={styles.colQtd}>{item.qtd || '-'}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer} fixed>
                <Text>Documento gerado automaticamente pela TrustEng. LTDA - Unidade Especialista em Hidráulica</Text>
            </View>
        </Page>

        {/* PÁGINA 3+: Continuação da Tabela se necessário, Vedações e Análise */}
        <Page size="A4" style={styles.page}>
            {data.items.length > 30 && (
                <>
                    <View style={styles.table}>
                        {data.items.slice(30).map((item, index) => (
                            <View key={index + 30} style={styles.tableRow} wrap={false}>
                                <Text style={styles.colNo}>{index + 31}</Text>
                                <Text style={{ width: '67%' }}>{item.descricao}</Text>
                                <Text style={[styles.colX, {
                                    color: item.selecionado ? '#e67e22' : '#27ae60',
                                    fontSize: 7,
                                    fontWeight: 'bold'
                                }]}>
                                    {item.selecionado ? 'NÃO CONFORME' : 'CONFORME'}
                                </Text>
                                <Text style={styles.colQtd}>{item.qtd || '-'}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ marginBottom: 20 }} />
                </>
            )}

            {data.vedacoes && data.vedacoes.length > 0 && (
                <>
                    <View style={styles.sectionTitle}>
                        <Text>EMPENHO DE MATERIAIS</Text>
                    </View>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.colNo}>N°</Text>
                            <Text style={styles.colDesc}>DESCRIÇÃO</Text>
                            <Text style={styles.colX}>CONFORMIDADE</Text>
                            <Text style={styles.colQtd}>QTD</Text>
                            <Text style={styles.colDim}>OBSERVAÇÃO</Text>
                        </View>
                        {data.vedacoes.map((v, index) => (
                            <View key={index} style={styles.tableRow} wrap={false}>
                                <Text style={styles.colNo}>{index + 1}</Text>
                                <Text style={styles.colDesc}>{v.descricao}</Text>
                                <Text style={[styles.colX, {
                                    color: v.selecionado ? '#e67e22' : '#27ae60',
                                    fontSize: 7,
                                    fontWeight: 'bold'
                                }]}>
                                    {v.selecionado ? 'NÃO CONFORME' : 'CONFORME'}
                                </Text>
                                <Text style={styles.colQtd}>{v.qtd}</Text>
                                <Text style={styles.colDim}>{v.selecionado ? '-' : (v.observacao || '-')}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {data.items.some(i => i.selecionado) && (
                <>
                    <View style={[styles.sectionTitle, { marginTop: 20 }]}>
                        <Text>ANÁLISE DETALHADA DE NÃO CONFORMIDADES</Text>
                    </View>
                    {data.items.filter(i => i.selecionado).map((item, index) => (
                        <View key={index} style={styles.analysisBlock} wrap={false}>
                            <View style={styles.analysisHeader}>
                                <Text>ITEM {item.id || (index + 1)}: {item.descricao}</Text>
                            </View>
                            <View style={styles.analysisRow}>
                                <View style={{ width: '100%' }}>
                                    <Text style={styles.analysisLabel}>Qtd</Text>
                                    <Text style={styles.analysisValue}>{item.qtd}</Text>
                                </View>
                            </View>
                            {/* Diâmetro Externo */}
                            {(item.diametro_externo_encontrado || item.diametro_externo_especificado) && (
                                <View style={styles.analysisRow}>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Ø Ext. Espec. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_externo_especificado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Ø Ext. Enc. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_externo_encontrado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={[styles.analysisLabel, { color: '#27ae60' }]}>Desvio</Text>
                                        <View style={styles.materialFaltanteBox}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: parseFloat(item.desvio_externo || '0') < 0 ? '#e74c3c' : '#27ae60' }}>
                                                {item.desvio_externo ? `${parseFloat(item.desvio_externo) >= 0 ? '+' : ''}${item.desvio_externo.replace('.', ',')} mm` : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Diâmetro Interno */}
                            {(item.diametro_interno_encontrado || item.diametro_interno_especificado) && (
                                <View style={styles.analysisRow}>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Ø Int. Espec. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_interno_especificado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Ø Int. Enc. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_interno_encontrado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={[styles.analysisLabel, { color: '#27ae60' }]}>Desvio</Text>
                                        <View style={styles.materialFaltanteBox}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: parseFloat(item.desvio_interno || '0') < 0 ? '#e74c3c' : '#27ae60' }}>
                                                {item.desvio_interno ? `${parseFloat(item.desvio_interno) >= 0 ? '+' : ''}${item.desvio_interno.replace('.', ',')} mm` : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Comprimento */}
                            {(item.comprimento_encontrado || item.comprimento_especificado) && (
                                <View style={styles.analysisRow}>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Comp. Espec. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.comprimento_especificado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Comp. Enc. (mm)</Text>
                                        <Text style={styles.analysisValue}>{item.comprimento_encontrado || '-'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={[styles.analysisLabel, { color: '#27ae60' }]}>Desvio</Text>
                                        <View style={styles.materialFaltanteBox}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: parseFloat(item.desvio_comprimento || '0') < 0 ? '#e74c3c' : '#27ae60' }}>
                                                {item.desvio_comprimento ? `${parseFloat(item.desvio_comprimento) >= 0 ? '+' : ''}${item.desvio_comprimento.replace('.', ',')} mm` : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            <View style={styles.analysisRow}>
                                <View style={styles.analysisField}>
                                    <Text style={styles.analysisLabel}>Anomalia Encontrada</Text>
                                    <Text style={[styles.analysisValue, { minHeight: 30 }]}>{item.anomalias || '-'}</Text>
                                </View>
                                <View style={styles.analysisField}>
                                    <Text style={styles.analysisLabel}>Solução Recomendada</Text>
                                    <Text style={[styles.analysisValue, { minHeight: 30 }]}>{item.solucao || '-'}</Text>
                                </View>
                            </View>

                            {/* Fotos do Item */}
                            {item.fotos && item.fotos.length > 0 && (
                                <View style={styles.photoGrid}>
                                    {item.fotos.map((foto, fIdx) => (
                                        <View key={fIdx} style={styles.photoContainer} wrap={false}>
                                            <Image src={foto} style={styles.itemPhoto} />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </>
            )}



            <View style={styles.footer} fixed>
                <Text>Documento gerado automaticamente pela TrustEng. LTDA - Unidade Especialista em Hidráulica</Text>
            </View>
        </Page>
    </Document >
);
