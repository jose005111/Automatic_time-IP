import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import { useAppDialog } from '@/components/app-dialog-provider';
import AppLayout from '@/layouts/app-layout';
import { NOME_SISTEMA } from '@/lib/sistema';
import { index as reportsIndex } from '@/routes/reports';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertCircle,
    CalendarRange,
    ClipboardList,
    Clock,
    Download,
    Filter,
    RotateCcw,
    UserCheck,
    Users,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import generateRelatorioEstatisticasPDF from '@/lib/pdf/Generaterelatorioestatisticaspdf';

interface Municipio {
    id: number;
    nome: string;
    id_provincia: number;
}
interface Provincia {
    id: number;
    nome: string;
}
interface Kpi {
    total_municipes: number;
    total_recrutamentos: number;
    recrutamentos_pendentes: number;
    recrutamentos_aprovados: number;
    transferencias_pendentes: number;
    municipes_com_bi_valido: number;
}
interface ChartData {
    mes?: string;
    total?: number;
    pendentes?: number;
    aprovados?: number;
    rejeitados?: number;
    name?: string;
    value?: number;
    municipio?: string;
    cadastros?: number;
}
interface UltimoRecrutamento {
    id: number;
    nome: string;
    data: string;
    estado: string;
    estado_valor: number;
    municipio: string;
}
interface Filters {
    start_date?: string | null;
    end_date?: string | null;
    municipio_id?: string | number | null;
    provincia_id?: string | number | null;
    estado?: string | null;
    sexo?: string | null;
    periodo?: string | null;
    municipio_nome?: string | null;
    provincia_nome?: string | null;
}
interface Props {
    kpis: Kpi;
    recrutamentosPorMes: ChartData[];
    porSexo: ChartData[];
    porEstadoRecrutamento: ChartData[];
    topMunicipios: ChartData[];
    cadastrosPorMes: ChartData[];
    faixasEtarias: ChartData[];
    ultimosRecrutamentos: UltimoRecrutamento[];
    Municipios: Municipio[];
    Provincias: Provincia[];
    filters: Filters;
}

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
];

const toInputDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const asSelectValue = (value: unknown) =>
    value === null || value === undefined || value === ''
        ? 'all'
        : String(value);

const periodoLabel = (periodo?: string | null) => {
    switch (periodo) {
        case '12m':
            return 'Últimos 12 meses';
        case 'year':
            return 'Ano selecionado';
        case 'custom':
            return 'Personalizado';
        default:
            return 'Todo o período';
    }
};

const estadoFilterLabel = (estado?: string | null) => {
    switch (estado) {
        case '0':
            return 'Pendente';
        case '1':
            return 'Aprovado';
        case '2':
            return 'Rejeitado';
        default:
            return null;
    }
};

const sexoFilterLabel = (sexo?: string | null) =>
    sexo === 'M' ? 'Masculino' : sexo === 'F' ? 'Feminino' : null;

