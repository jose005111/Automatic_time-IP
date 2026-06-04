import { Link } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useState, useEffect } from 'react';

// 1. IMPORTAR O LOGO INSTITUCIONAL
import logo from '@/assets/logo.png';


export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {

    return (
        // 4. LAYOUT DE DUAS COLUNAS (Flex)
        <div className="flex min-h-svh bg-background">
            {/* 5. COLUNA ESQUERDA: FORMULÁRIO E LOGO */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex flex-col gap-4">
                        <Link
                            href={dashboard()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            {/* 6. LOGO INSTITUCIONAL EM VEZ DO ÍCONE */}
                            <img
                                src={logo}
                                alt="SIGID"
                                className="mb-4 h-16 w-auto object-contain"
                            />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Aqui é onde o formulário (Login/Registo) será renderizado */}
                    {children}
                </div>
            </div>
        </div>
    );
}
