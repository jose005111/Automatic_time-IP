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
import type { Municipe } from '@/types/municipe';

const NAVY = '#0f2d52';
const NAVY_MID = '#1e4a7a';
const TEAL = '#0d6e56';
const PURPLE = '#4a3aad';
const AMBER = '#8c5c0a';
const SLATE = '#475569';
const LIGHT = '#f1f5f9';
const BORDER = '#e2e8f0';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 30,
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#1e293b',
        lineHeight: 1.45,
        backgroundColor: WHITE,
    },

    /* ── HEADER ── */
    headerWrap: {
        marginBottom: 12,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    govLabel: {
        fontSize: 7,
        color: NAVY,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.5,
    },
    titleBlock: {
        alignItems: 'center',
        marginBottom: 8,
    },
    mainTitle: {
        fontSize: 15,
        fontFamily: 'Helvetica-Bold',
        color: NAVY,
        letterSpacing: 0.3,
    },
    subTitle: {
        fontSize: 7.5,
        color: SLATE,
        textAlign: 'center',
        marginTop: 2,
    },
    ruleThick: {
        borderBottomWidth: 2.5,
        borderBottomColor: NAVY,
        marginBottom: 2,
    },
    ruleThin: {
        borderBottomWidth: 0.5,
        borderBottomColor: TEAL,
        marginBottom: 10,
    },

    /* ── HERO CARD ── */
    heroCard: {
        backgroundColor: NAVY,
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    heroLeft: {
        flex: 1,
    },
    heroName: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: WHITE,
        marginBottom: 2,
    },
    heroSub: {
        fontSize: 7.5,
        color: '#93c5fd',
    },
    heroBadge: {
        backgroundColor: '#1e4a7a',
        borderRadius: 3,
        paddingHorizontal: 7,
        paddingVertical: 3,
        alignItems: 'flex-end',
    },
    heroBadgeLabel: {
        fontSize: 6.5,
        color: '#93c5fd',
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.4,
    },
    heroBadgeValue: {
        fontSize: 9,
        color: WHITE,
        fontFamily: 'Helvetica-Bold',
        marginTop: 1,
    },

    /* ── SECTION HEADER ── */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        marginTop: 8,
    },
    sectionBar: {
        width: 3,
        height: 10,
        borderRadius: 2,
        marginRight: 5,
    },
    sectionTitle: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.6,
    },
    sectionLine: {
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER,
        marginLeft: 6,
    },

    /* ── CARD ── */
    card: {
        backgroundColor: LIGHT,
        borderRadius: 3,
        padding: 8,
        marginBottom: 6,
        borderLeftWidth: 2,
    },

    /* ── GRID 2 COLS ── */
    grid2: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    col: {
        flex: 1,
    },

    /* ── FIELD ROW ── */
    fieldRow: {
        flexDirection: 'row',
        marginBottom: 3,
        alignItems: 'flex-start',
    },
    fieldLabel: {
        fontSize: 7,
        color: SLATE,
        width: '35%',
    },
    fieldValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        width: '65%',
        color: '#0f172a',
    },
    fieldLabelFull: {
        fontSize: 7,
        color: SLATE,
        width: '30%',
    },
    fieldValueFull: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        width: '70%',
        color: '#0f172a',
    },
    empty: {
        color: '#94a3b8',
        fontFamily: 'Helvetica',
        fontStyle: 'italic',
    },

    /* ── STATUS BADGE ── */
    badgePill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: WHITE,
        alignSelf: 'flex-start',
    },

    /* ── PARENT CARD ── */
    parentCard: {
        flex: 1,
        backgroundColor: LIGHT,
        borderRadius: 3,
        padding: 7,
        borderLeftWidth: 2,
    },
    parentLabel: {
        fontSize: 6.5,
        color: SLATE,
        fontFamily: 'Helvetica-Bold',
        letterSpacing: 0.4,
        marginBottom: 2,
    },
    parentName: {
        fontSize: 8.5,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
        marginBottom: 1,
    },
    parentDetail: {
        fontSize: 7,
        color: SLATE,
    },

    /* ── RECRUITMENT ── */
    recCard: {
        backgroundColor: LIGHT,
        borderRadius: 3,
        padding: 8,
        marginBottom: 5,
        borderLeftWidth: 2,
        borderLeftColor: AMBER,
    },
    recHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    recTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
    },
    recObs: {
        fontSize: 7,
        color: SLATE,
        marginTop: 2,
    },

    /* ── FOOTER ── */
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 30,
        right: 30,
    },
    footerRule: {
        borderTopWidth: 0.5,
        borderTopColor: BORDER,
        marginBottom: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    footerText: {
        fontSize: 6.5,
        color: '#94a3b8',
    },
    signRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 100,
    },
    signBlock: {
        width: '44%',
        alignItems: 'center',
    },
    signLine: {
        borderTopWidth: 0.5,
        borderTopColor: '#94a3b8',
        width: '100%',
        marginBottom: 3,
    },
    signLabel: {
        fontSize: 6.5,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

/* ─────────────── helpers ─────────────── */
const fmt = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('pt-PT') : null;

const val = (v?: string | number | null, suffix = '') =>
    v != null && v !== '' && v !== '—' ? `${v}${suffix}` : null;

const Dash = () => <Text style={styles.empty}>—</Text>;

const Field = ({
    label,
    children,
    wide,
}: {
    label: string;
    children: React.ReactNode;
    wide?: boolean;
}) => (
    <View style={styles.fieldRow}>
        <Text style={wide ? styles.fieldLabelFull : styles.fieldLabel}>
            {label}
        </Text>
        <Text style={wide ? styles.fieldValueFull : styles.fieldValue}>
            {children}
        </Text>
    </View>
);

const SectionHead = ({
    num,
    title,
    color,
}: {
    num: string;
    title: string;
    color: string;
}) => (
    <View style={styles.sectionHeader}>
        <View style={[styles.sectionBar, { backgroundColor: color }]} />
        <Text style={[styles.sectionTitle, { color }]}>
            {num}. {title.toUpperCase()}
        </Text>
        <View style={styles.sectionLine} />
    </View>
);

const Card = ({
    color,
    children,
}: {
    color: string;
    children: React.ReactNode;
}) => <View style={[styles.card, { borderLeftColor: color }]}>{children}</View>;

const getBadge = (estado: number) => {
    if (estado === 1) return { text: 'APROVADO', bg: '#059669' };
    if (estado === 2) return { text: 'REJEITADO', bg: '#dc2626' };
    return { text: 'PENDENTE', bg: '#d97706' };
};

/* ─────────────── component ─────────────── */
interface Props {
    municipe: Municipe;
}

const FichaMunicipePDF: React.FC<Props> = ({ municipe }) => {
    const db = municipe.dados_biograficos;
    const dc = municipe.dados_complementares;
    const en = municipe.endereco;

    const sexoLabel =
        municipe.sexo === 'M'
            ? 'Masculino'
            : municipe.sexo === 'F'
              ? 'Feminino'
              : (municipe.sexo ?? null);

    const now = new Date().toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ── CABEÇALHO ── */}
                <View style={styles.headerWrap}>
                    <View style={styles.headerTop}>
                        <Text style={styles.govLabel}>REPÚBLICA DE ANGOLA</Text>
                        <Text style={styles.govLabel}>{NOME_SISTEMA}</Text>
                    </View>
                    <View style={styles.titleBlock}>
                        <Text style={styles.mainTitle}>FICHA DO MUNÍCIPE</Text>
                        <Text style={styles.subTitle}>
                            Administração Municipal de Benguela — Direcção
                            Municipal dos Registos e Modernização Administrativa
                        </Text>
                    </View>
                    <View style={styles.ruleThick} />
                    <View style={styles.ruleThin} />
                </View>

                {/* ── HERO ── */}
                <View style={styles.heroCard}>
                    <View style={styles.heroLeft}>
                        <Text style={styles.heroName}>
                            {municipe.nome_completo}
                        </Text>
                        <Text style={styles.heroSub}>
                            {[sexoLabel, municipe.estado_civil]
                                .filter(Boolean)
                                .join(' · ') || 'Dados de identificação'}
                        </Text>
                        {municipe.naturalidade && (
                            <Text style={[styles.heroSub, { marginTop: 2 }]}>
                                Natural de {municipe.naturalidade}
                            </Text>
                        )}
                    </View>
                    <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeLabel}>CÓD. MUNÍCIPE</Text>
                        <Text style={styles.heroBadgeValue}>
                            #{String(municipe.id).padStart(4, '0')}
                        </Text>
                        {municipe.data_nascimento && (
                            <>
                                <Text
                                    style={[
                                        styles.heroBadgeLabel,
                                        { marginTop: 5 },
                                    ]}
                                >
                                    DATA NASC.
                                </Text>
                                <Text style={styles.heroBadgeValue}>
                                    {fmt(municipe.data_nascimento)}
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                {/* ── 1. DADOS PESSOAIS ── */}
                <SectionHead num="1" title="Dados Pessoais" color={NAVY} />
                <View style={styles.grid2}>
                    <Card color={NAVY}>
                        <Field label="Nome Completo" wide>
                            {municipe.nome_completo ?? <Dash />}
                        </Field>
                        <Field label="Data de Nascimento" wide>
                            {fmt(municipe.data_nascimento) ?? <Dash />}
                        </Field>
                        <Field label="Sexo" wide>
                            {sexoLabel ?? <Dash />}
                        </Field>
                        <Field label="Estado Civil" wide>
                            {val(municipe.estado_civil) ?? <Dash />}
                        </Field>
                    </Card>
                    <Card color={NAVY}>
                        <Field label="Naturalidade" wide>
                            {val(municipe.naturalidade) ?? <Dash />}
                        </Field>
                        <Field label="Telefone" wide>
                            {val(municipe.telefone) ?? <Dash />}
                        </Field>
                        <Field label="Celular" wide>
                            {val(municipe.celular) ?? <Dash />}
                        </Field>
                    </Card>
                </View>

                {/* ── 2. DOCUMENTAÇÃO ── */}
                <SectionHead num="2" title="Documentação" color={TEAL} />
                <Card color={TEAL}>
                    <View style={styles.grid2}>
                        <View>
                            <Field label="Nº do BI">
                                {val(municipe.bi_numero) ?? <Dash />}
                            </Field>
                            <Field label="Data de Emissão">
                                {fmt(municipe.bi_data_emissao) ?? <Dash />}
                            </Field>
                            <Field label="Data de Validade">
                                {fmt(municipe.bi_data_validade) ?? <Dash />}
                            </Field>
                        </View>
                        <View>
                            <Field label="Entidade Emissora">
                                {val(dc?.entidade_emissora_bi) ?? <Dash />}
                            </Field>
                            <Field label="NIF">
                                {val(dc?.nif) ?? <Dash />}
                            </Field>
                            <Field label="Caixa Postal">
                                {val(dc?.caixa_postal) ?? <Dash />}
                            </Field>
                        </View>
                    </View>
                </Card>

                {/* ── 3. PROGENITORES ── */}
                <SectionHead num="3" title="Progenitores" color={NAVY_MID} />
                <View style={styles.grid2}>
                    {/* PAI */}
                    <View
                        style={[
                            styles.parentCard,
                            { borderLeftColor: NAVY_MID },
                        ]}
                    >
                        <Text style={styles.parentLabel}>PAI</Text>
                        <Text style={styles.parentName}>
                            {municipe.pai?.nome_completo ?? 'Não informado'}
                        </Text>
                        {municipe.pai?.data_nascimento && (
                            <Text style={styles.parentDetail}>
                                Nascido em {fmt(municipe.pai.data_nascimento)}
                            </Text>
                        )}
                        {municipe.pai?.naturalidade && (
                            <Text style={styles.parentDetail}>
                                Natural de {municipe.pai.naturalidade}
                            </Text>
                        )}
                        {municipe.pai?.profissao && (
                            <Text style={styles.parentDetail}>
                                {municipe.pai.profissao}
                            </Text>
                        )}
                    </View>

                    {/* MÃE */}
                    <View
                        style={[
                            styles.parentCard,
                            { borderLeftColor: '#7c3aed' },
                        ]}
                    >
                        <Text
                            style={[styles.parentLabel, { color: '#7c3aed' }]}
                        >
                            MÃE
                        </Text>
                        <Text style={styles.parentName}>
                            {municipe.mae?.nome_completo ?? 'Não informada'}
                        </Text>
                        {municipe.mae?.data_nascimento && (
                            <Text style={styles.parentDetail}>
                                Nascida em {fmt(municipe.mae.data_nascimento)}
                            </Text>
                        )}
                        {municipe.mae?.naturalidade && (
                            <Text style={styles.parentDetail}>
                                Natural de {municipe.mae.naturalidade}
                            </Text>
                        )}
                        {municipe.mae?.profissao && (
                            <Text style={styles.parentDetail}>
                                {municipe.mae.profissao}
                            </Text>
                        )}
                    </View>
                </View>

                {/* ── 4. DADOS BIOGRÁFICOS ── */}
                {db && (
                    <>
                        <SectionHead
                            num="4"
                            title="Dados Biográficos"
                            color={PURPLE}
                        />
                        <Card color={PURPLE}>
                            <View style={styles.grid2}>
                                <View>
                                    <Field label="NIP">
                                        {val(db.nip) ?? <Dash />}
                                    </Field>
                                    <Field label="Assento Nº">
                                        {val(db.assento_numero) ?? <Dash />}
                                    </Field>
                                    <Field label="Cédula Nº">
                                        {val(db.cedula_numero) ?? <Dash />}
                                    </Field>
                                    <Field label="Reg. Civil">
                                        {val(db.registro_civil) ?? <Dash />}
                                    </Field>
                                    <Field label="Reg. Número">
                                        {val(db.registro_numero) ?? <Dash />}
                                    </Field>
                                </View>
                                <View>
                                    <Field label="Ramo de Actividade">
                                        {val(db.ramo_actividade) ??
                                            val(db.ramo) ?? <Dash />}
                                    </Field>
                                    <Field label="Nº de Filhos">
                                        {db.numero_filhos != null ? (
                                            String(db.numero_filhos)
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>
                                    <Field label="Vencimento">
                                        {val(db.vencimento) ? (
                                            `${db.vencimento} Kz`
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>
                                    <Field label="Ano Incorporação">
                                        {val(db.ano_incorporacao) ?? <Dash />}
                                    </Field>
                                    <Field label="Ano de Serviço">
                                        {val(db.ano_servico) ?? <Dash />}
                                    </Field>
                                </View>
                            </View>
                            {db.modo_vida && (
                                <Field label="Modo de Vida" wide>
                                    {db.modo_vida}
                                </Field>
                            )}
                            {db.ano_abandono && (
                                <Field label="Ano de Abandono" wide>
                                    {db.ano_abandono}
                                </Field>
                            )}
                        </Card>
                    </>
                )}

                {/* ── 5. DADOS COMPLEMENTARES ── */}
                {dc && (
                    <>
                        <SectionHead
                            num="5"
                            title="Dados Complementares"
                            color={TEAL}
                        />
                        <Card color={TEAL}>
                            <View style={styles.grid2}>
                                <View>
                                    <Field label="Profissão">
                                        {val(dc.profissao) ?? <Dash />}
                                    </Field>
                                    <Field label="Habilitação Literária">
                                        {val(dc.habilitacao_literaria) ?? (
                                            <Dash />
                                        )}
                                    </Field>
                                    <Field label="Encargo Familiar">
                                        {dc.encargo_familiar != null ? (
                                            String(dc.encargo_familiar)
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>
                                    <Field label="Nº de Irmãos">
                                        {dc.numero_irmaos != null ? (
                                            String(dc.numero_irmaos)
                                        ) : (
                                            <Dash />
                                        )}
                                    </Field>
                                </View>
                                <View>
                                    <Field label="Nº Carta de Condução">
                                        {val(dc.numero_carta_conducao) ?? (
                                            <Dash />
                                        )}
                                    </Field>
                                    <Field label="Emissão Carta">
                                        {fmt(dc.data_emissao_carta) ?? <Dash />}
                                    </Field>
                                    <Field label="Validade Carta">
                                        {fmt(dc.data_validade_carta) ?? (
                                            <Dash />
                                        )}
                                    </Field>
                                    {val(dc.atributo) && (
                                        <Field label="Atributo">
                                            {dc.atributo}
                                        </Field>
                                    )}
                                </View>
                            </View>
                        </Card>
                    </>
                )}

                {/* ── 6. ENDEREÇO ── */}
                {en && (
                    <>
                        <SectionHead num="6" title="Endereço" color="#7c3aed" />
                        <Card color="#7c3aed">
                            <Field label="Morada" wide>
                                {val(en.morada) ?? <Dash />}
                            </Field>
                            <Field label="Localidade" wide>
                                {val(en.localidade) ?? <Dash />}
                            </Field>
                            <Field label="Comuna" wide>
                                {val(en.comuna) ?? <Dash />}
                            </Field>
                        </Card>
                    </>
                )}

                {/* ── 7. RECRUTAMENTOS ── */}
                {municipe.recrutamentos &&
                    municipe.recrutamentos.length > 0 && (
                        <>
                            <SectionHead
                                num="7"
                                title="Recrutamentos"
                                color={AMBER}
                            />
                            {municipe.recrutamentos.map((rec, i) => {
                                const badge = getBadge(rec.estado);
                                const hasTrans =
                                    rec.transferencias &&
                                    rec.transferencias.length > 0;
                                return (
                                    <View key={rec.id} style={styles.recCard}>
                                        <View style={styles.recHeader}>
                                            <Text style={styles.recTitle}>
                                                Recrutamento #{i + 1} —{' '}
                                                {fmt(rec.data_recruta) ??
                                                    'Data não informada'}
                                            </Text>
                                            <View
                                                style={[
                                                    styles.badgePill,
                                                    {
                                                        backgroundColor:
                                                            badge.bg,
                                                    },
                                                ]}
                                            >
                                                <Text>{badge.text}</Text>
                                            </View>
                                        </View>
                                        {rec.observacoes && (
                                            <Text style={styles.recObs}>
                                                Obs: {rec.observacoes}
                                            </Text>
                                        )}
                                        {hasTrans && (
                                            <Text
                                                style={[
                                                    styles.recObs,
                                                    { marginTop: 3 },
                                                ]}
                                            >
                                                Transferências:{' '}
                                                {rec.transferencias!.length}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </>
                    )}

                {/* ── ASSINATURA ── */}
                <View style={styles.signRow}>
                    <View style={styles.signBlock}>
                        <View style={styles.signLine} />
                        <Text style={styles.signLabel}>
                            Assinatura do Responsável
                        </Text>
                    </View>
                    <View style={styles.signBlock}>
                        <Text style={[styles.signLabel, { marginTop: 12 }]}>
                            Benguela, {now}
                        </Text>
                    </View>
                </View>

                {/* ── RODAPÉ ── */}
                <View style={styles.footer}>
                    <View style={styles.footerRule} />
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>{NOME_SISTEMA}</Text>
                        <Text style={styles.footerText}>
                            Confidencial · Gerado em {now}
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default FichaMunicipePDF;
