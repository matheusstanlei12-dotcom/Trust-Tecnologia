import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Fontes nativas para evitar erros de rede
const FONT_FAMILY = 'Helvetica';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: FONT_FAMILY,
        color: '#333',
        backgroundColor: '#fff'
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
        backgroundColor: '#f4f4f4',
        padding: 5,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#005696'
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
        color: '#e74c3c',
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
        width: '49%', // Duas fotos por linha
        height: 120,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 3,
        overflow: 'hidden',
    },
    itemPhoto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
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
}

export const UsiminasReportTemplate: React.FC<{ data: ReportData }> = ({ data }) => (
    <Document>
        {/* PÁGINA 1: Identificação e Lista de Peças */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Image src={data.logo_trusteng} style={styles.logo} />
                <View style={styles.titleContainer}>
                    <Text style={styles.reportTitle}>LAUDO TÉCNICO DE PERITAGEM</Text>
                    <Text style={styles.reportSubtitle}>{data.cliente.toUpperCase() === 'USIMINAS' ? 'PADRÃO USIMINAS' : 'RELATÓRIO TÉCNICO DE PERITAGEM'}</Text>
                </View>
            </View>

            {data.foto_frontal && (
                <View style={{ marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: '#005696', borderRadius: 4, padding: 2 }}>
                    <Image src={data.foto_frontal} style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
                    <View style={{ backgroundColor: '#005696', width: '100%', padding: 3 }}>
                        <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center', fontWeight: 'bold' }}>FOTO FRONTAL DO EQUIPAMENTO NO RECEBIMENTO</Text>
                    </View>
                </View>
            )}

            <View style={styles.sectionTitle}>
                <Text>IDENTIFICAÇÃO DO EQUIPAMENTO</Text>
            </View>
            <View style={styles.infoGrid} wrap={false}>
                <View style={{ width: '100%', marginBottom: 5 }}>
                    <Text style={styles.label}>CLIENTE: <Text style={styles.value}>{data.cliente}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>O.S: <Text style={styles.value}>{data.numero_os}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>NI: <Text style={styles.value}>{data.ni}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>PEDIDO: <Text style={styles.value}>{data.pedido}</Text></Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.label}>NOTA FISCAL: <Text style={styles.value}>{data.nota_fiscal}</Text></Text>
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
                <Text>DESCRIÇÃO DE PEÇAS / SERVIÇOS</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colNo}>N°</Text>
                    <Text style={styles.colDesc}>DESCRIÇÃO</Text>
                    <Text style={styles.colX}>X</Text>
                    <Text style={styles.colQtd}>QTD</Text>
                    <Text style={styles.colDim}>DIMENSÕES</Text>
                </View>
                {data.items.slice(0, 30).map((item, index) => (
                    <View key={index} style={styles.tableRow} wrap={false}>
                        <Text style={styles.colNo}>{index + 1}</Text>
                        <Text style={styles.colDesc}>{item.descricao}</Text>
                        <Text style={[styles.colX, {
                            color: item.selecionado ? '#e67e22' : '#27ae60',
                            fontSize: item.selecionado ? 7 : 7,
                            fontWeight: 'bold'
                        }]}>
                            {item.selecionado ? 'NÃO CONFORME' : 'CONFORME'}
                        </Text>
                        <Text style={styles.colQtd}>{item.qtd || '-'}</Text>
                        <Text style={styles.colDim}>{item.selecionado ? '-' : (item.dimensoes || '-')}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer} fixed>
                <Text>Documento gerado automaticamente pela TrustEng. LTDA - Unidade Especialista em Hidráulica</Text>
            </View>
        </Page>

        {/* PÁGINA 2+: Continuação da Tabela se necessário, Vedações e Análise */}
        <Page size="A4" style={styles.page}>
            {data.items.length > 30 && (
                <>
                    <View style={styles.table}>
                        {data.items.slice(30).map((item, index) => (
                            <View key={index + 30} style={styles.tableRow} wrap={false}>
                                <Text style={styles.colNo}>{index + 31}</Text>
                                <Text style={styles.colDesc}>{item.descricao}</Text>
                                <Text style={[styles.colX, {
                                    color: item.selecionado ? '#e67e22' : '#27ae60',
                                    fontSize: 7,
                                    fontWeight: 'bold'
                                }]}>
                                    {item.selecionado ? 'NÃO CONFORME' : 'CONFORME'}
                                </Text>
                                <Text style={styles.colQtd}>{item.qtd || '-'}</Text>
                                <Text style={styles.colDim}>{item.selecionado ? '-' : (item.dimensoes || '-')}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ marginBottom: 20 }} />
                </>
            )}

            {data.vedacoes && data.vedacoes.length > 0 && (
                <>
                    <View style={styles.sectionTitle}>
                        <Text>VEDAÇÕES</Text>
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
                                <View style={{ width: '15%' }}>
                                    <Text style={styles.analysisLabel}>Qtd</Text>
                                    <Text style={styles.analysisValue}>{item.qtd}</Text>
                                </View>
                                <View style={{ width: '85%' }}>
                                    <Text style={styles.analysisLabel}>Dimensões</Text>
                                    <Text style={styles.analysisValue}>{item.dimensoes || '-'}</Text>
                                </View>
                            </View>
                            {(item.diametro_encontrado || item.diametro_ideal) && (
                                <View style={styles.analysisRow}>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Diâmetro Encontrado</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_encontrado || '0.000'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={styles.analysisLabel}>Diâmetro Ideal</Text>
                                        <Text style={styles.analysisValue}>{item.diametro_ideal || '0.000'}</Text>
                                    </View>
                                    <View style={styles.analysisField}>
                                        <Text style={[styles.analysisLabel, { color: '#27ae60' }]}>Material Faltante</Text>
                                        <View style={styles.materialFaltanteBox}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: parseFloat(item.material_faltante || '0') < 0 ? '#e74c3c' : '#27ae60' }}>
                                                {item.material_faltante || '0.000'} mm
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
                                        <View key={fIdx} style={styles.photoContainer}>
                                            <Image src={foto} style={styles.itemPhoto} />
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </>
            )}

            <View style={[styles.sectionTitle, { marginTop: 20 }]}>
                <Text>PARECER TÉCNICO / CONCLUSÃO</Text>
            </View>
            <View style={styles.technicalOpinion}>
                <Text>{data.parecer_tecnico || 'Nenhum parecer técnico gerado.'}</Text>
            </View>

            <View style={styles.footer} fixed>
                <Text>Documento gerado automaticamente pela TrustEng. LTDA - Unidade Especialista em Hidráulica</Text>
            </View>
        </Page>
    </Document>
);
