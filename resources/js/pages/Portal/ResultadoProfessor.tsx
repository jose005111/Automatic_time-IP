import React, { useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
    ArrowLeft,
    Download,
    Image as ImageIcon,
    Briefcase,
    BookOpen,
    MapPin,
    Clock,
    UserCircle,
} from 'lucide-react';

const DIAS_SEMANA = [
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
];

export default function PortalResultadoProfessor({ usuario, aulas }: any) {
    const horarioRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Extrair os tempos de aula únicos para desenhar as linhas da tabela
    const temposAula = Array.from(
        new Map(
            (aulas || []).map((aula: any) => {
                const tempo = aula.tempo_aula || aula.tempoAula;
                return [tempo?.id, tempo];
            }),
        ).values(),
    )
        .filter(Boolean)
        .sort((a: any, b: any) => a.hora_inicio?.localeCompare(b.hora_inicio));

    const handleExportPNG = async () => {
        if (!horarioRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                fontEmbedCSS: '',
            });
            const link = document.createElement('a');
            link.download = `Horario_Prof_${usuario.nome.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Erro ao exportar PNG:', err);
            alert('Não foi possível exportar a imagem.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPDF = async () => {
        if (!horarioRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                fontEmbedCSS: '',
            });

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [
                    horarioRef.current.offsetWidth,
                    horarioRef.current.offsetHeight,
                ],
            });

            pdf.addImage(
                dataUrl,
                'PNG',
                0,
                0,
                horarioRef.current.offsetWidth,
                horarioRef.current.offsetHeight,
            );
            pdf.save(`Horario_Prof_${usuario.nome.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            alert('Não foi possível exportar o PDF.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <Head title={`Horário - Prof. ${usuario.nome}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Link
                        href="/portal"
                        className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar à Pesquisa
                    </Link>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleExportPNG}
                            disabled={isExporting}
                            className="bg-white"
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Baixar Imagem
                        </Button>
                        <Button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? 'A Gerar...' : 'Baixar PDF'}
                        </Button>
                    </div>
                </div>

                <div
                    ref={horarioRef}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                >
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <h1 className="mb-1 text-2xl font-black tracking-tight uppercase">
                                    Instituto Politécnico UKB
                                </h1>
                                <h2 className="font-medium text-indigo-300">
                                    Horário Escolar do Professor
                                </h2>
                            </div>

                            <div className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 md:w-auto">
                                <p className="mb-1 text-sm text-slate-400">
                                    Professor(a)
                                </p>
                                <p className="flex items-center gap-2 text-lg font-bold">
                                    <UserCircle className="h-5 w-5 text-indigo-400" />
                                    {usuario.nome}
                                </p>
                                <div className="mt-2 flex gap-4 text-sm text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4 text-indigo-400" />
                                        E-mail: {usuario.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 border-b border-slate-100 bg-indigo-50/50 p-4 px-8 text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-indigo-600" />
                            Total de Tempos Letivos Atribuídos:{' '}
                            {aulas?.length || 0}
                        </span>
                    </div>

                    <div className="overflow-x-auto p-8">
                        {!aulas || aulas.length === 0 ? (
                            <div className="py-16 text-center text-slate-500">
                                <Clock className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-900">
                                    Sem carga horária atribuída
                                </p>
                                <p>
                                    Não existem aulas agendadas para este
                                    professor no sistema.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="w-32 border border-slate-200 bg-slate-50 p-4 text-center font-bold text-slate-700">
                                            Horário
                                        </th>
                                        {DIAS_SEMANA.map((dia) => (
                                            <th
                                                key={dia.id}
                                                className="w-56 border border-slate-200 bg-slate-50 p-4 text-center font-bold text-slate-700"
                                            >
                                                {dia.nome}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {temposAula.map((tempo: any) => (
                                        <tr key={tempo.id}>
                                            <td className="border border-slate-200 bg-slate-50 p-3 text-center font-semibold text-slate-700">
                                                {tempo.hora_inicio?.slice(0, 5)}{' '}
                                                - {tempo.hora_fim?.slice(0, 5)}
                                            </td>

                                            {DIAS_SEMANA.map((dia) => {
                                                const aula = aulas.find(
                                                    (a: any) =>
                                                        a.dia_semana ==
                                                            dia.id &&
                                                        (a.tempo_aula_id ==
                                                            tempo.id ||
                                                            a.tempo_aula?.id ==
                                                                tempo.id),
                                                );

                                                return (
                                                    <td
                                                        key={dia.id}
                                                        className="h-32 border border-slate-200 bg-white p-2 align-top"
                                                    >
                                                        {aula ? (
                                                            <div className="flex h-full flex-col justify-between rounded-lg border border-indigo-200 bg-indigo-50/80 p-2 text-center transition-colors hover:bg-indigo-100">
                                                                {/* CABEÇALHO DO CARD: Disciplina (Destaque principal) */}
                                                                <div className="mb-1 border-b border-indigo-100 pb-1">
                                                                    <p className="text-xs leading-tight font-extrabold text-indigo-900 uppercase">
                                                                        {aula
                                                                            .disciplina
                                                                            ?.nome ||
                                                                            'Disciplina N/A'}
                                                                    </p>
                                                                </div>

                                                                {/* CORPO DO CARD: Turma, Ano e Curso */}
                                                                <div className="flex flex-col gap-0.5 text-[10px] leading-tight text-indigo-800">
                                                                    <p className="font-semibold">
                                                                        Turma:{' '}
                                                                        {aula
                                                                            .turma
                                                                            ?.periodo ===
                                                                        1
                                                                            ? 'Regular'
                                                                            : 'Pós-Laboral'}{' '}
                                                                        -{' '}
                                                                        {aula
                                                                            .turma
                                                                            ?.ano ===
                                                                        1
                                                                            ? '1º Ano'
                                                                            : aula
                                                                                    .turma
                                                                                    ?.ano ===
                                                                                2
                                                                              ? '2º Ano'
                                                                              : aula
                                                                                      .turma
                                                                                      ?.ano ===
                                                                                  3
                                                                                ? '3º Ano'
                                                                                : aula
                                                                                        .turma
                                                                                        ?.ano ===
                                                                                    4
                                                                                  ? '4º Ano'
                                                                                  : '5º Ano'}
                                                                    </p>
                                                                    <p className="truncate text-indigo-600">
                                                                        {aula
                                                                            .turma
                                                                            ?.curso
                                                                            ?.nome ||
                                                                            'Curso N/A'}
                                                                    </p>
                                                                </div>

                                                                {/* RODAPÉ DO CARD: Sala e Turno (Lado a Lado) */}
                                                                <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                                                                    <span className="flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-600 shadow-sm">
                                                                        <MapPin className="h-2.5 w-2.5 text-indigo-500" />
                                                                        Sala{' '}
                                                                        {
                                                                            aula
                                                                                .turma
                                                                                ?.sala
                                                                                ?.numero
                                                                        }
                                                                    </span>
                                                                   
                                                                        <span className="flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-600 shadow-sm">
                                                                            <Clock className="h-2.5 w-2.5 text-orange-500" />
                                                                            {aula
                                                                                .turma
                                                                                ?.turno ===
                                                                            0
                                                                                ? 'Manhã'
                                                                                : aula
                                                                                        .turma
                                                                                        ?.turno ===
                                                                                    1
                                                                                  ? 'Tarde'
                                                                                  : 'Noite'}
                                                                        </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-50/50 text-xs text-slate-300">
                                                                -
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-400">
                        Gerado automaticamente pelo Portal do Instituto
                        Politécnico UKB •{' '}
                        {new Date().toLocaleDateString('pt-PT')}
                    </div>
                </div>
            </div>
        </div>
    );
}
