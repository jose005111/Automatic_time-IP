import React from 'react';
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
    provincias: { id: number; nome: string }[];
    filters: {
        start_date?: string;
        end_date?: string;
        provincia_id?: string;
    };
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
    provincias,
    filters,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Relatórios', href: '/reports' },
    ];

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get('/reports', Object.fromEntries(formData), {
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Relatórios e Estatísticas - SIGID" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Relatórios e Estatísticas
                        </h1>
                        <p className="text-muted-foreground">
                            Análise avançada de dados do SIGID - DMRMAB Benguela
                        </p>
                    </div>
                    <Button variant="outline" className="gap-2">
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
                                    name="start_date"
                                    defaultValue={filters.start_date}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Data Fim
                                </label>
                                <Input
                                    type="date"
                                    name="end_date"
                                    defaultValue={filters.end_date}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    Província
                                </label>
                                <Select
                                    name="provincia_id"
                                    defaultValue={filters.provincia_id || 'all'}
                                >
                                    <SelectTrigger className="mt-1 w-[200px]">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas as Províncias
                                        </SelectItem>
                                        {provincias.map((p) => (
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
                            <Button type="submit" className="gap-2">
                                <Filter className="h-4 w-4" /> Aplicar Filtros
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* KPIs */}
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

                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recrutamentos por Mês */}
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

                    {/* Distribuição por Sexo */}
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
                                        {porSexo.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Estado dos Recrutamentos */}
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
                                        {porEstadoRecrutamento.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
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
                        </CardContent>
                    </Card>

                    {/* Top Municípios */}
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

                    {/* Evolução de Cadastros */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                Evolução de Cadastros de Munícipes (Últimos 12
                                meses)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={cadastrosPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="cadastros"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
