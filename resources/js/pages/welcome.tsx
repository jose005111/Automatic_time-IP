import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Users, FileText, Award, Search, MapPin } from 'lucide-react';

// IMPORTAR O TEU LOGO (ajusta o caminho conforme a tua estrutura)
import logo from '@/assets/logo.png';

// IMPORTAR AS IMAGENS DE FUNDO (coloca as tuas imagens reais em resources/js/assets/background/)
// Exemplo: back_1.jpeg, back_2.jpeg, back_3.jpeg (podes usar fotos de Benguela, cartões de munícipe, etc.)
import bg1 from '@/assets/background/back_1.png';
const BACKGROUNDS = [bg1];

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    const [currentBg, setCurrentBg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <Head title="SIGID | Sistema de Gestão de Informação - DMRMAB Benguela" />

            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                {/* Cabeçalho / Navegação */}
                <header className="lg:max-w-8xl mb-6 w-full text-sm not-has-[nav]:hidden">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center gap-3 font-semibold text-primary">
                            <img
                                src={logo}
                                alt="Logo DMRMAB"
                                className="h-12 w-auto object-contain"
                            />
                            <span className="hidden text-lg tracking-tight uppercase sm:block dark:text-white">
                                DMRMAB Benguela
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {auth?.user ? (
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
                                        className="inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                        Entrar
                                    </Link>
                                    {/* {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                                        >
                                            Cadastrar
                                        </Link>
                                    )} */}
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-700 lg:grow starting:opacity-0">
                    <main className="lg:max-w-8xl flex w-full flex-col-reverse overflow-hidden rounded-2xl border shadow-2xl lg:flex-row dark:border-gray-800">
                        {/* Lado Esquerdo - Informações do SIGID */}
                        <div className="flex flex-1 flex-col justify-center bg-white p-6 pb-12 lg:p-16 dark:bg-[#161615] dark:text-[#EDEDEC]">
                            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                SISTEMA INFORMÁTICO DE GESTÃO DE MUNÍCIPES
                            </div>

                            <h1 className="mb-4 text-3xl leading-tight font-black tracking-tight text-slate-900 uppercase sm:text-4xl dark:text-white">
                                Gestão inteligente de munícipes em Benguela.
                            </h1>

                            <p className="mb-8 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                                Recrutamento militar, transferências e controlo
                                de informações com total segurança e eficiência.
                                Modernização administrativa da DMRMAB.
                            </p>

                            <div className="mb-10 flex items-center gap-4 border-b border-slate-100 pb-8 dark:border-slate-800">
                                <Link
                                    href={auth?.user ? dashboard() : login()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-600 hover:shadow-lg sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-blue-500 dark:hover:text-white"
                                >
                                    <Users className="h-4 w-4" />
                                    Acessar o Sistema
                                </Link>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Cadastro Unificado de Munícipes
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Dados biográficos, complementares,
                                            endereços e progenitores em um só
                                            lugar.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Recrutamento Militar Digital
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Gestão completa de recenseamento e
                                            transferências com aprovação em
                                            tempo real.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            Localização e Infraestrutura
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Províncias, municípios e endereços
                                            integrados com o sistema.
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Lado Direito - Carrossel de Imagens */}
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
                                    {/* Overlay profissional azul escuro */}
                                    <div className="absolute inset-0 bg-blue-950/40 mix-blend-multiply"></div>

                                    {/* Degradê inferior */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
                                </div>
                            ))}

                            {/* Indicadores do Carrossel */}
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

                            {/* Badge flutuante */}
                            <div className="absolute top-6 left-6 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-900 shadow">
                                DMRMAB • Benguela
                            </div>
                        </div>
                    </main>
                </div>

                <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    &copy; {new Date().getFullYear()} SIGID — Direcção Municipal
                    dos Registos e Modernização Administrativa de Benguela
                    <br />
                    Desenvolvido com Laravel 12, React + TypeScript & Inertia.js
                </div>
            </div>
        </>
    );
}
