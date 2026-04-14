import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Edit,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    UserCircle,
    Mail,
    GraduationCap,
    CalendarClock,
    Eye,
} from 'lucide-react';
import { AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Professores', href: '/professores' },
];

const DIAS = [
    { id: 1, nome: 'Seg' },
    { id: 2, nome: 'Ter' },
    { id: 3, nome: 'Qua' },
    { id: 4, nome: 'Qui' },
    { id: 5, nome: 'Sex' },
];

// Helper para formatar hora "07:30:00" -> "07:30"
const formatTime = (timeString: string) => {
    return timeString ? timeString.substring(0, 5) : '';
};

export default function ProfessorIndex({
    professores = [],
    disciplinas = [],
    tempos_aulas = [], // NOVO: Dados dinâmicos do Controller
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        email: '',
        disciplina_ids: [] as string[],
        disponibilidade: [] as string[],
    });

    // ==========================================
    // AGRUPAMENTO DINÂMICO DE TEMPOS POR TURNO
    // ==========================================
    const turnosDinamicos = useMemo(() => {
        const turnosIds = [0, 1, 2]; // 0: Manhã, 1: Tarde, 2: Noite
        const nomesTurnos = ['Manhã', 'Tarde', 'Noite'];

        return turnosIds
            .map((turnoId) => {
                // Filtra os tempos que pertencem a este turno
                const temposDoTurno = tempos_aulas
                    .filter((t: any) => parseInt(t.turno) === turnoId)
                    .map((t: any, index: number) => ({
                        id: t.id,
                        nome: `${index + 1}º T`, // Gera "1º T", "2º T" dinamicamente baseado na ordem
                        descricao: `${formatTime(t.hora_inicio)} - ${formatTime(t.hora_fim)}`,
                    }));

                return {
                    id: turnoId,
                    nome: nomesTurnos[turnoId],
                    tempos: temposDoTurno,
                };
            })
            .filter((turno) => turno.tempos.length > 0); // Só mantém turnos que tenham tempos registados
    }, [tempos_aulas]);

    // ==========================================

    function handleSearch() {
        router.get(
            '/professores',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/professores', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        put(`/professores/${selectedProfessor?.id}`, {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    }

    const toggleDisponibilidade = (diaId: number, tempoId: number) => {
        const key = `${diaId}-${tempoId}`;
        const current = [...data.disponibilidade];
        if (current.includes(key)) {
            setData(
                'disponibilidade',
                current.filter((k) => k !== key),
            );
        } else {
            setData('disponibilidade', [...current, key]);
        }
    };

    const toggleTurnoDia = (diaId: number, tempos: any[]) => {
        const current = [...data.disponibilidade];
        const keys = tempos.map((t) => `${diaId}-${t.id}`);
        const allSelected =
            keys.length > 0 && keys.every((k) => current.includes(k));

        let nextDisponibilidade = [...current];

        if (allSelected) {
            nextDisponibilidade = nextDisponibilidade.filter(
                (k) => !keys.includes(k),
            );
        } else {
            keys.forEach((k) => {
                if (!nextDisponibilidade.includes(k))
                    nextDisponibilidade.push(k);
            });
        }
        setData('disponibilidade', nextDisponibilidade);
    };

    const preencherParaEdicao = (prof: any) => {
        setSelectedProfessor(prof);
        const dispFormatada =
            prof.disponibilidades?.map(
                (d: any) => `${d.dia_semana}-${d.tempo_aula_id}`,
            ) || [];

        setData({
            nome: prof.nome,
            email: prof.email,
            disciplina_ids:
                prof.disciplinas?.map((d: any) => d.id.toString()) || [],
            disponibilidade: dispFormatada,
        });
        setEditOpen(true);
    };

    const showProfessor = (prof: any) => {
        setSelectedProfessor(prof);
        const dispFormatada =
            prof.disponibilidades?.map(
                (d: any) => `${d.dia_semana}-${d.tempo_aula_id}`,
            ) || [];

        setData({
            nome: prof.nome,
            email: prof.email,
            disciplina_ids:
                prof.disciplinas?.map((d: any) => d.id.toString()) || [],
            disponibilidade: dispFormatada,
        });

        setViewOpen(true);
    };

    const submitAssign = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/professores/${selectedProfessor?.id}/disciplinas`, {
            onSuccess: () => {
                setAssignOpen(false);
                reset();
            },
        });
    };
    // // Função para abrir o modal de atribuição já com as disciplinas atuais marcadas
    // const handleAssignClick = (prof: any) => {
    //     setSelectedProfessor(prof);
    //     setData(
    //         'disciplina_ids',
    //         prof.disciplinas?.map((d: any) => d.id.toString()) || [],
    //     );
    //     setAssignOpen(true);
    // };

    const abrirAtribuicao = (prof: any) => {
        setSelectedProfessor(prof);

        // Mapeamos os IDs das disciplinas atuais para strings (formato esperado pelo checkbox)
        const idsAtuais =
            prof.disciplinas_que_ensina?.map((d: any) => d.id.toString()) || [];

        setData({
            ...data, // Mantém outros dados se necessário
            disciplina_ids: idsAtuais,
        });

        setAssignOpen(true);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Professores" />
            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                {/* Header ... */}
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        Professor
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                        />
                        <Button variant="outline" onClick={handleSearch}>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border text-foreground">
                    {/* Tabela de Professores ... (idêntica) */}
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b text-left">
                                <th className="p-3 font-medium">Professor</th>
                                <th className="p-3 font-medium">Email</th>
                                <th className="p-3 text-center font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {professores.data.map(
                                (prof: any, index: number) => (
                                    <motion.tr
                                        key={prof.id}
                                        className="border-b hover:bg-muted/30"
                                    >
                                        <td className="p-3 font-medium">
                                            {prof.nome}
                                        </td>
                                        <td className="p-3 text-muted-foreground italic">
                                            {prof.email}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center space-x-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        showProfessor(prof);
                                                    }}
                                                    title="Ver Detalhes"
                                                    className="border-none bg-cyan-500 hover:bg-cyan-600"
                                                >
                                                    <Eye className="h-4 w-4 text-background" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title="Atribuir Disciplinas"
                                                    onClick={() =>
                                                        abrirAtribuicao(prof)
                                                    }
                                                    className="border-none bg-green-500 hover:bg-green-600"
                                                >
                                                    <GraduationCap className="h-4 w-4 text-background" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        preencherParaEdicao(
                                                            prof,
                                                        )
                                                    }
                                                    className="border-none bg-yellow-500 hover:bg-yellow-600"
                                                >
                                                    <Edit className="h-4 w-4 text-background" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setSelectedProfessor(
                                                            prof,
                                                        );
                                                        setDeleteOpen(true);
                                                    }}
                                                    className="border-none bg-rose-500 hover:bg-rose-600"
                                                >
                                                    <Trash2Icon className="h-4 w-4 text-background" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Sheet
                open={open || editOpen}
                onOpenChange={(val) => {
                    setOpen(val);
                    setEditOpen(val);
                }}
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col p-0 sm:max-w-2xl"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            {editOpen
                                ? 'Actualizar Professor'
                                : 'Novo Professor'}
                        </SheetTitle>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="professor-form"
                            onSubmit={editOpen ? update : submit}
                            className="space-y-6"
                        >
                            <div className="space-y-4 rounded-lg border bg-card p-4">
                                <h3 className="flex items-center gap-2 font-semibold">
                                    <UserCircle className="h-5 w-5" /> Dados
                                    Base
                                </h3>
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Nome Completo</Label>
                                    <Input
                                        id="nome"
                                        value={data.nome}
                                        onChange={(e) =>
                                            setData('nome', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border bg-card p-4">
                                <div className="mb-4 flex flex-col">
                                    <h3 className="flex items-center gap-2 font-semibold">
                                        <CalendarClock className="h-5 w-5" />{' '}
                                        Disponibilidade de Horário
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Os horários abaixo são carregados
                                        dinamicamente do banco de dados.
                                    </p>
                                </div>

                                {turnosDinamicos.length === 0 ? (
                                    <div className="rounded border p-4 text-center text-sm text-destructive">
                                        Atenção: Não há tempos de aula
                                        cadastrados no sistema. Vá ao menu
                                        "Tempos de Aula" e crie-os.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-6 gap-2 text-center text-sm font-medium">
                                        <div className="border-b pt-2 pb-2 text-muted-foreground">
                                            Tempos
                                        </div>
                                        {DIAS.map((dia) => (
                                            <div
                                                key={dia.id}
                                                className="border-b pt-2 pb-2"
                                            >
                                                {dia.nome}
                                            </div>
                                        ))}

                                        {/* AQUI RENDERIZAMOS OS TURNOS GERADOS DINAMICAMENTE */}
                                        {turnosDinamicos.map((turno) => (
                                            <React.Fragment
                                                key={`turno-${turno.id}`}
                                            >
                                                {/* LINHA DE CABEÇALHO DO TURNO */}
                                                <div className="flex h-12 items-center justify-center rounded-l-md border-r bg-primary/5 pr-2 font-bold text-primary">
                                                    {turno.nome}
                                                </div>
                                                {DIAS.map((dia) => {
                                                    const chavesTurnoDia =
                                                        turno.tempos.map(
                                                            (t) =>
                                                                `${dia.id}-${t.id}`,
                                                        );
                                                    const allSelected =
                                                        chavesTurnoDia.length >
                                                            0 &&
                                                        chavesTurnoDia.every(
                                                            (k) =>
                                                                data.disponibilidade.includes(
                                                                    k,
                                                                ),
                                                        );
                                                    const someSelected =
                                                        chavesTurnoDia.some(
                                                            (k) =>
                                                                data.disponibilidade.includes(
                                                                    k,
                                                                ),
                                                        ) && !allSelected;

                                                    return (
                                                        <div
                                                            key={`all-${turno.id}-${dia.id}`}
                                                            className="flex h-12 items-center justify-center bg-primary/5 last:rounded-r-md"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleTurnoDia(
                                                                        dia.id,
                                                                        turno.tempos,
                                                                    )
                                                                }
                                                                className={clsx(
                                                                    'rounded px-2 py-1.5 text-[10px] font-semibold transition-colors',
                                                                    allSelected
                                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                                        : someSelected
                                                                          ? 'bg-primary/40 text-primary-foreground'
                                                                          : 'border bg-background text-muted-foreground hover:bg-muted',
                                                                )}
                                                            >
                                                                {allSelected
                                                                    ? 'Limpar'
                                                                    : 'Todos'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                {/* LINHAS DOS TEMPOS DENTRO DO TURNO */}
                                                {turno.tempos.map((tempo) => (
                                                    <React.Fragment
                                                        key={`row-${tempo.id}`}
                                                    >
                                                        <div className="flex h-12 flex-col items-center justify-center border-r pr-2 text-muted-foreground">
                                                            <span className="text-xs font-semibold">
                                                                {tempo.nome}
                                                            </span>
                                                            <span className="text-[10px] opacity-70">
                                                                {
                                                                    tempo.descricao
                                                                }
                                                            </span>
                                                        </div>
                                                        {DIAS.map((dia) => {
                                                            const isSelected =
                                                                data.disponibilidade.includes(
                                                                    `${dia.id}-${tempo.id}`,
                                                                );
                                                            return (
                                                                <div
                                                                    key={`${dia.id}-${tempo.id}`}
                                                                    className="flex h-12 items-center justify-center"
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            toggleDisponibilidade(
                                                                                dia.id,
                                                                                tempo.id,
                                                                            )
                                                                        }
                                                                        className={clsx(
                                                                            'flex h-7 w-7 items-center justify-center rounded transition-all',
                                                                            isSelected
                                                                                ? 'scale-110 bg-primary text-white shadow-md'
                                                                                : 'bg-muted hover:bg-muted-foreground/20',
                                                                        )}
                                                                    >
                                                                        {isSelected && (
                                                                            <X className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    setEditOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="professor-form"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Salvando...'
                                    : 'Guardar Alterações'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal Detalhes (Show) */}
            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-2xl"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Perfil do Professor
                        </SheetTitle>
                    </div>

                    {selectedProfessor && (
                        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
                            {/* Cabeçalho de Perfil */}
                            <div className="flex flex-col items-center space-y-2 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                    <UserCircle className="h-12 w-12 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        {selectedProfessor.nome}
                                    </h3>
                                    <p className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />{' '}
                                        {selectedProfessor.email}
                                    </p>
                                </div>
                            </div>

                            {/* Secção de Disciplinas */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 border-b pb-2 text-sm font-bold">
                                    <GraduationCap className="h-4 w-4" />
                                    Disciplinas Habilitadas
                                </Label>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    {selectedProfessor.disciplinas_que_ensina &&
                                    selectedProfessor.disciplinas_que_ensina
                                        .length > 0 ? (
                                        selectedProfessor.disciplinas_que_ensina.map(
                                            (d: any) => (
                                                <div
                                                    key={d.id}
                                                    className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm shadow-sm"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    <span className="font-medium">
                                                        {d.nome}
                                                    </span>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Nenhuma disciplina associada.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Secção de Disponibilidade (Apenas Visual) */}
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2 border-b pb-2 text-sm font-bold">
                                    <CalendarClock className="h-4 w-4" />
                                    Mapa de Disponibilidade
                                </Label>

                                <div className="grid grid-cols-6 gap-1 text-center text-[11px] font-medium">
                                    <div className="pb-2 text-muted-foreground">
                                        Tempos
                                    </div>
                                    {DIAS.map((dia) => (
                                        <div key={dia.id} className="pb-2">
                                            {dia.nome}
                                        </div>
                                    ))}

                                    {turnosDinamicos.map((turno) => (
                                        <React.Fragment
                                            key={`view-turno-${turno.id}`}
                                        >
                                            {/* Rótulo do Turno */}
                                            <div className="col-span-6 mt-2 rounded bg-muted/50 px-2 py-1 text-left text-[10px] font-bold tracking-wider uppercase">
                                                Turno: {turno.nome}
                                            </div>

                                            {turno.tempos.map((tempo) => (
                                                <React.Fragment
                                                    key={`view-row-${tempo.id}`}
                                                >
                                                    {/* Hora e Nome do Tempo */}
                                                    <div className="flex flex-col items-center justify-center border-r bg-muted/10 py-2">
                                                        <span className="font-bold">
                                                            {tempo.nome}
                                                        </span>
                                                        <span className="scale-90 opacity-70">
                                                            {
                                                                tempo.descricao.split(
                                                                    ' - ',
                                                                )[0]
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Células de Disponibilidade */}
                                                    {DIAS.map((dia) => {
                                                        // Verifica se o professor tem este tempo na sua lista de disponibilidades
                                                        const estaDisponivel =
                                                            selectedProfessor.disponibilidades?.some(
                                                                (disp: any) =>
                                                                    parseInt(
                                                                        disp.dia_semana,
                                                                    ) ===
                                                                        dia.id &&
                                                                    parseInt(
                                                                        disp.tempo_aula_id,
                                                                    ) ===
                                                                        tempo.id,
                                                            );

                                                        return (
                                                            <div
                                                                key={`view-${dia.id}-${tempo.id}`}
                                                                className={clsx(
                                                                    'flex h-10 items-center justify-center rounded-sm transition-colors',
                                                                    estaDisponivel
                                                                        ? 'border border-green-500/30 bg-green-500/20 text-green-700'
                                                                        : 'bg-muted/20 text-muted-foreground/30',
                                                                )}
                                                            >
                                                                {estaDisponivel ? (
                                                                    <span className="text-[10px] font-bold">
                                                                        LIVRE
                                                                    </span>
                                                                ) : (
                                                                    <X className="h-3 w-3 opacity-20" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* O Modal de Deletar e Atribuição de Disciplinas mantêm-se iguais ao seu código original */}

            {/* Modal Deletar */}
            <AnimatePresence>
                {deleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-lg"
                        >
                            <h2 className="mb-4 text-lg font-semibold">
                                Excluir Professor
                            </h2>
                            <div className="rounded-lg border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="mb-2 text-center font-bold text-destructive">
                                    CUIDADO!
                                </AlertTitle>
                                <p className="text-sm">
                                    Você está prestes a remover{' '}
                                    <strong>{selectedProfessor?.nome}</strong>{' '}
                                    do sistema.
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() =>
                                        router.delete(
                                            `/professores/${selectedProfessor.id}`,
                                            {
                                                onSuccess: () =>
                                                    setDeleteOpen(false),
                                            },
                                        )
                                    }
                                    className="bg-rose-600 text-white hover:bg-rose-700"
                                >
                                    Confirmar Exclusão
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Atribuição de Disciplinas */}
            <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full flex-col p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Atribuir Disciplinas
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Selecione as disciplinas que{' '}
                            <strong>{selectedProfessor?.nome}</strong> leciona.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <form
                            id="assign-disciplinas-form"
                            onSubmit={submitAssign}
                            className="space-y-4"
                        >
                            <Label>Disciplinas Disponíveis</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {disciplinas.map((disciplina: any) => {
                                    const isChecked =
                                        data.disciplina_ids.includes(
                                            disciplina.id.toString(),
                                        );

                                    return (
                                        <label
                                            key={disciplina.id}
                                            className={clsx(
                                                'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors',
                                                isChecked
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {disciplina.nome}
                                                </span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const id =
                                                        disciplina.id.toString();
                                                    const currentIds = [
                                                        ...data.disciplina_ids,
                                                    ];

                                                    if (e.target.checked) {
                                                        setData(
                                                            'disciplina_ids',
                                                            [...currentIds, id],
                                                        );
                                                    } else {
                                                        setData(
                                                            'disciplina_ids',
                                                            currentIds.filter(
                                                                (item) =>
                                                                    item !== id,
                                                            ),
                                                        );
                                                    }
                                                }}
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-background p-6">
                        <Button
                            form="assign-disciplinas-form"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
