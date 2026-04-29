import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Clock, Users, BookOpen, Search } from 'lucide-react';

// 1. IMPORTAR O TEU LOGO
import logo from '@/assets/logo.png';

// 2. IMPORTAR AS IMAGENS DE FUNDO (Ajusta os nomes para os ficheiros reais que tens!)
import bg1 from '@/assets/background/back_1.jpeg'; // Exemplo: se for .png, muda para .png
import bg2 from '@/assets/background/back_2.jpeg';
import bg3 from '@/assets/background/back_3.jpeg';

// Guardamos as imagens num array para o carrossel conseguir rodar
const BACKGROUNDS = [bg1, bg2, bg3];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    // Estado para controlar qual imagem está a ser mostrada agora
    const [currentBg, setCurrentBg] = useState(0);

    // Efeito para mudar a imagem automaticamente a cada 5 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000); // 5000ms = 5 segundos
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="Bem-vindo | Instituto Politécnico UKB" />

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                {/* Cabeçalho / Navegação */}
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-between">
                        {/* NOVO LOGO AQUI */}
                        <div className="flex items-center gap-3 font-semibold text-primary">
                            <img
                                src={logo}
                                alt="Logo UKB"
                                className="h-12 w-auto object-contain"
                            />
                            <span className="hidden text-lg tracking-tight uppercase sm:block dark:text-white">
                                Instituto Politécnico UKB
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/portal"
                                className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                                <Search className="h-4 w-4" />
                                Consultar Horário
                            </Link>

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
                                    {/* O botão desaparece se o canRegister for false */}
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
                    <main className="flex w-full max-w-[335px] flex-col-reverse overflow-hidden rounded-2xl border shadow-2xl lg:max-w-4xl lg:flex-row dark:border-gray-800">
                        {/* Lado Esquerdo - Informações */}
                        <div className="flex flex-1 flex-col justify-center bg-white p-6 pb-12 lg:p-16 dark:bg-[#161615] dark:text-[#EDEDEC]">
                            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                SISTEMA DE GESTÃO DE HORÁRIOS
                            </div>

                            <h1 className="mb-4 text-3xl leading-tight font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
                                Horários escolares sem dor de cabeça.
                            </h1>
                            <p className="mb-8 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                                Otimização inteligente para professores e
                                alunos. Evite choques de disciplinas e ganhe
                                dezenas de horas de trabalho manual.
                            </p>

                            <div className="mb-10 flex items-center gap-4 border-b border-slate-100 pb-8 dark:border-slate-800">
                                <Link
                                    href="/portal"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 dark:hover:text-white"
                                >
                                    <Search className="h-4 w-4" />
                                    Acessar o Portal Público
                                </Link>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Algoritmo Inteligente
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Geração sem conflitos de turmas.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Gestão Centralizada
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Controlo sobre professores e
                                            infraestrutura.
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Fácil Exportação
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Exporte para PDF ou partilhe online.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Lado Direito - O NOVO CARROSSEL DE IMAGENS */}
                        <div className="relative flex aspect-[335/376] w-full shrink-0 overflow-hidden bg-slate-900 lg:aspect-auto lg:w-[438px]">
                            {BACKGROUNDS.map((bg, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                        index === currentBg
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                    }`}
                                    style={{
                                        backgroundImage: `url(${bg})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    {/* Película de escurecimento azulada para dar um aspeto mais "escola/profissional" */}
                                    <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>

                                    {/* Degradê na parte inferior para suavizar o corte da imagem */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                </div>
                            ))}

                            {/* Pontinhos indicadores do Carrossel */}
                            <div className="absolute right-0 bottom-6 left-0 z-10 flex justify-center gap-2">
                                {BACKGROUNDS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentBg
                                                ? 'w-6 bg-white'
                                                : 'w-2 bg-white/50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
                <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    &copy; {new Date().getFullYear()} Desenvolvido com Laravel,
                    React & Inertia.js
                </div>
            </div>
        </>
    );
}
