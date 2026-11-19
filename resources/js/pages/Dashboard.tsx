import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { NOME_SISTEMA } from '@/lib/sistema';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Users,
    UserCheck,
    ArrowRightLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    PlusCircle,
    UserPlus,
    FileText,
    MapPin,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
    estatisticas: {
        totalMunicipes: number;
        recrutamentosPendentes: number;
        recrutamentosAprovados: number;
        totalTransferencias: number;
        munícipesComBIValido: number;
        transferenciasPendentes?: number;
        munícipesSemBI?: number;
    };
    recentRecrutamentos: Array<{
        id: number;
        municipe_nome: string;
        data_recruta: string;
        estado: number;
        municipio?: string;
    }>;
}

export default function Dashboard({
    estatisticas,
    recentRecrutamentos,
}: DashboardProps) {
    const stats = [
        {
            title: 'Total de Munícipes',
            value: estatisticas.totalMunicipes,
            icon: Users,
            description: 'Cadastrados no sistema',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            href: '/municipes',
        },
        {
            title: 'Recrutamentos Pendentes',
            value: estatisticas.recrutamentosPendentes,
            icon: Clock,
            description: 'Aguardando aprovação',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            href: '/recrutamentos?estado=0',
        },
        {
            title: 'Recrutamentos Aprovados',
            value: estatisticas.recrutamentosAprovados,
            icon: UserCheck,
            description: 'Este ano',
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-100 dark:bg-green-900/30',
            href: '/recrutamentos?estado=1',
        },
        {
            title: 'Transferências Pendentes',
            value: estatisticas.transferenciasPendentes || 0,
            icon: ArrowRightLeft,
            description: 'Aguardando aprovação',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            href: '/transferencias?estado=0',
        },
    ];

    // Dados para o gráfico de pizza (Recrutamentos por estado)
    const recrutamentoStatusData = [
        {
            name: 'Pendentes',
            value: estatisticas.recrutamentosPendentes,
            color: '#f59e0b',
        },
        {
            name: 'Aprovados',
            value: estatisticas.recrutamentosAprovados,
            color: '#10b981',
        },
        {
            name: 'Rejeitados',
            value: Math.max(
                0,
                (estatisticas.totalTransferencias || 0) -
                    estatisticas.recrutamentosPendentes -
                    estatisticas.recrutamentosAprovados,
            ),
            color: '#f72525ff',
        },
    ].filter((item) => item.value > 0);

    const getStatusBadge = (estado: number) => {
        if (estado === 1) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aprovado
                </span>
            );
        }
        if (estado === 2) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> Rejeitado
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-3.5 w-3.5" /> Pendente
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard | ${NOME_SISTEMA}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Visão Geral - {NOME_SISTEMA}
                        </h1>
                        <p className="text-muted-foreground">
                            Administração Municipal de Benguela • DMRMAB
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/municipes"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Novo Munícipe
                        </Link>
                        <Link
                            href="/recrutamentos"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <Clock className="h-4 w-4" />
                            Ver Recrutamentos
                        </Link>
                        <Link
                            href="/relatorios"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                            <FileText className="h-4 w-4" />
                            Relatórios
                        </Link>
                    </div>
                </div>

                {/* KPIs Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <Link href={stat.href} key={index}>
                            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-sidebar-border dark:bg-[#161615]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {stat.title}
                                    </span>
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
                                    >
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold tracking-tighter text-gray-900 dark:text-white">
                                        {stat.value}
                                    </span>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recrutamentos Recentes */}
                    <div className="lg:col-span-2">
                        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-[#161615]">
                            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                                        <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Recrutamentos Recentes
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Últimos registos
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/recrutamentos"
                                    className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                    Ver todos →
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs tracking-wider text-gray-600 uppercase dark:bg-gray-800/60 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-medium">
                                                Munícipe
                                            </th>
                                            <th className="px-6 py-3 text-left font-medium">
                                                Data
                                            </th>
                                            <th className="px-6 py-3 text-left font-medium">
                                                Município
                                            </th>
                                            <th className="px-6 py-3 text-left font-medium">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-right font-medium">
                                                Ação
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {recentRecrutamentos &&
                                        recentRecrutamentos.length > 0 ? (
                                            recentRecrutamentos.map((rec) => (
                                                <tr
                                                    key={rec.id}
                                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {rec.municipe_nome}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                        {new Date(
                                                            rec.data_recruta,
                                                        ).toLocaleDateString(
                                                            'pt-PT',
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                        {rec.municipio || '—'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(
                                                            rec.estado,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            href={`/municipes`}
                                                            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                        >
                                                            Ver
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <Users className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                                                        <p className="text-sm text-gray-500">
                                                            Nenhum recrutamento
                                                            recente
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de Estado dos Recrutamentos + Ações Rápidas */}
                    <div className="space-y-6">
                        {/* Gráfico de Pizza */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-[#161615]">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                <h3 className="font-semibold">
                                    Estado dos Recrutamentos
                                </h3>
                            </div>
                            <div className="h-[220px]">
                                {recrutamentoStatusData.length > 0 ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={recrutamentoStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {recrutamentoStatusData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color}
                                                        />
                                                    ),
                                                )}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                        Sem dados de recrutamento
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 flex justify-center gap-4 text-xs">
                                {recrutamentoStatusData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1.5"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                        <span>
                                            {item.name}: {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-[#161615]">
                            <h3 className="mb-4 font-semibold">
                                Ações Rápidas
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href="/municipes"
                                    className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                    Cadastrar Munícipe
                                </Link>
                                <Link
                                    href="/recrutamentos"
                                    className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    Registar Recrutamento
                                </Link>
                                <Link
                                    href="/transferencias"
                                    className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                                    Nova Transferência
                                </Link>
                                <Link
                                    href="/localizacoes"
                                    className="flex items-center gap-3 rounded-xl border p-3 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <MapPin className="h-5 w-5 text-emerald-600" />
                                    Gerir Localizações
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
