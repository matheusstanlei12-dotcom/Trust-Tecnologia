import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#1a202c',
        backgroundColor: '#FFFFFF',
    },
    // Capa
    coverPage: {
        padding: 60,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: '#FFFFFF', // Fundo branco puro para elegância
    },
    coverLogo: {
        width: 180,
        marginBottom: 40,
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
        fontSize: 12,
        color: '#64748b',
        marginBottom: 30,
        textAlign: 'center',
    },
    coverDetails: {
        width: '80%',
        borderTopWidth: 1,
        borderTopColor: '#2c3e50',
        borderTopStyle: 'solid',
        paddingTop: 40,
        marginTop: 40,
    },
    coverDetailRow: {
        flexDirection: 'column',
        marginBottom: 15,
        alignItems: 'center',
    },
    coverDetailLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    coverDetailValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Header Técnico
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#2c3e50',
        borderBottomStyle: 'solid',
        paddingBottom: 10,
    },
    logoHeader: {
        width: 120,
    },
    headerTextGroup: {
        textAlign: 'right',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c3e50',
        textTransform: 'uppercase',
    },
    headerOS: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },

    // Blocos Informativos
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#2c3e50',
        backgroundColor: '#f1f5f9',
        padding: 6,
        marginTop: 15,
        marginBottom: 10,
        borderLeft: 3,
        borderLeftColor: '#2c3e50',
        textTransform: 'uppercase',
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    infoItem: {
        width: '50%',
        padding: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        borderBottomStyle: 'solid',
    },
    infoLabel: {
        fontSize: 8,
        color: '#64748b',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 10,
        color: '#1e293b',
        fontWeight: 'bold',
    },

    // Itens de Inspeção
    itemBox: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'solid',
        borderRadius: 2,
    },
    itemHeader: {
        backgroundColor: '#2c3e50',
        color: '#ffffff',
        padding: 6,
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemContent: {
        flexDirection: 'row',
        padding: 10,
    },
    itemImageColumn: {
        width: '45%',
        paddingRight: 10,
    },
    itemDataColumn: {
        width: '55%',
    },
    itemImage: {
        width: '100%',
        height: 160,
        objectFit: 'contain',
        backgroundColor: '#f8fafc',
    },
    dataField: {
        marginBottom: 8,
    },
    dataLabel: {
        fontSize: 7,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    dataValue: {
        fontSize: 9,
        color: '#0f172a',
        marginTop: 1,
    },
    dataAlert: {
        fontSize: 9,
        color: '#be123c',
        fontWeight: 'bold',
        marginTop: 1,
    },
    statusConforme: {
        fontSize: 10,
        color: '#27ae60',
        fontWeight: 'bold',
    },

    // Parecer Técnico
    parecerBox: {
        padding: 20,
        backgroundColor: '#ffffff',
        lineHeight: 1.6,
        textAlign: 'justify',
    },

    // Signatures
    signatureContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 60,
    },
    signatureLine: {
        width: '45%',
        borderTopWidth: 1,
        borderTopColor: '#000000',
        borderTopStyle: 'solid',
        paddingTop: 5,
        textAlign: 'center',
    },
    signatureName: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    signatureBottom: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        borderTopStyle: 'solid',
        paddingTop: 10,
    }
});

interface ReportData {
    laudoNum: string;
    data: string;
    hora: string;
    area: string;
    linha: string;
    equipamento: string;
    tag: string;
    material: string;
    desenho: string;
    cliente: string;
    itens: Array<{
        id: number;
        desc: string;
        especificacao: string;
        quantidade: string;
        avaria: string;
        recuperacao: string;
        conformidade: string;
        diametro_encontrado?: string;
        diametro_ideal?: string;
        material_faltante?: string;
        foto?: string;
    }>;
    parecerTecnico?: string;
    foto_frontal?: string;
}

const Footer = () => (
    <Text style={styles.footer} fixed>
        Documento gerado automaticamente pela TrustEng. LTDA
    </Text>
);

