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
import AppLayout from '@/layouts/app-layout';
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
    Download,
    Filter,
    Users,
    UserCheck,
    AlertCircle,
    Clock,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import generateRelatorioEstatisticasPDF from '@/lib/pdf/generateRelatorioEstatisticasPDF';

interface Municipio {
    id: number;
    nome: string;
}
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
interface Props {
    kpis: Kpi;
    recrutamentosPorMes: ChartData[];
    porSexo: ChartData[];
    porEstadoRecrutamento: ChartData[];
    topMunicipios: ChartData[];
    cadastrosPorMes: ChartData[];
    Municipios: Municipio[];
    filters: { start_date?: string; end_date?: string; municipio_id?: string };
}

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
];

export default function ReportsIndex({
    kpis,
    recrutamentosPorMes,
    porSexo,
    porEstadoRecrutamento,
    topMunicipios,
    cadastrosPorMes,
    Municipios,
    filters,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Relatórios', href: '/reports' },
    ];

    // ✅ Estado controlado para os filtros
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate] = useState(filters.end_date ?? '');
    const [municipioId, setMunicipioId] = useState(
        filters.municipio_id ?? 'all',
    );

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/reports',
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                municipio_id: municipioId !== 'all' ? municipioId : undefined,
            },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatórios e Estatísticas - SIGID" />
            <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Relatórios e Estatísticas
                        </h1>
                        <p className="text-muted-foreground">
                            Análise avançada de dados do SIGID — DMRMAB Benguela
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                            generateRelatorioEstatisticasPDF({
                                kpis,
                                recrutamentosPorMes,
                                porSexo,
                                porEstadoRecrutamento,
                                topMunicipios,
                                cadastrosPorMes,
                                filters: {
                                    ...filters,
                                    municipio_nome: Municipios.find(
                                        (p) =>
                                            p.id.toString() ===
                                            filters.municipio_id,
                                    )?.nome,
                                },
                            })
                        }
                    >
                        <Download className="h-4 w-4" /> Exportar PDF
                    </Button>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="pt-6">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-wrap items-end gap-4"
                        >
                            <div>
                                <label className="text-sm font-medium">
                                    Data Início
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Data Fim
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Municípios de Benguela
                                </label>
                                {/* ✅ Select controlado via estado — não depende de FormData */}
                                <Select
                                    value={municipioId}
                                    onValueChange={setMunicipioId}
                                >
                                    <SelectTrigger className="mt-1 w-[200px]">
                                        <SelectValue placeholder="Todos os Municípios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todos os Municípios
                                        </SelectItem>
                                        {Municipios.map((m) => (
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
                            <Button type="submit" className="gap-2">
                                <Filter className="h-4 w-4" /> Aplicar Filtros
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* KPIs — inalterados, só copiados */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Munícipes
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {kpis.total_municipes}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Recrutamentos Pendentes
                            </CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">
                                {kpis.recrutamentos_pendentes}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Recrutamentos Aprovados
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {kpis.recrutamentos_aprovados}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Transferências Pendentes
                            </CardTitle>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">
                                {kpis.transferencias_pendentes}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Com BI Válido
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {kpis.municipes_com_bi_valido}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts — inalterados */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recrutamentos por Mês</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={recrutamentosPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="total"
                                        fill="#0088FE"
                                        radius={4}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição por Sexo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-[320px] items-center justify-center">
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
                                                fill={COLORS[i % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado dos Recrutamentos</CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-[320px] items-center justify-center">
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
                                        {porEstadoRecrutamento.map((_, i) => (
                                            <Cell
                                                key={i}
                                                fill={COLORS[i % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Top Municípios com mais Munícipes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={topMunicipios}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
