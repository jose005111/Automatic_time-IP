import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Line,
    Svg,
} from '@react-pdf/renderer';
import { NOME_SISTEMA } from '@/lib/sistema';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CartaTransferenciaData {
    id: number;
    data_solicitacao: string;
    data_aprovacao?: string;
    local_destino?: string;
    recrutamento: {
        id: number;
        municipe: {
            nome_completo: string;
            // Adiciona outros campos do munícipe que existam no teu tipo
            bi?: string;
            data_nascimento?: string;
            telefone?: string;
        };
    };
    municipioDestino?: {
        nome: string;
        provincia?: {
            nome: string;
        };
    };
    user_aprovou?: {
        name: string;
    };
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1a1a2e',
        paddingTop: 48,
        paddingBottom: 60,
        paddingHorizontal: 56,
        backgroundColor: '#ffffff',
    },

    // Cabeçalho
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerLeft: {
        flex: 1,
    },
    orgName: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a2e',
        letterSpacing: 0.3,
        textTransform: 'uppercase',
    },
    orgSub: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 2,
        letterSpacing: 0.3,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    docRef: {
        fontSize: 8,
        color: '#64748b',
        textAlign: 'right',
    },
    docRefValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a2e',
        textAlign: 'right',
        marginTop: 1,
    },

    // Divisor decorativo
    dividerContainer: {
        marginBottom: 20,
    },

    // Banda de título
    titleBand: {
        backgroundColor: '#1a1a2e',
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleBandText: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    titleBandBadge: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 2,
    },
    titleBandBadgeText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#ffffff',
        letterSpacing: 0.5,
    },

    // Secção de dados
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#64748b',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        borderBottomStyle: 'solid',
    },

    // Grelha de campos
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 0,
    },
    fieldHalf: {
        width: '50%',
        paddingRight: 12,
        marginBottom: 10,
    },
    fieldFull: {
        width: '100%',
        marginBottom: 10,
    },
    fieldLabel: {
        fontSize: 7.5,
        color: '#94a3b8',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 10,
        color: '#1a1a2e',
        fontFamily: 'Helvetica-Bold',
    },
    fieldValueNormal: {
        fontSize: 10,
        color: '#1a1a2e',
    },

    // Caixa de destino destacada
    destinoBox: {
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#22c55e',
        borderStyle: 'solid',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    destinoIndicator: {
        width: 4,
        backgroundColor: '#22c55e',
        marginRight: 12,
        borderRadius: 2,
        alignSelf: 'stretch',
    },
    destinoContent: {
        flex: 1,
    },
    destinoLabel: {
        fontSize: 7.5,
        color: '#16a34a',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    destinoMunicipio: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: '#14532d',
    },
    destinoProvincia: {
        fontSize: 9,
        color: '#16a34a',
        marginTop: 1,
    },

    // Texto do despacho
    despachoBox: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'solid',
        borderRadius: 4,
        padding: 14,
        marginBottom: 20,
        backgroundColor: '#fafafa',
    },
    despachoText: {
        fontSize: 10,
        color: '#334155',
        lineHeight: 1.7,
        textAlign: 'justify',
    },
    despachoHighlight: {
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a2e',
    },

    // Assinaturas
    signaturesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        marginBottom: 12,
    },
    signatureBlock: {
        width: '42%',
        alignItems: 'center',
    },
    signatureLine: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
        borderBottomStyle: 'solid',
        marginBottom: 4,
    },
    signatureLabel: {
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center',
    },
    signatureName: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#1a1a2e',
        textAlign: 'center',
        marginTop: 2,
    },

    // Rodapé
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 56,
        right: 56,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        borderTopStyle: 'solid',
    },
    footerText: {
        fontSize: 7.5,
        color: '#94a3b8',
    },
    footerBold: {
        fontFamily: 'Helvetica-Bold',
        color: '#64748b',
    },

    // Marca de água APROVADO
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    watermark: {
        fontSize: 72,
        fontFamily: 'Helvetica-Bold',
        color: '#f0fdf4',
        transform: 'rotate(-45deg)',
        letterSpacing: 8,
    },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-AO', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function formatDateShort(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('pt-AO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function zeroPad(n: number, digits = 4): string {
    return String(n).padStart(digits, '0');
}

// ─── Componente Principal ─────────────────────────────────────────────────────

interface Props {
    transferencia: CartaTransferenciaData;
    /** Nome da organização emissora */
    organizacao?: string;
    /** Nome do sistema emissor */
    nomeSistema?: string;
}

