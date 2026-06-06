import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Svg,
    Line,
} from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Kpi {
    total_municipes: number;
    recrutamentos_pendentes: number;
    recrutamentos_aprovados: number;
    transferencias_pendentes: number;
    municipes_com_bi_valido: number;
}

interface ChartData {
    mes?: string;
    total?: number;
    name?: string;
    value?: number;
    municipio?: string;
    cadastros?: number;
}

export interface RelatorioEstatisticasData {
    kpis: Kpi;
    recrutamentosPorMes: ChartData[];
    porSexo: ChartData[];
    porEstadoRecrutamento: ChartData[];
    topMunicipios: ChartData[];
    cadastrosPorMes: ChartData[];
    filters: {
        start_date?: string;
        end_date?: string;
        provincia_id?: string;
        provincia_nome?: string;
    };
    geradoEm?: string;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
    navy: '#0D1B2A',
    teal: '#0E7490',
    tealLt: '#CFFAFE',
    green: '#15803D',
    greenLt: '#DCFCE7',
    orange: '#C2410C',
    orangeLt: '#FEF3C7',
    yellow: '#D97706',
    yellowLt: '#FEF9C3',
    blue: '#1D4ED8',
    blueLt: '#DBEAFE',
    slate: '#475569',
    slateXl: '#94A3B8',
    border: '#E2E8F0',
    white: '#FFFFFF',
    offWhite: '#F8FAFC',
    chartColors: [
        '#0E7490',
        '#15803D',
        '#D97706',
        '#C2410C',
        '#1D4ED8',
        '#7C3AED',
    ],
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        backgroundColor: C.offWhite,
        paddingTop: 0,
        paddingBottom: 36,
        paddingHorizontal: 0,
        fontSize: 9,
        color: C.navy,
    },

    // Header band
    headerBand: {
        backgroundColor: C.navy,
        paddingHorizontal: 32,
        paddingTop: 28,
        paddingBottom: 22,
        marginBottom: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 9,
        color: C.slateXl,
        marginTop: 3,
    },
    headerBadge: {
        backgroundColor: C.teal,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    headerBadgeText: {
        color: C.white,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },

    // Filter bar
    filterBar: {
        marginHorizontal: 32,
        marginBottom: 20,
        backgroundColor: C.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: C.border,
        padding: 12,
        flexDirection: 'row',
        gap: 24,
    },
    filterItem: {
        flexDirection: 'column',
        gap: 2,
    },
    filterLabel: {
        fontSize: 7,
        color: C.slateXl,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterValue: {
        fontSize: 9,
        color: C.navy,
        fontFamily: 'Helvetica-Bold',
    },

    // Section title
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.navy,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 2,
        borderBottomColor: C.teal,
    },
    sectionWrap: {
        marginHorizontal: 32,
        marginBottom: 20,
    },

    // KPI grid
    kpiGrid: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    kpiCard: {
        flex: 1,
        minWidth: 90,
        backgroundColor: C.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        padding: 12,
    },
    kpiLabel: {
        fontSize: 7,
        color: C.slate,
        marginBottom: 6,
        lineHeight: 1.3,
    },
    kpiValue: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
    },
    kpiAccent: {
        width: 28,
        height: 3,
        borderRadius: 2,
        marginTop: 6,
    },

    // Mini bar chart
    chartCard: {
        backgroundColor: C.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        marginBottom: 12,
    },
    chartTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: C.navy,
        marginBottom: 12,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
        gap: 6,
    },
    barLabel: {
        width: 50,
        fontSize: 7,
        color: C.slate,
        textAlign: 'right',
    },
    barLabelWide: {
        width: 100,
        fontSize: 7,
        color: C.slate,
        textAlign: 'right',
    },
    barTrack: {
        flex: 1,
        height: 14,
        backgroundColor: C.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: 14,
        borderRadius: 3,
    },
    barValue: {
        width: 28,
        fontSize: 7,
        color: C.slate,
        textAlign: 'left',
    },

    // Two-column layout
    twoCol: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },

    // Pie legend table
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
        gap: 7,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLabel: {
        flex: 1,
        fontSize: 8,
        color: C.slate,
    },
    legendValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.navy,
    },
    legendPct: {
        fontSize: 7,
        color: C.slateXl,
        width: 32,
        textAlign: 'right',
    },

    // Divider
    divider: {
        marginHorizontal: 32,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 14,
        left: 32,
        right: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: C.slateXl,
    },
    footerBrand: {
        fontSize: 7,
        color: C.teal,
        fontFamily: 'Helvetica-Bold',
    },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maxValue(
    data: ChartData[],
    key: 'total' | 'value' | 'cadastros',
): number {
    return Math.max(...data.map((d) => (d[key] as number) ?? 0), 1);
}

