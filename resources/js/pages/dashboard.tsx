import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Users,
    GraduationCap,
    CalendarCheck,
    FileText,
    PlusCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    BookOpen,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Definimos a interface para as props que vêm do Laravel
interface DashboardProps {
    estatisticas: {
        totalTurmas: number;
        totalProfessores: number;
        totalCursos: number;
        saude: number;
        aulasAgendadas: number;
    };
    recentSchedules: Array<{
        id: number;
        name: string;
        date: string;
        status: string;
        classes: number;
    }>;
}

export default function Dashboard({
    estatisticas,
    recentSchedules,
}: DashboardProps) {
    // Mapeamos os dados reais recebidos para o formato visual dos cards
    const stats = [
        {
            id: 1,
            title: 'Total de Turmas',
            value: estatisticas.totalTurmas.toString(),
            icon: Users,
            description: `Distribuídas em ${estatisticas.totalCursos} cursos`,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            id: 2,
            title: 'Professores Ativos',
            value: estatisticas.totalProfessores.toString(),
            icon: GraduationCap,
            description: 'Cadastrados no sistema',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            id: 3,
            title: 'Saúde dos Horários',
            value: `${estatisticas.saude}%`,
            icon: CalendarCheck,
            description: `${estatisticas.aulasAgendadas} aulas agendadas no total`,
            color:
                estatisticas.saude === 100
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400',
            bg:
                estatisticas.saude === 100
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard | Gerador de Horários" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4 md:p-6">
                {/* Cabeçalho de Boas-vindas */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Visão Geral
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Acompanhe o status do Instituto Politécnico UKB e
                            gere novos horários.
                        </p>
                    </div>

                    {/* Alterado para um Link do Inertia que aponta para a rota de geração/visualização */}
                    <Link
                        href="/horarios"
                        className="inline-flex w-fit items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Gerir Horários
                    </Link>
                </div>

                {/* Cards de Estatísticas Rápidas */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 shadow-sm dark:border-sidebar-border dark:bg-[#161615]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.title}
                                </span>
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
                                >
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </span>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {stat.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Seção Principal - Últimos Horários */}
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-[#161615]">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
                        <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Últimas Turmas Atualizadas
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800/50 dark:text-gray-300">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Turma e Curso
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Última Modificação
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Tempos Alocados
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right font-medium"
                                    >
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSchedules?.map((schedule) => (
                                    <tr
                                        key={schedule.id}
                                        className="border-b border-gray-50 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                    >
                                        <td className="flex items-center gap-3 px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                            {schedule.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.classes} aulas
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.status === 'Concluído' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    <AlertCircle className="h-3.5 w-3.5" />
                                                    Vazio
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Link dinâmico para a página de horários */}
                                            <Link
                                                href="/horarios"
                                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Visualizar
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State caso não haja turmas */}
                    {(!recentSchedules || recentSchedules.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Nenhuma turma cadastrada
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Comece criando turmas e gerando os horários.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