export default function CartaTransferenciaPdf({
    transferencia,
    organizacao = 'Administração Municipal de Benguela — DMRMAB',
    nomeSistema = NOME_SISTEMA,
}: Props) {
    const municipe = transferencia.recrutamento.municipe;
    const destino = transferencia.municipioDestino;
    const localDestino = destino
        ? `${destino.nome}${destino.provincia ? `, ${destino.provincia.nome}` : ''}`
        : (transferencia.local_destino ?? '—');

    const refDoc = `TRANSF-${zeroPad(transferencia.id)}/${new Date(transferencia.data_aprovacao ?? transferencia.data_solicitacao).getFullYear()}`;
    return (
        <Document
            title={`Carta de Transferência — ${municipe.nome_completo}`}
            author={nomeSistema}
            subject="Transferência Aprovada"
        >
            <Page size="A4" style={styles.page}>
                {/* Marca de água subtil */}
                <View style={styles.watermarkContainer} fixed>
                    <Text style={styles.watermark}>APROVADO</Text>
                </View>

                {/* ── Cabeçalho ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.orgName}>{nomeSistema}</Text>
                        <Text style={styles.orgSub}>{organizacao}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.docRef}>
                            Referência do documento
                        </Text>
                        <Text style={styles.docRefValue}>{refDoc}</Text>
                        <Text style={[styles.docRef, { marginTop: 4 }]}>
                            Data de emissão
                        </Text>
                        <Text style={styles.docRefValue}>
                            {formatDateShort(new Date().toISOString())}
                        </Text>
                    </View>
                </View>

                {/* Linha decorativa */}
                <View style={styles.dividerContainer}>
                    <Svg height="3" width="100%">
                        <Line
                            x1="0"
                            y1="1"
                            x2="480"
                            y2="1"
                            strokeWidth={2}
                            stroke="#1a1a2e"
                        />
                        <Line
                            x1="0"
                            y1="3"
                            x2="160"
                            y2="3"
                            strokeWidth={1}
                            stroke="#22c55e"
                        />
                    </Svg>
                </View>

                {/* ── Banda de título ── */}
                <View style={styles.titleBand}>
                    <Text style={styles.titleBandText}>
                        Carta de Transferência
                    </Text>
                    <View style={styles.titleBandBadge}>
                        <Text style={styles.titleBandBadgeText}>
                            ✓ APROVADA
                        </Text>
                    </View>
                </View>

                {/* ── Dados do Munícipe ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados do Munícipe</Text>
                    <View style={styles.grid}>
                        <View style={styles.fieldFull}>
                            <Text style={styles.fieldLabel}>Nome Completo</Text>
                            <Text style={styles.fieldValue}>
                                {municipe.nome_completo}
                            </Text>
                        </View>
                        {municipe.bi && (
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Nº de BI</Text>
                                <Text style={styles.fieldValueNormal}>
                                    {municipe.bi}
                                </Text>
                            </View>
                        )}
                        {municipe.data_nascimento && (
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>
                                    Data de Nascimento
                                </Text>
                                <Text style={styles.fieldValueNormal}>
                                    {formatDateShort(municipe.data_nascimento)}
                                </Text>
                            </View>
                        )}
                        {municipe.telefone && (
                            <View style={styles.fieldHalf}>
                                <Text style={styles.fieldLabel}>Telefone</Text>
                                <Text style={styles.fieldValueNormal}>
                                    {municipe.telefone}
                                </Text>
                            </View>
                        )}
                        <View style={styles.fieldHalf}>
                            <Text style={styles.fieldLabel}>
                                Nº de Recrutamento
                            </Text>
                            <Text style={styles.fieldValueNormal}>
                                {zeroPad(transferencia.recrutamento.id)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Destino ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Local de Destino</Text>
                    <View style={styles.destinoBox}>
                        <View style={styles.destinoIndicator} />
                        <View style={styles.destinoContent}>
                            <Text style={styles.destinoLabel}>
                                Transferido para
                            </Text>
                            <Text style={styles.destinoMunicipio}>
                                {destino?.nome ??
                                    transferencia.local_destino ??
                                    '—'}
                            </Text>
                            {destino?.provincia && (
                                <Text style={styles.destinoProvincia}>
                                    Província de {destino.provincia.nome}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── Detalhes da Transferência ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Detalhes da Transferência
                    </Text>
                    <View style={styles.grid}>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.fieldLabel}>
                                Data da Solicitação
                            </Text>
                            <Text style={styles.fieldValueNormal}>
                                {formatDateShort(
                                    transferencia.data_solicitacao,
                                )}
                            </Text>
                        </View>
                        <View style={styles.fieldHalf}>
                            <Text style={styles.fieldLabel}>
                                Data de Aprovação
                            </Text>
                            <Text style={styles.fieldValue}>
                                {formatDateShort(transferencia.data_aprovacao)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Despacho ── */}
                <View style={styles.despachoBox}>
                    <Text style={styles.despachoText}>
                        {'Certifica-se que o(a) munícipe '}
                        <Text style={styles.despachoHighlight}>
                            {municipe.nome_completo}
                        </Text>
                        {', com o recrutamento nº '}
                        <Text style={styles.despachoHighlight}>
                            {zeroPad(transferencia.recrutamento.id)}
                        </Text>
                        {', teve a sua solicitação de transferência para '}
                        <Text style={styles.despachoHighlight}>
                            {localDestino}
                        </Text>
                        {' devidamente aprovada em '}
                        <Text style={styles.despachoHighlight}>
                            {formatDate(transferencia.data_aprovacao)}
                        </Text>
                        {`. O presente documento é válido como comprovativo oficial de transferência no âmbito do ${nomeSistema}.`}
                    </Text>
                </View>

                {/* ── Assinaturas ── */}
                <View style={styles.signaturesRow}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>
                            Assinatura do Munícipe
                        </Text>
                        <Text style={styles.signatureName}>
                            {municipe.nome_completo}
                        </Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>Aprovado por</Text>
                        <Text style={styles.signatureName}>
                            {transferencia.user_aprovou?.name ?? '—'}
                        </Text>
                    </View>
                </View>

                {/* ── Rodapé ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        <Text style={styles.footerBold}>{nomeSistema}</Text>
                        {' · Documento gerado electronicamente'}
                    </Text>
                    <Text style={styles.footerText}>{refDoc}</Text>
                </View>
            </Page>
        </Document>
    );
}