export const ReportTemplate: React.FC<{ data: ReportData }> = ({ data }) => (
    <Document title={`LAUDO_TECNICO_${data.laudoNum}`} author="HIDRAUP INDUSTRIAL">

        <Page size="A4" style={styles.coverPage}>
            <Image src="/logo.png" style={styles.coverLogo} />
            <Text style={styles.coverTitle}>Relatório Técnico de Peritagem</Text>
            <Text style={styles.coverSubtitle}>Diagnóstico e Avaliação de Performance Hidráulica</Text>

            <View style={styles.coverDetails}>
                <View style={styles.coverDetailRow}>
                    <Text style={styles.coverDetailLabel}>CLIENTE</Text>
                    <Text style={styles.coverDetailValue}>{data.cliente}</Text>
                </View>
                <View style={styles.coverDetailRow}>
                    <Text style={styles.coverDetailLabel}>ORDEM DE SERVIÇO</Text>
                    <Text style={styles.coverDetailValue}>{data.laudoNum}</Text>
                </View>
                <View style={styles.coverDetailRow}>
                    <Text style={styles.coverDetailLabel}>EQUIPAMENTO</Text>
                    <Text style={styles.coverDetailValue}>{data.equipamento}</Text>
                </View>
                <View style={styles.coverDetailRow}>
                    <Text style={styles.coverDetailLabel}>DATA DE EMISSÃO</Text>
                    <Text style={styles.coverDetailValue}>{data.data}</Text>
                </View>
            </View>
        </Page>

        {/* PÁGINA 1: IDENTIFICAÇÃO E RESUMO TÉCNICO */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Image src="/logo.png" style={styles.logoHeader} />
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>Laudo Técnico de Engenharia</Text>
                    <Text style={styles.headerOS}>OS nº {data.laudoNum} | Emissão: {data.data}</Text>
                </View>
            </View>

            {data.foto_frontal && (
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                    <Image src={data.foto_frontal} style={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: 5 }} />
                    <Text style={{ fontSize: 8, color: '#64748b', marginTop: 5, textAlign: 'center' }}>VISTA GERAL DO EQUIPAMENTO NO RECEBIMENTO</Text>
                </View>
            )}

            <Text style={styles.sectionTitle}>1. Identificação do Equipamento e Ativo</Text>
            <View style={styles.infoGrid}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>CLIENTE</Text><Text style={styles.infoValue}>{data.cliente}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>EQUIPAMENTO</Text><Text style={styles.infoValue}>{data.equipamento}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>TAG / IDENTIFICAÇÃO</Text><Text style={styles.infoValue}>{data.tag}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>SETOR / ÁREA</Text><Text style={styles.infoValue}>{data.area}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>LINHA / LOCAL</Text><Text style={styles.infoValue}>{data.linha}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>TIPO DE CILINDRO</Text><Text style={styles.infoValue}>HIDRÁULICO INDUSTRIAL</Text></View>
            </View>

            <Text style={styles.sectionTitle}>2. Diagnóstico Detalhado por Componente</Text>
            {data.itens && data.itens.map((item, idx) => {
                const isNaoConforme = item.conformidade === 'não conforme';

                if (!isNaoConforme) {
                    return (
                        <View key={idx} style={[styles.itemHeader, { marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fff4', borderLeftColor: '#27ae60' }]}>
                            <Text>ITEM {idx + 1}: {item.desc}</Text>
                            <Text style={styles.statusConforme}>CONFORME</Text>
                        </View>
                    );
                }

                return (
                    <View key={idx} style={styles.itemBox} break={idx > 0 && idx % 2 === 0}>
                        <View style={[styles.itemHeader, { backgroundColor: '#fff5f5', borderLeftColor: '#e74c3c' }]}>
                            <Text>ITEM {idx + 1}: {item.desc}</Text>
                        </View>
                        <View style={styles.itemContent}>
                            <View style={styles.itemImageColumn}>
                                {item.foto ? (
                                    <Image src={item.foto} style={styles.itemImage} />
                                ) : (
                                    <View style={[styles.itemImage, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ color: '#cbd5e1', fontSize: 8 }}>SEM REGISTRO FOTOGRÁFICO</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.itemDataColumn}>
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.dataLabel}>Qtd</Text>
                                        <Text style={styles.dataValue}>{item.quantidade}</Text>
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.dataLabel}>Status</Text>
                                        <Text style={styles.dataAlert}>NÃO CONFORME</Text>
                                    </View>
                                </View>

                                {(item.diametro_encontrado || item.diametro_ideal) && (
                                    <View style={{ backgroundColor: '#f8fafc', padding: 5, borderRadius: 4, marginBottom: 8 }}>
                                        <Text style={[styles.dataLabel, { marginBottom: 3 }]}>Medições Técnicas (mm)</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View>
                                                <Text style={{ fontSize: 6, color: '#64748b' }}>Encontrado</Text>
                                                <Text style={{ fontSize: 8 }}>{item.diametro_encontrado || '0.000'}</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 6, color: '#64748b' }}>Ideal</Text>
                                                <Text style={{ fontSize: 8 }}>{item.diametro_ideal || '0.000'}</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 6, color: '#64748b' }}>Faltante</Text>
                                                <Text style={{ fontSize: 8, color: parseFloat(item.material_faltante || '0') < 0 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                                                    {item.material_faltante || '0.000'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.dataField}>
                                    <Text style={styles.dataLabel}>Anomalias Detectadas</Text>
                                    <Text style={styles.dataValue}>{item.avaria}</Text>
                                </View>
                                <View style={[styles.dataField, { borderTopWidth: 1, borderTopColor: '#f1f5f9', borderTopStyle: 'solid', paddingTop: 5, marginTop: 5 }]}>
                                    <Text style={styles.dataLabel}>Recomendação de Reparo</Text>
                                    <Text style={styles.dataValue}>{item.recuperacao}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}

            <Footer />
        </Page>


    </Document>
);
