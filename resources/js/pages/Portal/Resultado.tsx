import React, { useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
    ArrowLeft,
    Download,
    Image as ImageIcon,
    GraduationCap,
    BookOpen,
    MapPin,
    Clock,
    Key,
    SunMoon,
    CalendarRange,
} from 'lucide-react';

// Mapeamento dos dias da semana (ajusta se no teu backend os números forem diferentes)
const DIAS_SEMANA = [
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
];

export default function PortalResultado({ usuario, horario }: any) {
    const horarioRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Extrair e ordenar os tempos de aula (ex: 08:00 - 08:50) únicos que existem nesta turma
    const temposAula = Array.from(
        new Map(
            horario?.aulas?.map((aula: any) => [
                aula.tempo_aula?.id,
                aula.tempo_aula,
            ]),
        ).values(),
    ).sort((a: any, b: any) => a.hora_inicio?.localeCompare(b.hora_inicio));

    // Função para exportar PNG
    const handleExportPNG = async () => {
        if (!horarioRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                fontEmbedCSS: '', // A nossa correção do erro CORS!
            });
            const link = document.createElement('a');
            link.download = `Horario_${usuario.matricula}_${horario.nome}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Erro ao exportar PNG:', err);
            alert('Não foi possível exportar a imagem. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    // Função para exportar PDF
    const handleExportPDF = async () => {
        if (!horarioRef.current) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(horarioRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                fontEmbedCSS: '', // A nossa correção do erro CORS!
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
            pdf.save(`Horario_${usuario.matricula}_${horario.nome}.pdf`);
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            alert('Não foi possível exportar o PDF. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <Head title={`Horário - ${usuario.nome}`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Navegação Topo */}
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
                            className="bg-blue-600 text-white shadow-md hover:bg-blue-700"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? 'A Gerar...' : 'Baixar PDF'}
                        </Button>
                    </div>
                </div>

                {/* CONTAINER DO HORÁRIO (Isto é o que será fotografado para PDF/PNG) */}
                <div
                    ref={horarioRef}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                >
                    {/* Cabeçalho do Documento */}
                    <div className="bg-slate-900 p-8 text-white">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div>
                                <h1 className="mb-1 text-2xl font-black tracking-tight uppercase">
                                    Instituto Politécnico UKB
                                </h1>
                                <h2 className="font-medium text-blue-300">
                                    Horário Escolar Oficial
                                </h2>
                            </div>

                            <div className="w-full rounded-xl border border-slate-700 bg-slate-800/50 p-4 md:w-auto">
                                <p className="mb-1 text-sm text-slate-400">
                                    Aluno(a)
                                </p>
                                <p className="text-lg font-bold">
                                    {usuario.nome}
                                </p>
                                <div className="mt-2 flex gap-4 text-sm text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                        <Key className="h-4 w-4 text-blue-400" />{' '}
                                        Matrícula: {usuario.matricula}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <GraduationCap className="h-4 w-4 text-blue-400" />{' '}
                                        {usuario.turma?.curso?.nome || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informação da Turma */}
                    <div className="flex gap-6 border-b border-slate-100 bg-blue-50/50 p-4 px-8 text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />{' '}
                            Turma: {horario.nome}
                        </span>
                        {horario.sala && (
                            <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />{' '}
                                Sala Base: {horario.sala?.numero}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-blue-600" />{' '}
                            Periodo:{' '}
                            {horario.periodo === 1 ? 'Regular' : 'Pós-Laboral'}
                        </span>
                        <span className="flex items-center gap-2">
                            <SunMoon className="h-4 w-4 text-blue-600" /> Turno:{' '}
                            {horario.turno === 0
                                ? 'Manhã'
                                : horario.turma?.turno === 1
                                  ? 'Tarde'
                                  : 'Noite'}
                        </span>
                    </div>

                    {/* A Grelha do Horário */}
                    <div className="overflow-x-auto p-8">
                        {!horario.aulas || horario.aulas.length === 0 ? (
                            <div className="py-16 text-center text-slate-500">
                                <Clock className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-medium text-slate-900">
                                    Ainda não há aulas agendadas
                                </p>
                                <p>
                                    O horário desta turma está vazio no momento.
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
                                                className="w-48 border border-slate-200 bg-slate-50 p-4 text-center font-bold text-slate-700"
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
                                                {tempo.hora_inicio.slice(0, 5)}{' '}
                                                - {tempo.hora_fim.slice(0, 5)}
                                            </td>

                                            {DIAS_SEMANA.map((dia) => {
                                                // Procura a aula exata que cruza este dia e este tempo
                                                const aula = horario.aulas.find(
                                                    (a: any) =>
                                                        a.dia_semana ==
                                                            dia.id &&
                                                        a.tempo_aula_id ==
                                                            tempo.id,
                                                );

                                                return (
                                                    <td
                                                        key={dia.id}
                                                        className="h-24 border border-slate-200 bg-white p-2 align-top"
                                                    >
                                                        {aula ? (
                                                            <div className="flex h-full flex-col justify-center rounded-lg border border-blue-100 bg-blue-50 p-2 text-center transition-colors hover:bg-blue-100">
                                                                <p className="mb-1 text-xs font-bold text-blue-900">
                                                                    {aula
                                                                        .disciplina
                                                                        ?.nome ||
                                                                        'Disciplina N/A'}
                                                                </p>
                                                                <p className="truncate text-[11px] text-blue-700">
                                                                    Prof:{' '}
                                                                    {aula.professor?.nome?.split(
                                                                        ' ',
                                                                    )[0] ||
                                                                        'N/A'}
                                                                </p>
                                                                {aula.sala && (
                                                                    <p className="mx-auto mt-1 w-fit rounded bg-white px-1 text-[10px] font-medium text-slate-500">
                                                                        Sala{' '}
                                                                        {
                                                                            aula
                                                                                .sala
                                                                                .designacao
                                                                        }
                                                                    </p>
                                                                )}
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

                    {/* Rodapé da folha gerada */}
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