function sumValues(data: ChartData[], key: 'value'): number {
    return data.reduce((acc, d) => acc + ((d[key] as number) ?? 0), 0);
}

function formatDate(iso?: string): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
    label,
    value,
    color,
    accentColor,
}: {
    label: string;
    value: number;
    color: string;
    accentColor: string;
}) {
    return (
        <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>{label}</Text>
            <Text style={[s.kpiValue, { color }]}>
                {value.toLocaleString('pt-PT')}
            </Text>
            <View style={[s.kpiAccent, { backgroundColor: accentColor }]} />
        </View>
    );
}

function HorizontalBarChart({
    title,
    data,
    dataKey,
    labelKey,
    color,
    labelWidth = 'narrow',
}: {
    title: string;
    data: ChartData[];
    dataKey: 'total' | 'cadastros';
    labelKey: 'mes' | 'municipio';
    color: string;
    labelWidth?: 'narrow' | 'wide';
}) {
    const max = maxValue(data, dataKey);
    return (
        <View style={s.chartCard}>
            <Text style={s.chartTitle}>{title}</Text>
            {data.map((d, i) => {
                const val = (d[dataKey] as number) ?? 0;
                const pct = max > 0 ? (val / max) * 100 : 0;
                return (
                    <View key={i} style={s.barRow}>
                        <Text
                            style={
                                labelWidth === 'wide'
                                    ? s.barLabelWide
                                    : s.barLabel
                            }
                            numberOfLines={1}
                        >
                            {d[labelKey] ?? ''}
                        </Text>
                        <View style={s.barTrack}>
                            <View
                                style={[
                                    s.barFill,
                                    {
                                        width: `${pct}%`,
                                        backgroundColor: color,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={s.barValue}>{val}</Text>
                    </View>
                );
            })}
        </View>
    );
}

function PieLegend({ title, data }: { title: string; data: ChartData[] }) {
    const total = sumValues(data, 'value');
    return (
        <View style={s.chartCard}>
            <Text style={s.chartTitle}>{title}</Text>
            {data.map((d, i) => {
                const val = (d.value as number) ?? 0;
                const pct =
                    total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
                const color = C.chartColors[i % C.chartColors.length];
                // Visual "pie slice" as a proportional horizontal bar
                return (
                    <View key={i} style={s.legendRow}>
                        <View
                            style={[s.legendDot, { backgroundColor: color }]}
                        />
                        <Text style={s.legendLabel}>{d.name ?? '—'}</Text>
                        <Text style={s.legendValue}>
                            {val.toLocaleString('pt-PT')}
                        </Text>
                        <Text style={s.legendPct}>{pct}%</Text>
                    </View>
                );
            })}
            {/* Visual bar breakdown */}
            <View
                style={{
                    flexDirection: 'row',
                    height: 8,
                    borderRadius: 4,
                    overflow: 'hidden',
                    marginTop: 8,
                }}
            >
                {data.map((d, i) => {
                    const val = (d.value as number) ?? 0;
                    const pct = total > 0 ? (val / total) * 100 : 0;
                    return (
                        <View
                            key={i}
                            style={{
                                width: `${pct}%`,
                                backgroundColor:
                                    C.chartColors[i % C.chartColors.length],
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
}

// ─── Main Document ────────────────────────────────────────────────────────────

export default function RelatorioEstatisticasPDF({
    data,
}: {
    data: RelatorioEstatisticasData;
}) {
    const {
        kpis,
        recrutamentosPorMes,
        porSexo,
        porEstadoRecrutamento,
        topMunicipios,
        cadastrosPorMes,
        filters,
        geradoEm,
    } = data;

    const periodoLabel =
        filters.start_date || filters.end_date
            ? `${formatDate(filters.start_date)} – ${formatDate(filters.end_date)}`
            : 'Todo o período';

    const provinciaLabel = filters.provincia_nome ?? 'Todas as Províncias';

    const now = geradoEm
        ? geradoEm
        : new Date().toLocaleString('pt-PT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });

    return (
        <Document
            title="Relatório de Estatísticas — SIGID"
            author="DMRMAB Benguela"
            subject="Análise avançada de dados do SIGID"
        >
            <Page size="A4" style={s.page}>
                {/* ── Header ── */}
                <View style={s.headerBand}>
                    <View style={s.headerRow}>
                        <View>
                            <Text style={s.headerTitle}>
                                Relatório de Estatísticas
                            </Text>
                            <Text style={s.headerSubtitle}>
                                SIGID — DMRMAB Benguela · Análise avançada de
                                dados
                            </Text>
                        </View>
                        <View style={s.headerBadge}>
                            <Text style={s.headerBadgeText}>SIGID</Text>
                        </View>
                    </View>
                </View>

                {/* ── Filter Summary ── */}
                <View style={s.filterBar}>
                    <View style={s.filterItem}>
                        <Text style={s.filterLabel}>Período</Text>
                        <Text style={s.filterValue}>{periodoLabel}</Text>
                    </View>
                    <View style={s.filterItem}>
                        <Text style={s.filterLabel}>Província</Text>
                        <Text style={s.filterValue}>{provinciaLabel}</Text>
                    </View>
                    <View style={[s.filterItem, { marginLeft: 'auto' }]}>
                        <Text style={s.filterLabel}>Gerado em</Text>
                        <Text style={s.filterValue}>{now}</Text>
                    </View>
                </View>

                {/* ── KPIs ── */}
                <View style={s.sectionWrap}>
                    <Text style={s.sectionTitle}>Indicadores Gerais</Text>
                    <View style={s.kpiGrid}>
                        <KpiCard
                            label="Total de Munícipes"
                            value={kpis.total_municipes}
                            color={C.navy}
                            accentColor={C.teal}
                        />
                        <KpiCard
                            label="Recrutamentos Pendentes"
                            value={kpis.recrutamentos_pendentes}
                            color={C.orange}
                            accentColor={C.orange}
                        />
                        <KpiCard
                            label="Recrutamentos Aprovados"
                            value={kpis.recrutamentos_aprovados}
                            color={C.green}
                            accentColor={C.green}
                        />
                        <KpiCard
                            label="Transferências Pendentes"
                            value={kpis.transferencias_pendentes}
                            color={C.yellow}
                            accentColor={C.yellow}
                        />
                        <KpiCard
                            label="Munícipes com BI Válido"
                            value={kpis.municipes_com_bi_valido}
                            color={C.blue}
                            accentColor={C.blue}
                        />
                    </View>
                </View>

                {/* ── Charts row 1 ── */}
                <View style={[s.sectionWrap, { marginBottom: 12 }]}>
                    <Text style={s.sectionTitle}>Distribuição</Text>
                    <View style={s.twoCol}>
                        <View style={s.col}>
                            <PieLegend
                                title="Distribuição por Sexo"
                                data={porSexo}
                            />
                        </View>
                        <View style={s.col}>
                            <PieLegend
                                title="Estado dos Recrutamentos"
                                data={porEstadoRecrutamento}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Charts row 2 ── */}
                <View style={s.sectionWrap}>
                    <Text style={s.sectionTitle}>Actividade</Text>
                    <View style={s.twoCol}>
                        <View style={s.col}>
                            <HorizontalBarChart
                                title="Recrutamentos por Mês"
                                data={recrutamentosPorMes}
                                dataKey="total"
                                labelKey="mes"
                                color={C.teal}
                            />
                        </View>
                        <View style={s.col}>
                            <HorizontalBarChart
                                title="Evolução de Cadastros (12 meses)"
                                data={cadastrosPorMes}
                                dataKey="cadastros"
                                labelKey="mes"
                                color={C.blue}
                            />
                        </View>
                    </View>
                </View>

                {/* ── Top Municípios ── */}
                <View style={s.sectionWrap}>
                    <HorizontalBarChart
                        title="Top Municípios com mais Munícipes"
                        data={topMunicipios}
                        dataKey="total"
                        labelKey="municipio"
                        color={C.green}
                        labelWidth="wide"
                    />
                </View>

                {/* ── Footer ── */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        Documento gerado automaticamente pelo sistema SIGID
                    </Text>
                    <Text style={s.footerBrand}>DMRMAB · Benguela</Text>
                </View>
            </Page>
        </Document>
    );
}
