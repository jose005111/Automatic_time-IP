import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useState, useEffect } from 'react';

// 1. IMPORTAR O LOGO INSTITUCIONAL
import logo from '@/assets/logo.png';

// 2. IMPORTAR AS IMAGENS DE FUNDO PARA O CARROSSEL (Ajusta os nomes se necessário)
import bg1 from '@/assets/background/back_1.jpeg';
import bg2 from '@/assets/background/back_2.jpeg';
import bg3 from '@/assets/background/back_3.jpeg';

const BACKGROUNDS = [bg1, bg2, bg3];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    // 3. ESTADO E LÓGICA DO CARROSSEL
    const [currentBg, setCurrentBg] = useState(0);

    // Efeito para rodar a imagem a cada 5 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000); // 5 segundos
        return () => clearInterval(timer);
    }, []);

    return (
        // 4. LAYOUT DE DUAS COLUNAS (Flex)
        <div className="flex min-h-svh bg-background">
            {/* 5. COLUNA ESQUERDA: FORMULÁRIO E LOGO */}
            <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex flex-col gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            {/* 6. LOGO INSTITUCIONAL EM VEZ DO ÍCONE */}
                            <img
                                src={logo}
                                alt="Logo UKB"
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

            {/* 7. COLUNA DIREITA: CARROSSEL DE IMAGENS (Oculto em telemóveis) */}
            <div className="relative hidden w-full shrink-0 overflow-hidden bg-slate-900 lg:block lg:w-[438px]">
                {BACKGROUNDS.map((bg, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentBg ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                            backgroundImage: `url(${bg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Película de escurecimento mix-blend para aspeto profissional */}
                        <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>

                        {/* Degradê lateral para suavizar a transição com o formulário */}
                        <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 via-transparent to-transparent"></div>
                    </div>
                ))}

                {/* Pontinhos indicadores do carrossel */}
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
        </div>
    );
}
