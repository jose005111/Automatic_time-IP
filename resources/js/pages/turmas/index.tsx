import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Plus,
    BookOpen,
    User,
    Clock,
    Calendar,
} from 'lucide-react';
import React, { useState } from 'react';
import { AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Turmas', href: '/turmas' }];

// Mapeamentos para exibição
const regimeMap = {
    0: 'Regular',
    1: 'Pós-Laboral',
};

const turnoMap = {
    0: 'Manhã',
    1: 'Tarde',
    2: 'Noite',
};

export default function TurmaIndex({
    turmas = { data: [], links: [] },
    salas = [],
    cursos = [],
    periodosLectivos = [],
    disciplinas = [],
    professores = [],
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        regime: '',
        turno: '',
        periodos_lectivo_id: '',
        sala_id: '',
        curso_id: '',
        alocacoes: [
            { disciplina_id: '', professor_id: '', tempos_semanais: '2' },
        ],
    });

    const handleCreate = () => {
        setIsEditing(false);
        reset();
        setOpen(true);
    };

    const handleEdit = (turma: any) => {
        setIsEditing(true);
        setSelectedTurma(turma);

        setData({
            nome: turma.nome,
            regime: turma.regime?.toString() || '',
            turno: turma.turno?.toString() || '',
            periodos_lectivo_id: turma.periodos_lectivo_id?.toString() || '',
            sala_id: turma.sala_id?.toString() || '',
            curso_id: turma.curso_id?.toString() || '',
            alocacoes:
                turma.alocacoes?.length > 0
                    ? turma.alocacoes.map((a: any) => ({
                          disciplina_id: a.disciplina_id?.toString() || '',
                          professor_id: a.professor_id?.toString() || '',
                          tempos_semanais: a.tempos_semanais?.toString() || '2',
                      }))
                    : [
                          {
                              disciplina_id: '',
                              professor_id: '',
                              tempos_semanais: '2',
                          },
                      ],
        });
        setOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && selectedTurma) {
            put(`/turmas/${selectedTurma.id}`, {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        } else {
            post('/turmas', {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    };

    const destroy = () => {
        router.delete(`/turmas/${selectedTurma?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    };

    const handleSearch = () => {
        router.get(
            '/turmas',
            { search: query },
            { preserveState: true, replace: true },
        );
    };

    const addAtribuicao = () => {
        setData('alocacoes', [
            ...data.alocacoes,
            { disciplina_id: '', professor_id: '', tempos_semanais: '2' },
        ]);
    };

    const removeAtribuicao = (index: number) => {
        const list = [...data.alocacoes];
        list.splice(index, 1);
        setData('alocacoes', list);
    };

    const updateAtribuicao = (index: number, field: string, value: string) => {
        const list = [...data.alocacoes];
        (list[index] as any)[field] = value;

        if (field === 'disciplina_id') {
            (list[index] as any)['professor_id'] = '';
        }

        setData('alocacoes', list);
    };

    const getProfessoresDaDisciplina = (disciplinaId: string) => {
        if (!disciplinaId) return [];
        return professores.filter((prof: any) =>
            prof.disciplinas_que_ensina?.some(
                (d: any) => d.id.toString() === disciplinaId,
            ),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Turmas" />
            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Button onClick={handleCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Turma
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Pesquisar por nome da turma..."
                            className="max-w-xs"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                        />
                        {query ? (
                            <Button
                                variant="secondary"
                                onClick={() => router.get('/turmas')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={handleSearch}>
                                <Search className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabela */}
                <div className="max-h-[calc(100vh-260px)] overflow-x-auto overflow-y-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/50">
                            <tr className="border-b text-left">
                                <th className="p-3">Nome da Turma</th>
                                <th className="p-3">Curso</th>
                                <th className="p-3">Período Lectivo</th>
                                <th className="p-3">Regime/Turno</th>
                                <th className="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turmas.data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma turma encontrada.
                                    </td>
                                </tr>
                            ) : (
                                turmas.data?.map(
                                    (turma: any, index: number) => (
                                        <motion.tr
                                            key={turma.id}
                                            className="border-b hover:bg-muted/30"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="p-3 font-medium">
                                                {turma.nome}
                                            </td>
                                            <td className="p-3">
                                                {turma.curso?.nome}
                                            </td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {turma.periodo_lectivo?.ano}{' '}
                                                    -{' '}
                                                    {
                                                        turma.periodo_lectivo
                                                            ?.semestre
                                                    }
                                                    º Semestre
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <Badge variant="secondary">
                                                        {
                                                            regimeMap[
                                                                turma.regime as keyof typeof regimeMap
                                                            ]
                                                        }
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {
                                                            turnoMap[
                                                                turma.turno as keyof typeof turnoMap
                                                            ]
                                                        }
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-cyan-500 text-white hover:bg-cyan-600"
                                                        onClick={() => {
                                                            setSelectedTurma(
                                                                turma,
                                                            );
                                                            setViewOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                                                        onClick={() =>
                                                            handleEdit(turma)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-rose-500 text-white hover:bg-rose-600"
                                                        onClick={() => {
                                                            setSelectedTurma(
                                                                turma,
                                                            );
                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ),
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-2xl"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            {isEditing ? 'Editar Turma' : 'Nova Turma'}
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Configure a turma, período lectivo e atribua os
                            docentes às disciplinas.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="turma-form"
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* DADOS BÁSICOS */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome da Turma</Label>
                                    <Input
                                        placeholder="Ex: Turma A, Turma B, etc."
                                        value={data.nome}
                                        onChange={(e) =>
                                            setData('nome', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.nome && (
                                        <p className="text-xs text-destructive">
                                            {errors.nome}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Curso</Label>
                                        <Select
                                            value={data.curso_id}
                                            onValueChange={(val) =>
                                                setData('curso_id', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o curso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cursos.map((c: any) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={c.id.toString()}
                                                    >
                                                        {c.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.curso_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.curso_id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Período Lectivo</Label>
                                        <Select
                                            value={data.periodos_lectivo_id}
                                            onValueChange={(val) =>
                                                setData(
                                                    'periodos_lectivo_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o período" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {periodosLectivos.map(
                                                    (p: any) => (
                                                        <SelectItem
                                                            key={p.id}
                                                            value={p.id.toString()}
                                                        >
                                                            {p.ano} -{' '}
                                                            {p.semestre}º
                                                            Semestre ({p.estado}
                                                            )
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.periodos_lectivo_id && (
                                            <p className="text-xs text-destructive">
                                                {errors.periodos_lectivo_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Regime</Label>
                                        <Select
                                            value={data.regime}
                                            onValueChange={(val) =>
                                                setData('regime', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o regime" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Regular
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Pós-Laboral
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.regime && (
                                            <p className="text-xs text-destructive">
                                                {errors.regime}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Turno</Label>
                                        <Select
                                            value={data.turno}
                                            onValueChange={(val) =>
                                                setData('turno', val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o turno" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Manhã
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Tarde
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Noite
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.turno && (
                                            <p className="text-xs text-destructive">
                                                {errors.turno}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sala</Label>
                                    <Select
                                        value={data.sala_id}
                                        onValueChange={(val) =>
                                            setData('sala_id', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a sala" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {salas.map((s: any) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={s.id.toString()}
                                                >
                                                    {s.numero} -{' '}
                                                    {s.tipo || 'Sala'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.sala_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.sala_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ATRIBUIÇÕES */}
                            <div className="border-t pt-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Label className="text-lg font-bold">
                                        Disciplinas e Docentes
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAtribuicao}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                        Adicionar Disciplina
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.alocacoes.map((item, index) => {
                                        const profsFiltrados =
                                            getProfessoresDaDisciplina(
                                                item.disciplina_id,
                                            );

                                        return (
                                            <div
                                                key={index}
                                                className="relative space-y-3 rounded-lg border bg-muted/30 p-4"
                                            >
                                                {data.alocacoes.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-white hover:bg-destructive/90"
                                                        onClick={() =>
                                                            removeAtribuicao(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                        Disciplina
                                                    </Label>
                                                    <Select
                                                        value={
                                                            item.disciplina_id
                                                        }
                                                        onValueChange={(val) =>
                                                            updateAtribuicao(
                                                                index,
                                                                'disciplina_id',
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Selecione a disciplina" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {disciplinas.map(
                                                                (d: any) => (
                                                                    <SelectItem
                                                                        key={
                                                                            d.id
                                                                        }
                                                                        value={d.id.toString()}
                                                                    >
                                                                        {d.nome}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="col-span-2 space-y-1">
                                                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                                                            Professor
                                                        </Label>
                                                        <Select
                                                            value={
                                                                item.professor_id
                                                            }
                                                            onValueChange={(
                                                                val,
                                                            ) =>
                                                                updateAtribuicao(
                                                                    index,
                                                                    'professor_id',
                                                                    val,
                                                                )
                                                            }
                                                            disabled={
                                                                !item.disciplina_id
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-background">
                                                                <SelectValue
                                                                    placeholder={
                                                                        item.disciplina_id
                                                                            ? 'Selecione o professor'
                                                                            : 'Escolha a disciplina primeiro'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {profsFiltrados.length ===
                                                                0 ? (
                                                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                                                        Nenhum
                                                                        professor
                                                                        habilitado
                                                                    </div>
                                                                ) : (
                                                                    profsFiltrados.map(
                                                                        (
                                                                            p: any,
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    p.id
                                                                                }
                                                                                value={p.id.toString()}
                                                                            >
                                                                                {
                                                                                    p.nome
                                                                                }
                                                                            </SelectItem>
                                                                        ),
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="block text-center text-xs font-bold text-muted-foreground uppercase">
                                                            Tempos/Semana
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            className="bg-background text-center"
                                                            value={
                                                                item.tempos_semanais
                                                            }
                                                            onChange={(e) =>
                                                                updateAtribuicao(
                                                                    index,
                                                                    'tempos_semanais',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            min="1"
                                                            max="10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="turma-form"
                            disabled={processing}
                        >
                            {processing
                                ? 'Processando...'
                                : isEditing
                                  ? 'Atualizar Turma'
                                  : 'Criar Turma'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* MODAL DE VISUALIZAÇÃO */}
            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col p-0 sm:max-w-md"
                >
                    <div className="border-b bg-primary/5 px-6 py-6">
                        <SheetTitle className="text-2xl font-bold text-primary">
                            {selectedTurma?.nome}
                        </SheetTitle>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {selectedTurma?.curso?.nome}
                        </p>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                                    Período Lectivo
                                </p>
                                <p className="text-sm font-semibold">
                                    {selectedTurma?.periodo_lectivo?.ano} -{' '}
                                    {selectedTurma?.periodo_lectivo?.semestre}º
                                    Semestre
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                                    Regime/Turno
                                </p>
                                <p className="text-sm font-semibold">
                                    {
                                        regimeMap[
                                            selectedTurma?.regime as keyof typeof regimeMap
                                        ]
                                    }{' '}
                                    /{' '}
                                    {
                                        turnoMap[
                                            selectedTurma?.turno as keyof typeof turnoMap
                                        ]
                                    }
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                                    Sala
                                </p>
                                <p className="text-sm font-semibold">
                                    Sala {selectedTurma?.sala?.numero}
                                </p>
                            </div>
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                                    Status
                                </p>
                                <Badge
                                    variant={
                                        selectedTurma?.periodo_lectivo
                                            ?.estado === 'activo'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {selectedTurma?.periodo_lectivo?.estado}
                                </Badge>
                            </div>
                        </div>

                        {/* Matriz Curricular */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 border-b pb-2 text-lg font-bold">
                                <BookOpen className="h-5 w-5 text-primary" />{' '}
                                Matriz Curricular
                            </h3>

                            <div className="space-y-3">
                                {selectedTurma?.alocacoes?.length > 0 ? (
                                    selectedTurma.alocacoes.map(
                                        (a: any, i: number) => (
                                            <div
                                                key={i}
                                                className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm"
                                            >
                                                <p className="text-base font-bold">
                                                    {a.disciplina?.nome}
                                                </p>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                        <User className="h-4 w-4" />{' '}
                                                        {a.professor?.nome}
                                                    </span>
                                                    <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                                                        <Clock className="h-3.5 w-3.5" />{' '}
                                                        {a.tempos_semanais}{' '}
                                                        tempos/sem
                                                    </span>
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="rounded-lg border bg-muted/20 py-4 text-center text-sm text-muted-foreground italic">
                                        Nenhuma disciplina atribuída a esta
                                        turma.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* MODAL DE EXCLUSÃO */}
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
                                Confirmar Exclusão
                            </h2>
                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="text-destructive">
                                    Atenção!
                                </AlertTitle>
                                <p className="mt-2 text-sm">
                                    Tem certeza que deseja excluir a turma{' '}
                                    <strong>{selectedTurma?.nome}</strong>?
                                    <br />
                                    Esta ação não poderá ser desfeita.
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
                                    onClick={destroy}
                                    className="bg-rose-600 hover:bg-rose-700"
                                >
                                    Excluir
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
