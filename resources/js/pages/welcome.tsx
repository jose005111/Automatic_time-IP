import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { CalendarDays, Clock, Users, BookOpen } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bem-vindo | Gerador de Horários" />

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                {/* Cabeçalho / Navegação */}
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                            <CalendarDays className="h-6 w-6 text-blue-600" />
                            <span className="text-lg tracking-tight dark:text-white">
                                SISTEMA GENÉRICO PARA CRIAÇÃO AUTOMÁTICA DE
                                HORÁRIOS ESCOLARES
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-md border border-[#19140035] bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:border-transparent"
                                >
                                    Acessar Painel
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-md px-5 py-2 text-sm font-medium text-[#1b1b18] transition hover:bg-gray-100 dark:text-[#EDEDEC] dark:hover:bg-gray-800"
                                    >
                                        Entrar
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                        >
                                            Cadastrar
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-700 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse overflow-hidden rounded-lg border shadow-lg lg:max-w-4xl lg:flex-row dark:border-gray-800">
                        {/* Lado Esquerdo - Informações */}
                        <div className="flex flex-1 flex-col justify-center bg-white p-6 pb-12 lg:p-16 dark:bg-[#161615] dark:text-[#EDEDEC]">
                            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                                </span>
                                HORÁRIOS ESCOLARES
                            </div>

                            <h1 className="mb-4 text-3xl leading-tight font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Horários escolares sem dor de cabeça.
                            </h1>
                            <p className="mb-8 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                                Gere horários otimizados automaticamente. Evite
                                choques de disciplinas, respeite a
                                disponibilidade dos professores e poupe dezenas
                                de horas de trabalho manual.
                            </p>

                            <ul className="mb-8 space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Algoritmo Inteligente
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Geração automática sem conflitos de
                                            turmas ou professores.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Gestão Centralizada
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Controle total sobre professores,
                                            disciplinas e infraestrutura.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Fácil Exportação
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Imprima, exporte para PDF ou
                                            compartilhe horários online.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Lado Direito - Ilustração Mockup do Horário */}
                        <div className="relative flex aspect-[335/376] w-full shrink-0 items-center justify-center overflow-hidden border-b border-gray-100 bg-slate-50 lg:aspect-auto lg:w-[438px] lg:border-b-0 lg:border-l dark:border-gray-800 dark:bg-[#0f0f0e]">
                            {/* Efeito de background */}
                            <div
                                className="bg-grid-slate-200 dark:bg-grid-slate-800/20 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"
                                style={{
                                    backgroundSize: '30px 30px',
                                    backgroundImage:
                                        'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
                                }}
                            />

                            {/* Grade do Mockup */}
                            <div className="relative z-10 w-full max-w-[320px] rotate-2 rounded-xl border border-gray-200 bg-white p-4 shadow-xl transition-transform duration-500 hover:rotate-0 dark:border-gray-700 dark:bg-gray-800">
                                <div className="mb-4 flex items-center justify-between border-b pb-3 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                        1º Ano - Computação
                                    </h4>
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                        Horário Oficial
                                    </span>
                                </div>

                                <div className="mb-2 grid grid-cols-5 gap-2 text-center text-xs font-medium text-gray-500">
                                    <div>Seg</div>
                                    <div>Ter</div>
                                    <div>Qua</div>
                                    <div>Qui</div>
                                    <div>Sex</div>
                                </div>

                                <div className="grid grid-cols-5 gap-2">
                                    {/* Linha 1 */}
                                    <div className="flex h-12 items-center justify-center rounded border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                                        PROG I
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-green-200 bg-green-100 text-[10px] font-bold text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-400">
                                        ING
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-yellow-200 bg-yellow-100 text-[10px] font-bold text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                                        ALG LIN
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-purple-200 bg-purple-100 text-[10px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-400">
                                        INF
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                                        PROG I
                                    </div>

                                    {/* Linha 2 */}
                                    <div className="flex h-12 items-center justify-center rounded border border-purple-200 bg-purple-100 text-[10px] font-bold text-purple-700 dark:border-purple-800 dark:bg-purple-900/40 dark:text-purple-400">
                                        INF
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-orange-200 bg-orange-100 text-[10px] font-bold text-orange-700 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
                                        PROG I
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-red-200 bg-red-100 text-[10px] font-bold text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-400">
                                        INF
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-green-200 bg-green-100 text-[10px] font-bold text-green-700 dark:border-green-800 dark:bg-green-900/40 dark:text-green-400">
                                        ING
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-yellow-200 bg-yellow-100 text-[10px] font-bold text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                                        ALG LIN
                                    </div>

                                    {/* Intervalo */}
                                    <div className="col-span-5 flex h-6 items-center justify-center rounded border border-gray-200 bg-gray-100 text-[10px] font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        INTERVALO
                                    </div>

                                    {/* Linha 3 */}
                                    <div className="flex h-12 items-center justify-center rounded border border-cyan-200 bg-cyan-100 text-[10px] font-bold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-400">
                                        LAB
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-cyan-200 bg-cyan-100 text-[10px] font-bold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-400">
                                        LAB
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-pink-200 bg-pink-100 text-[10px] font-bold text-pink-700 dark:border-pink-800 dark:bg-pink-900/40 dark:text-pink-400">
                                        ING
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                                        PROG I
                                    </div>
                                    <div className="flex h-12 items-center justify-center rounded border border-orange-200 bg-orange-100 text-[10px] font-bold text-orange-700 dark:border-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
                                        PROG I
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Desenvolvido com Laravel,
                    React & Inertia.js
                </div>
            </div>
        </>
    );
}
