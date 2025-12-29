import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Registrar fontes se necessário (usando as padrão por enquanto)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#000',
    },
    header: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 5,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    headerSubInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 10,
        marginBottom: 2,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableCell: {
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
    },
    tableCellNoBorder: {
        padding: 5,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemSection: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 10,
        minHeight: 150,
    },
    photoBox: {
        width: '40%',
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsBox: {
        width: '60%',
    },
    itemRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        padding: 4,
    },
    itemLabel: {
        width: '40%',
        fontWeight: 'bold',
    },
    itemValue: {
        width: '60%',
    },
    instructionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        textDecoration: 'underline',
    },
    instructionText: {
        marginBottom: 5,
        lineHeight: 1.4,
        textAlign: 'justify',
    },
    footer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
        fontSize: 8,
        textAlign: 'center',
        color: '#666',
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
        foto?: string;
    }>;
}

export const ReportTemplate: React.FC<{ data: ReportData }> = ({ data }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* CABEÇALHO DA PÁGINA 1 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>GERÊNCIA DE OFICINAS DE MANUTENÇÃO</Text>
                <View style={styles.headerSubInfo}>
                    <Text>LAUDO REPARO: {data.laudoNum}</Text>
                    <Text>{data.data} {data.hora}</Text>
                </View>
            </View>

            {/* TABELA DE IDENTIFICAÇÃO */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>NOTA/LAUDO:</Text>
                        <Text>{data.laudoNum}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>PROCESSO/OFICINAS:</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%', borderRightWidth: 0 }]}>
                        <Text style={styles.label}>DATA:</Text>
                        <Text>{data.data} {data.hora}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>ÁREA:</Text>
                        <Text>{data.area}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>LINHA:</Text>
                        <Text>{data.linha}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%', borderRightWidth: 0 }]}>
                        <Text style={styles.label}>EQUIPAMENTO:</Text>
                        <Text>{data.equipamento}</Text>
                    </View>
                </View>
                <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>TIPO DE EQUIPAMENTO:</Text>
                        <Text>CILINDRO HIDRÁULICO</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%' }]}>
                        <Text style={styles.label}>TAG DO EQUIPAMENTO:</Text>
                        <Text>{data.tag}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '33%', borderRightWidth: 0 }]}>
                        <Text style={styles.label}>MATERIAL/S/N:</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.table, { marginBottom: 20 }]}>
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                    <View style={[styles.tableCell, { width: '100%', borderRightWidth: 0 }]}>
                        <Text style={styles.label}>DESENHO:</Text>
                    </View>
                </View>
            </View>

            {/* DESCRIÇÃO DOS ITENS (EXEMPLO DO PRIMEIRO ITEM) */}
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>DESCRIÇÃO DOS ITENS</Text>
            {data.itens.slice(0, 1).map((item) => (
                <View key={item.id} style={styles.itemSection}>
                    <View style={styles.photoBox}>
                        <Text style={{ color: '#ccc' }}>FOTO</Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>ITEM DO LAUDO:</Text><Text style={styles.itemValue}>{item.id}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>DESCRIÇÃO DO COMP:</Text><Text style={styles.itemValue}>{item.desc}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>ESPECIFICAÇÃO:</Text><Text style={styles.itemValue}>{item.especificacao}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>QUANTIDADE:</Text><Text style={styles.itemValue}>{item.quantidade}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>AVARIA:</Text><Text style={styles.itemValue}>{item.avaria}</Text></View>
                        <View style={[styles.itemRow, { borderBottomWidth: 0 }]}><Text style={styles.itemLabel}>RECUPERAÇÃO:</Text><Text style={styles.itemValue}>{item.recuperacao}</Text></View>
                    </View>
                </View>
            ))}

            {/* INSTRUÇÕES TÉCNICAS (PARTE 1) */}
            <View style={{ marginTop: 10, borderTopWidth: 1, paddingTop: 10 }}>
                <Text style={styles.instructionTitle}>01 - IDENTIFICAÇÃO:</Text>
                <Text style={styles.instructionText}>COLOCAR PLAQUETA DE IDENTIFICAÇÃO RESISTENTE DO RECUPERADOR COM: NÚMERO DO PEDIDO; NÚMERO DO LAUDO; DATA DA RECUPERAÇÃO; NÚMERO DE IDENTIFICAÇÃO DO EQUIPAMENTO (TAG INFORMADA NO LAUDO).</Text>

                <Text style={styles.instructionTitle}>02 - EMBALAGEM:</Text>
                <Text style={styles.instructionText}>MATERIAL DEVERÁ SER DEVIDAMENTE EMBALADO EM CAIXA DE MADEIRA REFORÇADA, PROTEGIDO CONTRA AMASSAMENTOS, POEIRAS E VIR A DANIFICAR QUANDO MOVIMENTADO. A EMBALAGEM DEVERÁ SER DE FORMA QUE GARANTA O ARMAZENAMENTO PADRÃO POR LONGO PERÍODO GARANTINDO SUAS CARACTERÍSTICAS DE QUALIDADE. O CILINDRO DEVERÁ VIR COM TAMPÕES EM AÇO VEDANDO PERFEITAMENTE.</Text>

                <Text style={styles.instructionTitle}>03 - TESTE DE DESEMPENHO:</Text>
                <Text style={styles.instructionText}>FORNECER LAUDOS DE TESTES, COM IMAGENS QUE COMPROVEM A CARGA APLICADA E MOVIMENTAÇÃO A QUE O EQUIPAMENTO FOI SUBMETIDO. REALIZAR TESTE PASSAGEM INTERNA, AMORTECIMENTO, TESTE DE ESTANQUEIDADE, VERIFICAR O CURSO CORRETO, CONFERIR DIMENSÕES ENTRE FIXAÇÕES DE ACORDO COM DESENHO. OS TESTES DEVEM SER REALIZADOS CONFORME NORMA ISO 10100.</Text>
            </View>
        </Page>

        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>GERÊNCIA DE OFICINAS DE MANUTENÇÃO</Text>
                <View style={styles.headerSubInfo}>
                    <Text>LAUDO REPARO: {data.laudoNum}</Text>
                    <Text>{data.data} {data.hora}</Text>
                </View>
            </View>

            <Text style={styles.instructionTitle}>04 - PINTURA:</Text>
            <Text style={styles.instructionText}>REALIZAR JATEAMENTO E EFETUAR PINTURA NA COR PADRÃO XXXXXX VERDE CLARO PADRÃO MUNSELL 2.5GY8/2.</Text>

            <Text style={styles.instructionTitle}>05 - MÃO DE OBRA:</Text>
            <Text style={styles.instructionText}>RECUPERAR CILINDRO CONFORME O LAUDO DE PERITAGEM, TENDO COMO REFERÊNCIA PARA FABRICAÇÃO DESENHO REFERENCIA FABRICANTE E AS PEÇAS QUE SERÃO POSTERIORMENTE ENVIADAS.</Text>

            <Text style={styles.instructionTitle}>06 - TORQUEAMENTO:</Text>
            <Text style={styles.instructionText}>EFETUAR O TORQUEAMENTO DE TODOS OS ELEMENTOS DE FIXAÇÃO CONFORME DIMENSÃO E CLASSE DE RESISTÊNCIA. FORNECER RELATÓRIO JUNTO AO DATA BOOK DO TORQUE APLICADO.</Text>

            <Text style={styles.instructionTitle}>07 - GARANTIA:</Text>
            <Text style={styles.instructionText}>FORNECER GARANTIA DE 01 (ANO) A PARTIR DA DATA DE MONTAGEM DO EQUIPAMENTO.</Text>

            <Text style={styles.instructionTitle}>08 - INSPEÇÃO FINAL NO CILINDRO REPARADO:</Text>
            <Text style={styles.instructionText}>INSPECIONAR AS TOMADAS DE ALIMENTAÇÕES, AS ROSCAS, SOLDAS, REFORÇO NA FIXAÇÃO COM A CAMISA, PORTICOS, FIXAÇÕES APÓS A RECUPERAÇÃO. REALIZAR APLICAÇÃO DE LIQUIDO PROTETIVO NAS PEÇAS EXPOSTAS E NA IDENTIFICAÇÃO. REALIZAR INSPEÇÃO GERAL NO CILINDRO PARA CERTIFICAR QUE O REPARO FOI REALIZADO COM QUALIDADE E CONFORME O LAUDO DE PERITAGEM.</Text>

            <Text style={[styles.instructionText, { marginTop: 10, fontWeight: 'bold' }]}>IMPORTANTES:</Text>
            <Text style={styles.instructionText}>EVIDENCIAR COM FOTOS E FILMAGENS, QUE AS DIMENSIONAIS, DISTANCIA ENTRE FIXAÇÕES E PRINCIPALMENTE O CURSO ESTÃO CONFORME SOLICITADO NO LAUDO DE PERITAGEM.</Text>

            <Text style={styles.instructionTitle}>09 - ENSAIO NÃO DESTRUTIVO:</Text>
            <Text style={styles.instructionText}>REALIZAR ENSAIO NÃO DESTRUTIVO NAS REGIÕES QUE POSSUEM SOLDAS, NAS FIXAÇÕES, NOS CANAIS DE COMUNICAÇÃO, REGIÕES MAIS FRÁGEIS, DURANTE O PROCESSO DE RECUPERAÇÃO DAS PEÇAS.</Text>

            <Text style={styles.instructionTitle}>10 - DATA-BOOK:</Text>
            <Text style={styles.instructionText}>ENVIAR O RELATÓRIO DE REPARO (DATA BOOK), CONTENDO: FOTOS DO PROCESSO DE RECUPERAÇÃO: ANTES E DEPOIS, INCLUINDO OS COMPONENTES; VÍDEOS DOS TESTES DE FUNCIONAMENTO. DOCUMENTO DEVERÁ SER ENVIADO ATRAVÉS DE LINK DA PLATAFORMA DIGITAL GOOGLE DRIVE OU ONEDRIVE. A PASTA DEVERÁ SER NOMEADA COM O PEDIDO E SEU RESPECTIVO ITEM, ONDE DEVERÁ ENVIAR UM DOCUMENTO PARA CADA PROCESSO RECONDICIONADO.</Text>

            <View style={{ borderTopWidth: 1, marginTop: 15, paddingTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>OBS.: DEVOLUÇÃO DOS COMPONENTES:</Text>
                <Text style={styles.instructionText}>TODOS OS COMPONENTES SUBSTITUÍDOS DEVERÃO SER DEVOLVIDOS À XXXXXX JUNTAMENTE AO EQUIPAMENTO REPARADO.</Text>
            </View>
        </Page>

        {/* PÁGINA 3 COM MAIS ITENS */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>GERÊNCIA DE OFICINAS DE MANUTENÇÃO</Text>
                <View style={styles.headerSubInfo}>
                    <Text>LAUDO REPARO: {data.laudoNum}</Text>
                    <Text>{data.data} {data.hora}</Text>
                </View>
            </View>

            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>CONTINUAÇÃO - DESCRIÇÃO DOS ITENS</Text>
            {data.itens.slice(1).map((item) => (
                <View key={item.id} style={[styles.itemSection, { marginBottom: 5, minHeight: 120 }]}>
                    <View style={styles.photoBox}>
                        <Text style={{ color: '#ccc' }}>FOTO</Text>
                    </View>
                    <View style={styles.detailsBox}>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>ITEM DO LAUDO:</Text><Text style={styles.itemValue}>{item.id}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>DESCRIÇÃO DO COMP:</Text><Text style={styles.itemValue}>{item.desc}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>ESPECIFICAÇÃO:</Text><Text style={styles.itemValue}>{item.especificacao}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>QUANTIDADE:</Text><Text style={styles.itemValue}>{item.quantidade}</Text></View>
                        <View style={styles.itemRow}><Text style={styles.itemLabel}>AVARIA:</Text><Text style={styles.itemValue}>{item.avaria}</Text></View>
                        <View style={[styles.itemRow, { borderBottomWidth: 0 }]}><Text style={styles.itemLabel}>RECUPERAÇÃO:</Text><Text style={styles.itemValue}>{item.recuperacao}</Text></View>
                    </View>
                </View>
            ))}

            <View style={styles.footer}>
                <Text>Documento gerado pelo sistema HIDRAUP - Peritagem Hidráulica Industrial</Text>
            </View>
        </Page>
    </Document>
);