function ChartEmpty({ message }: { message: string }) {
    return (
        <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export default function ReportsIndex({
    kpis,
    recrutamentosPorMes,
    porSexo,
    porEstadoRecrutamento,
    topMunicipios,
    cadastrosPorMes,
    faixasEtarias,
    ultimosRecrutamentos,
    Municipios,
    Provincias,
    filters,
}: Props) {
    const { alert } = useAppDialog();
    const currentYear = new Date().getFullYear();
    const anos = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Relatórios', href: reportsIndex.url() },
    ];

    const [periodo, setPeriodo] = useState(filters.periodo ?? 'all');
    const [ano, setAno] = useState(String(currentYear));
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');
    const [provinciaId, setProvinciaId] = useState(
        asSelectValue(filters.provincia_id),
    );
    const [municipioId, setMunicipioId] = useState(
        asSelectValue(filters.municipio_id),
    );
    const [estado, setEstado] = useState(asSelectValue(filters.estado));
    const [sexo, setSexo] = useState(asSelectValue(filters.sexo));

    const aplicarAno = (valor: string) => {
        setStartDate(`${valor}-01-01`);
        setEndDate(`${valor}-12-31`);
    };

    const alterarPeriodo = (valor: string) => {
        setPeriodo(valor);

        if (valor === 'all') {
            setStartDate('');
            setEndDate('');
        } else if (valor === '12m') {
            const inicio = new Date();
            inicio.setMonth(inicio.getMonth() - 12);
            setStartDate(toInputDate(inicio));
            setEndDate(toInputDate(new Date()));
        } else if (valor === 'year') {
            aplicarAno(ano);
        }
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            reportsIndex.url({
                query: {
                    periodo,
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                    provincia_id:
                        provinciaId !== 'all' ? provinciaId : undefined,
                    municipio_id:
                        municipioId !== 'all' ? municipioId : undefined,
                    estado: estado !== 'all' ? estado : undefined,
                    sexo: sexo !== 'all' ? sexo : undefined,
                },
            }),
            {},
            { preserveState: true },
        );
    };

    const limparFiltros = () => {
        setPeriodo('all');
        setAno(String(currentYear));
        setStartDate('');
        setEndDate('');
        setProvinciaId('all');
        setMunicipioId('all');
        setEstado('all');
        setSexo('all');
        router.get(reportsIndex.url(), {}, { preserveState: true });
    };

    const municipiosFiltrados =
        provinciaId === 'all'
            ? Municipios
            : Municipios.filter((m) => String(m.id_provincia) === provinciaId);

    const periodoAtivo =
        filters.periodo === 'custom' && (filters.start_date || filters.end_date)
            ? `${filters.start_date ?? '…'} a ${filters.end_date ?? '…'}`
            : periodoLabel(filters.periodo);

    const filtrosAtivos = [
        { label: 'Período', value: periodoAtivo },
        filters.provincia_nome && {
            label: 'Província',
            value: filters.provincia_nome,
        },
        filters.municipio_nome && {
            label: 'Município',
            value: filters.municipio_nome,
        },
        estadoFilterLabel(filters.estado) && {
            label: 'Estado',
            value: estadoFilterLabel(filters.estado)!,
        },
        sexoFilterLabel(filters.sexo) && {
            label: 'Sexo',
            value: sexoFilterLabel(filters.sexo)!,
        },
    ].filter(Boolean) as { label: string; value: string }[];

    const kpiCards = [
        {
            title: 'Total Munícipes',
            value: kpis.total_municipes,
            icon: Users,
            className: 'text-muted-foreground',
        },
        {
            title: 'Recrutamentos no Período',
            value: kpis.total_recrutamentos,
            icon: ClipboardList,
            className: 'text-foreground',
        },
        {
            title: 'Recrutamentos Pendentes',
            value: kpis.recrutamentos_pendentes,
            icon: Clock,
            className: 'text-orange-600',
        },
        {
            title: 'Recrutamentos Aprovados',
            value: kpis.recrutamentos_aprovados,
            icon: UserCheck,
            className: 'text-green-600',
            subtitle: kpis.total_recrutamentos
                ? `${Math.round((kpis.recrutamentos_aprovados / kpis.total_recrutamentos) * 100)}% do período`
                : undefined,
        },
        {
            title: 'Transferências Pendentes',
            value: kpis.transferencias_pendentes,
            icon: AlertCircle,
            className: 'text-yellow-600',
        },
        {
            title: 'Com BI Válido',
            value: kpis.municipes_com_bi_valido,
            icon: UserCheck,
            className: 'text-blue-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Relatórios e Estatísticas - ${NOME_SISTEMA}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Relatórios e Estatísticas
                        </h1>
                        <p className="text-muted-foreground">
                            Análise avançada de dados do {NOME_SISTEMA}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                            void generateRelatorioEstatisticasPDF(
                                {
                                    kpis,
                                    recrutamentosPorMes,
                                    porSexo,
                                    porEstadoRecrutamento,
                                    topMunicipios,
                                    cadastrosPorMes,
                                    filters: { ...filters },
                                },
                                {
                                    onError: () => {
                                        void alert({
                                            title: 'Erro ao gerar relatório',
                                            description:
                                                'Não foi possível gerar o PDF do relatório. Tente novamente.',
                                        });
                                    },
                                },
                            )
                        }
                    >
                        <Download className="h-4 w-4" /> Exportar PDF
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleFilter}
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                        >
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Período
                                </label>
                                <Select
                                    value={periodo}
                                    onValueChange={alterarPeriodo}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todo o período
                                        </SelectItem>
                                        <SelectItem value="12m">
                                            Últimos 12 meses
                                        </SelectItem>
                                        <SelectItem value="year">
                                            Ano específico
                                        </SelectItem>
                                        <SelectItem value="custom">
                                            Personalizado
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {periodo === 'year' && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Ano
                                    </label>
                                    <Select
                                        value={ano}
                                        onValueChange={(valor) => {
                                            setAno(valor);
                                            aplicarAno(valor);
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {anos.map((item) => (
                                                <SelectItem
                                                    key={item}
                                                    value={String(item)}
                                                >
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Data Início
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    disabled={periodo !== 'custom'}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setPeriodo('custom');
                                    }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Data Fim
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    disabled={periodo !== 'custom'}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setPeriodo('custom');
                                    }}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Província
                                </label>
                                <Select
                                    value={provinciaId}
                                    onValueChange={(valor) => {
                                        setProvinciaId(valor);
                                        setMunicipioId('all');
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas as Províncias
                                        </SelectItem>
                                        {Provincias.map((p) => (
                                            <SelectItem
                                                key={p.id}
                                                value={p.id.toString()}
                                            >
                                                {p.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Município
                                </label>
                                <Select
                                    value={municipioId}
                                    onValueChange={setMunicipioId}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos os Municípios
                                        </SelectItem>
                                        {municipiosFiltrados.map((m) => (
                                            <SelectItem
                                                key={m.id}
                                                value={m.id.toString()}
                                            >
                                                {m.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Estado do Recrutamento
                                </label>
                                <Select
                                    value={estado}
                                    onValueChange={setEstado}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos os Estados
                                        </SelectItem>
                                        <SelectItem value="0">
                                            Pendente
                                        </SelectItem>
                                        <SelectItem value="1">
                                            Aprovado
                                        </SelectItem>
                                        <SelectItem value="2">
                                            Rejeitado
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Sexo
                                </label>
                                <Select value={sexo} onValueChange={setSexo}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Ambos
                                        </SelectItem>
                                        <SelectItem value="M">
                                            Masculino
                                        </SelectItem>
                                        <SelectItem value="F">
                                            Feminino
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
                                <Button type="submit" className="gap-2">
                                    <Filter className="h-4 w-4" /> Aplicar
                                    Filtros
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={limparFiltros}
                                >
                                    <RotateCcw className="h-4 w-4" /> Limpar
                                </Button>
                            </div>
                        </form>

                        {filtrosAtivos.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Filtros activos:
                                </span>
                                {filtrosAtivos.map((filtro) => (
                                    <Badge
                                        key={filtro.label}
                                        variant="secondary"
                                    >
                                        {filtro.label}: {filtro.value}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {kpiCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card key={card.title}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {card.title}
                                    </CardTitle>
                                    <Icon
                                        className={`h-4 w-4 ${card.className}`}
                                    />
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className={`text-3xl font-bold ${card.className}`}
                                    >
                                        {card.value}
                                    </div>
                                    {card.subtitle && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {card.subtitle}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recrutamentos por Mês</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {recrutamentosPorMes.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={recrutamentosPorMes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="aprovados"
                                            name="Aprovados"
                                            stackId="estado"
                                            fill="#16a34a"
                                        />
                                        <Bar
                                            dataKey="pendentes"
                                            name="Pendentes"
                                            stackId="estado"
                                            fill="#f59e0b"
                                        />
                                        <Bar
                                            dataKey="rejeitados"
                                            name="Rejeitados"
                                            stackId="estado"
                                            fill="#ef4444"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem recrutamentos no período selecionado." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Evolução de Cadastros</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {cadastrosPorMes.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={cadastrosPorMes}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="cadastros"
                                            name="Cadastros"
                                            stroke="#0E7490"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem cadastros no período selecionado." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição por Sexo</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {porSexo.some((item) => (item.value ?? 0) > 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={porSexo}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={110}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                        >
                                            {porSexo.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={
                                                        COLORS[
                                                            i % COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem munícipes no período selecionado." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estado dos Recrutamentos</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {porEstadoRecrutamento.some(
                                (item) => (item.value ?? 0) > 0,
                            ) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={porEstadoRecrutamento}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            dataKey="value"
                                            nameKey="name"
                                            label
                                        >
                                            {porEstadoRecrutamento.map(
                                                (_, i) => (
                                                    <Cell
                                                        key={i}
                                                        fill={
                                                            COLORS[
                                                                i %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem recrutamentos no período selecionado." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Top Municípios com mais Munícipes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {topMunicipios.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={topMunicipios}
                                        layout="vertical"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />
                                        <YAxis
                                            dataKey="municipio"
                                            type="category"
                                            width={120}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="total"
                                            fill="#00C49F"
                                            radius={4}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem munícipes no período selecionado." />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Faixas Etárias dos Munícipes</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            {faixasEtarias.some(
                                (item) => (item.value ?? 0) > 0,
                            ) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={faixasEtarias}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar
                                            dataKey="value"
                                            name="Munícipes"
                                            fill="#8884d8"
                                            radius={4}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty message="Sem munícipes no período selecionado." />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Últimos Recrutamentos</CardTitle>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarRange className="h-4 w-4" />
                            Ordenados por data
                        </span>
                    </CardHeader>
                    <CardContent>
                        {ultimosRecrutamentos.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Munícipe</TableHead>
                                        <TableHead>Município</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ultimosRecrutamentos.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.nome}
                                            </TableCell>
                                            <TableCell>
                                                {item.municipio}
                                            </TableCell>
                                            <TableCell>{item.data}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        item.estado_valor === 1
                                                            ? 'default'
                                                            : item.estado_valor ===
                                                                2
                                                              ? 'destructive'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {item.estado}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-10">
                                <ChartEmpty message="Nenhum recrutamento encontrado para os filtros activos." />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
