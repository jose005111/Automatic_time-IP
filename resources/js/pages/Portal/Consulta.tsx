import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase, Key, ArrowLeft } from 'lucide-react';

// 1. IMPORTAR O LOGO
import logo from '@/assets/logo.png';

// 2. IMPORTAR AS IMAGENS DO CARROSSEL (Garante que os nomes e pastas estão corretos)
import bg1 from '@/assets/background/back_1.jpeg';
import bg2 from '@/assets/background/back_2.jpeg';
import bg3 from '@/assets/background/back_3.jpeg';

const BACKGROUNDS = [bg1, bg2, bg3];

export default function PortalConsulta({ flash }: any) {
    const [tipo, setTipo] = useState<'aluno' | 'professor'>('aluno');
    const [codigo, setCodigo] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estado para o carrossel de imagens
    const [currentBg, setCurrentBg] = useState(0);

    // Efeito para rodar as imagens a cada 5 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % BACKGROUNDS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        router.post(
            '/portal/consultar',
            { tipo, codigo },
            {
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Head title="Consulta de Horários | UKB" />

            {/* COLUNA ESQUERDA - FORMULÁRIO */}
            <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
                {/* Botão de Voltar ao Início */}
                <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
                    <Link
                        href="/"
                        className="flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar à Página Inicial
                    </Link>
                </div>

                <div className="mx-auto w-full max-w-md text-center">
                    <img
                        src={logo}
                        alt="Logo Instituto Politécnico UKB"
                        className="mx-auto mb-6 h-20 w-auto object-contain"
                    />
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Instituto Politécnico UKB
                    </h1>
                    <h2 className="mt-2 text-xl font-medium text-slate-600">
                        Portal de Horários Escolares
                    </h2>
                </div>

                <div className="mx-auto mt-8 w-full max-w-md">
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-8 shadow-xl shadow-slate-200/50 sm:px-10">
                        {/* Seletor de Perfil */}
                        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setTipo('aluno');
                                    setCodigo(''); // Limpa o campo ao trocar
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                                    tipo === 'aluno'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <GraduationCap className="h-4 w-4" /> Sou Aluno
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTipo('professor');
                                    setCodigo(''); // Limpa o campo ao trocar
                                }}
                                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                                    tipo === 'professor'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Briefcase className="h-4 w-4" /> Sou Professor
                            </button>
                        </div>

                        {flash?.error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                                {flash.error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    {tipo === 'aluno'
                                        ? 'Número de Matrícula (Ex: AB83F9X1)'
                                        : 'Email Institucional'}
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Key className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={
                                            tipo === 'professor'
                                                ? 'email'
                                                : 'text'
                                        }
                                        required
                                        value={codigo}
                                        onChange={(e) =>
                                            setCodigo(
                                                // Se for aluno, força maiúsculas. Se for professor, deixa normal para o email.
                                                tipo === 'aluno'
                                                    ? e.target.value.toUpperCase()
                                                    : e.target.value,
                                            )
                                        }
                                        placeholder={
                                            tipo === 'aluno'
                                                ? 'Digite a sua matrícula'
                                                : 'exemplo@ukb.edu.ao'
                                        }
                                        className={`block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-3 pl-10 font-medium transition-colors focus:bg-white focus:ring-2 ${
                                            tipo === 'aluno'
                                                ? 'tracking-wider uppercase focus:border-blue-500 focus:ring-blue-500'
                                                : 'focus:border-indigo-500 focus:ring-indigo-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-6 text-base font-bold text-white shadow-lg ${
                                    tipo === 'aluno'
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isLoading
                                    ? 'A Consultar...'
                                    : 'Ver o Meu Horário'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA - CARROSSEL (Oculto em ecrãs de telemóvel) */}
            <div className="relative hidden w-full shrink-0 overflow-hidden bg-slate-900 lg:block lg:w-[45%] xl:w-[50%]">
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
                        {/* Filtros de cor para garantir um aspeto profissional e leitura fácil */}
                        <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-slate-900/40 to-slate-50"></div>
                    </div>
                ))}

                {/* Pontos de Navegação do Carrossel */}
                <div className="absolute right-0 bottom-8 left-0 z-10 flex justify-center gap-2">
                    {BACKGROUNDS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentBg
                                    ? 'w-8 bg-white'
                                    : 'w-2 bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
