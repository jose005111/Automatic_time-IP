import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
// import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Wand2,
    Eye,
    FileText,
    Image as ImageIcon,
    Clock,
    User,
    BookOpen,
} from 'lucide-react';

// 1. Nova importação do html-to-image (substitui o html2canvas)
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';

const diasSemana = [
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
];

export default function HorarioIndex({ turmas = [], flash }: any) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState<any>(null);
    const [viewOpen, setViewOpen] = useState(false);
    const horarioRef = useRef<HTMLDivElement>(null);

    // --- ACÇÕES ---
    const handleGerar = () => {
        setIsGenerating(true);
        router.post(
            '/horarios/gerar',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsGenerating(false),
            },
        );
    };

    // --- FUNÇÃO CORRIGIDA PARA EXPORTAR PDF ---
    const handleExportPDF = async () => {
        try {
            if (!horarioRef.current) {
                console.error(
                    'A referência do horário não foi encontrada na tela.',
                );
                alert('Erro: Não foi possível encontrar o horário na tela.');
                return;
            }

            console.log('A iniciar captura para PDF...');

            // 1. Captura a div como imagem usando html-to-image
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2, // Substitui o antigo "scale: 2"
                backgroundColor: '#ffffff',
                fontEmbedCSS: '', // <-- ADICIONA ESTA LINHA AQUI
            });

            console.log('Imagem gerada com sucesso. A montar o PDF...');

            // 2. Cria o documento PDF (A4 na Horizontal/Landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            // 3. Lê o tamanho da Div real para calcular a proporção exata
            const domWidth = horarioRef.current.offsetWidth;
            const domHeight = horarioRef.current.offsetHeight;

            // 4. Calcula as dimensões para caber perfeitamente na folha PDF
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (domHeight * pdfWidth) / domWidth;

            // 5. Insere a imagem gerada no PDF e faz o download
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Horario_${selectedTurma?.nome || 'Turma'}.pdf`);

            console.log('Download do PDF concluído!');
        } catch (error) {
            console.error('Erro ao gerar o PDF:', error);
            alert(
                'Ocorreu um erro ao exportar o PDF. Pressiona F12 e vê a aba Console.',
            );
        }
    };

    // --- FUNÇÃO CORRIGIDA PARA EXPORTAR PNG ---
    const handleExportPNG = async () => {
        try {
            if (!horarioRef.current) {
                console.error(
                    'A referência do horário não foi encontrada na tela.',
                );
                return;
            }

            console.log('A iniciar captura para PNG...');

            // Usa o html-to-image para gerar o PNG
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                fontEmbedCSS: '', // <-- ADICIONA ESTA LINHA AQUI
            });

            // Cria o link e inicia o download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Horario_${selectedTurma?.nome || 'Turma'}.png`;
            link.click();

            console.log('Download do PNG concluído!');
        } catch (error) {
            console.error('Erro ao gerar o PNG:', error);
            alert(
                'Ocorreu um erro ao exportar a Imagem. Pressiona F12 e vê a aba Console.',
            );
        }
    };

    const openHorario = (turma: any) => {
        setSelectedTurma(turma);
        setViewOpen(true);
    };

    // --- HELPER PARA A GRELHA ---
    const getAula = (dia: number, tempoId: number) => {
        if (!selectedTurma?.aulas) return null;
        return selectedTurma.aulas.find(
            (a: any) => a.dia_semana === dia && a.tempo_aula_id === tempoId,
        );
    };

    const getTemposDaTurma = () => {
        if (!selectedTurma?.aulas) return [];
        const temposMap = new Map();
        selectedTurma.aulas.forEach((a: any) => {
            if (a.tempo_aula && !temposMap.has(a.tempo_aula_id)) {
                temposMap.set(a.tempo_aula_id, a.tempo_aula);
            }
        });
        return Array.from(temposMap.values()).sort((a: any, b: any) =>
            a.hora_inicio.localeCompare(b.hora_inicio),
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Horários', href: '/horarios' }]}>
            <Head title="Gestão de Horários" />

            <div className="flex flex-col gap-6 rounded-xl border bg-background p-6 shadow-sm">
                <div className="flex flex-col items-center justify-between gap-4 border-b pb-4 md:flex-row">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Horários Escolares
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Gere e visualize os horários de todas as turmas.
                        </p>
                    </div>
                    <Button
                        onClick={handleGerar}
                        disabled={isGenerating}
                        className="bg-primary text-white shadow-lg transition-all hover:bg-primary/90"
                    >
                        <Wand2
                            className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
                        />
                        {isGenerating
                            ? 'A Gerar Horários...'
                            : 'Gerar Automaticamente'}
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 font-medium text-emerald-600">
                        {flash.success}
                    </div>
                )}
                {flash?.warning && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 font-medium text-amber-600">
                        {flash.warning}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {turmas.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-muted-foreground">
                            Nenhuma turma configurada ou horários não gerados.
                        </div>
                    ) : (
                        turmas.map((turma: any) => (
                            <div
                                key={turma.id}
                                className="flex h-full flex-col justify-between rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
                            >
                                <div>
                                    <h3 className="mb-1 text-xl font-bold text-primary">
                                        {turma.nome}
                                    </h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        {turma.curso?.nome} • {turma.ano}º Ano •
                                        Turno:{' '}
                                        {turma.turno === 0
                                            ? 'Manhã'
                                            : turma.turno === 1
                                              ? 'Tarde'
                                              : 'Noite'}
                                    </p>
                                    <div className="mb-6 flex w-fit items-center gap-2 rounded-full bg-muted/30 px-3 py-1 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-cyan-600" />
                                        {turma.aulas?.length || 0} Aulas
                                        Agendadas
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="flex w-full items-center justify-center gap-2 border-primary/20 transition-colors hover:bg-primary hover:text-white"
                                    onClick={() => openHorario(turma)}
                                >
                                    <Eye className="h-4 w-4" /> Ver Horário
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="bottom"
                    className="flex h-[95vh] flex-col rounded-t-2xl bg-slate-50 p-0"
                >
                    <div className="z-10 flex items-center justify-between border-b bg-white px-8 py-5 shadow-sm">
                        <div>
                            <SheetTitle className="text-2xl font-bold text-primary">
                                Horário: {selectedTurma?.nome}
                            </SheetTitle>
                            <p className="text-sm text-muted-foreground">
                                {selectedTurma?.curso?.nome} | Sala{' '}
                                {selectedTurma?.sala?.numero}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                onClick={handleExportPDF}
                            >
                                <FileText className="mr-2 h-4 w-4" /> Exportar
                                PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                onClick={handleExportPNG}
                            >
                                <ImageIcon className="mr-2 h-4 w-4" /> Exportar
                                PNG
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-8">
                        <div
                            ref={horarioRef}
                            className="mx-auto max-w-7xl rounded-xl border bg-white p-8 shadow-sm"
                        >
                            <div className="mb-8 border-b-2 border-slate-200 pb-6 text-center">
                                <h1 className="text-2xl font-black tracking-wider text-slate-800 uppercase">
                                    Instituto Politécnico UKB
                                </h1>
                                <h2 className="mt-1 text-lg font-semibold text-slate-600">
                                    Horário Letivo - {selectedTurma?.nome}
                                </h2>
                                <p className="mt-2 flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
                                    <span>
                                        Turno:{' '}
                                        {selectedTurma?.turno === 0
                                            ? 'Manhã'
                                            : selectedTurma?.turno === 1
                                              ? 'Tarde'
                                              : 'Noite'}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Sala: {selectedTurma?.sala?.numero}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        Curso: {selectedTurma?.curso?.nome}
                                    </span>
                                </p>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="w-32 border-r border-b p-4 text-center font-bold">
                                                <Clock className="mx-auto h-5 w-5 text-slate-400" />
                                            </th>
                                            {diasSemana.map((dia) => (
                                                <th
                                                    key={dia.id}
                                                    className="w-[18%] border-r border-b p-4 text-center font-bold"
                                                >
                                                    {dia.nome}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getTemposDaTurma().length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="p-10 text-center text-slate-400 italic"
                                                >
                                                    O horário ainda não foi
                                                    gerado ou está vazio.
                                                </td>
                                            </tr>
                                        ) : (
                                            getTemposDaTurma().map(
                                                (tempo: any) => (
                                                    <tr
                                                        key={tempo.id}
                                                        className="border-b transition-colors last:border-0 hover:bg-slate-50/50"
                                                    >
                                                        <td className="border-r border-slate-200 bg-slate-50/50 p-3 text-center align-middle">
                                                            <div className="font-bold text-slate-700">
                                                                {tempo.hora_inicio.substring(
                                                                    0,
                                                                    5,
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-xs text-slate-500">
                                                                {tempo.hora_fim.substring(
                                                                    0,
                                                                    5,
                                                                )}
                                                            </div>
                                                        </td>

                                                        {diasSemana.map(
                                                            (dia) => {
                                                                const aula =
                                                                    getAula(
                                                                        dia.id,
                                                                        tempo.id,
                                                                    );
                                                                return (
                                                                    <td
                                                                        key={`${dia.id}-${tempo.id}`}
                                                                        className="group relative border-r border-slate-200 p-3 align-top"
                                                                    >
                                                                        {aula ? (
                                                                            <div className="h-full rounded-lg border border-cyan-100 bg-cyan-50 p-3 shadow-sm transition-shadow hover:shadow-md">
                                                                                <div className="mb-2 leading-tight font-bold text-cyan-900">
                                                                                    {aula
                                                                                        .demanda
                                                                                        ?.disciplina
                                                                                        ?.nome ||
                                                                                        aula
                                                                                            ?.disciplina
                                                                                            ?.nome}
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5 text-xs font-medium text-cyan-700">
                                                                                    <User className="h-3.5 w-3.5" />
                                                                                    {
                                                                                        aula
                                                                                            .professor
                                                                                            ?.nome
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex h-full min-h-[80px] w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/30 text-slate-300">
                                                                                —
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            },
                                                        )}
                                                    </tr>
                                                ),
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
