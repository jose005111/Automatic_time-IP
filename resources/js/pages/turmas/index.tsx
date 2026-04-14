import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Eye,
    ListFilter,
    PlusCircle,
    Printer,
    Search,
    Trash2Icon,
    X,
    Plus,
    Trash,
} from 'lucide-react';
import { useState } from 'react';
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
} from '@/components/ui/select'; // seu Radix Select

import {
    Sheet,
    SheetContent,
    // SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Turmas',
        href: '/turma',
    },
];

export default function TurmaIndex({
    turmas = [],
    salas,
    cursos,
    disciplinas,
    professores,
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedTurma, setSelectedTurma] = useState<any>(
        turmas.data[0] || null,
    );

    const [query, setQuery] = useState(search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        nome: '',
        periodo: '',
        turno: '',
        ano: '',
        sala_id: '',
        curso_id: '',
        atribuicoes: [
            { disciplina_id: '', professor_id: '', tempos_semanais: '2' },
        ],
    });

    //Metodos CRUD - podem ser aprimorados para tratar erros, loading, etc.
    function submit(e: React.FormEvent) {
        e.preventDefault();
        console.log(data);
        post('/turmas', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();

        post(`/turmas/${selectedTurma?.id}`, {
            method: 'put',
            onSuccess: () => {
                setEditOpen(false);
            },
        });
    }

    function destroy() {
        router.delete(`/turmas/${selectedTurma?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    }

    // Pesquisa simples - pode ser aprimorada para debounce, etc.
    function handleSearch() {
        router.get(
            '/turmas',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    // Adiciona nova linha de disciplina no formulário
    const addAtribuicao = () => {
        setData('atribuicoes', [
            ...data.atribuicoes,
            { disciplina_id: '', professor_id: '', tempos_semanais: '2' },
        ]);
    };

    // Remove uma linha
    const removeAtribuicao = (index: number) => {
        const list = [...data.atribuicoes];
        list.splice(index, 1);
        setData('atribuicoes', list);
    };

    // Atualiza campo específico da atribuição
    const updateAtribuicao = (index: number, field: string, value: string) => {
        const list = [...data.atribuicoes];
        (list[index] as any)[field] = value;
        setData('atribuicoes', list);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="turmas" />
            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => {
                                reset();
                                setOpen(true);
                            }}
                        >
                            <PlusCircle className="h-4 w-4" /> Adicionar
                        </Button>
                        {/* <Button onClick={() => setOpen(true)}>
                            <ListFilter className="h-4 w-4" /> Filtrar
                        </Button>

                        <a href={`/salas/print`} target="_blank">
                            <Button>
                                <Printer className="h-4 w-4" />
                                Imprimir PDF
                            </Button>
                        </a> */}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Pesquisar..."
                            className="max-w-xs"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        {query ? (
                            <Button
                                variant="secondary"
                                onClick={() => router.get('/turmas')}
                            >
                                <X />
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
                        <thead>
                            <tr className="border-b text-left">
                                <th className="p-3">nome</th>
                                <th className="p-3">periodo</th>
                                <th className="p-3">ano</th>
                                <th className="p-3">curso</th>
                                <th className="p-3 text-center">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turmas.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma turma encontrada.
                                    </td>
                                </tr>
                            ) : (
                                turmas.data.map((turma: any, index: number) => (
                                    // <tr key={turma.id} className="border-b">
                                    <motion.tr
                                        key={turma.id}
                                        className="border-b"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }} // Efeito cascata subtil
                                    >
                                        <td className="p-3">{turma.nome}</td>

                                        <td className="p-3">{turma.periodo}</td>
                                        <td className="p-3">
                                            {turma.ano}º Ano
                                        </td>
                                        <td className="p-3">
                                            {turma.curso?.nome}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTurma(turma);
                                                        setViewOpen(true);
                                                    }}
                                                    className="border-none bg-cyan-500 hover:bg-cyan-600"
                                                >
                                                    <Eye className="h-4 w-4 text-background" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTurma(turma);
                                                        setData({
                                                            id: turma.id,
                                                            nome: turma.nome,
                                                            periodo:
                                                                turma.periodo,
                                                            turno: turma.turno,
                                                            ano: turma.ano,
                                                            sala_id:
                                                                turma.sala_id,
                                                            curso_id:
                                                                turma.curso_id,
                                                        });
                                                        setEditOpen(true);
                                                    }}
                                                    className="border-none bg-yellow-500 hover:bg-yellow-600"
                                                >
                                                    <Edit className="h-4 w-4 text-background" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedTurma(turma);
                                                        setDeleteOpen(true);
                                                    }}
                                                    className="border-none bg-rose-500 hover:bg-rose-600"
                                                >
                                                    <Trash2Icon className="h-4 w-4 text-background" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {turmas.data.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
                        {/* Informação */}
                        <div className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-medium">{turmas.from}</span> a{' '}
                            <span className="font-medium">{turmas.to}</span> de{' '}
                            <span className="font-medium">{turmas.total}</span>{' '}
                            registros
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center gap-1">
                            {turmas.links.map((link: any, index: number) => (
                                <button
                                    key={index}
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url &&
                                        router.visit(link.url, {
                                            preserveScroll: true,
                                        })
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={clsx(
                                        'rounded-md border px-3 py-1 text-sm transition',
                                        link.active
                                            ? 'bg-primary text-background'
                                            : 'bg-background hover:bg-muted',
                                        !link.url &&
                                            'cursor-not-allowed opacity-50',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* //Modal de criação - pode ser reutilizado para edição com ajustes */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    {/* HEADER */}
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Nova Turma
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações da Turma
                        </p>
                    </div>

                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="Turma-form"
                            onSubmit={submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) =>
                                        setData('nome', e.target.value)
                                    }
                                />
                                {errors.nome && (
                                    <p className="text-xs text-destructive">
                                        {errors.nome}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="curso_id">Curso</Label>
                                <Select
                                    value={data.curso_id.toString()}
                                    onValueChange={(value: string) =>
                                        setData('curso_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o curso da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {cursos.map((curso: any) => (
                                            <SelectItem
                                                value={curso.id.toString()}
                                                key={curso.id}
                                            >
                                                {curso.nome}
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
                                <Label htmlFor="ano">Ano de frequência</Label>
                                <Select
                                    value={data.ano.toString()}
                                    onValueChange={(value: string) =>
                                        setData('ano', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o ano de frequência" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            1º Ano
                                        </SelectItem>
                                        <SelectItem value={'2'}>
                                            2º Ano
                                        </SelectItem>
                                        <SelectItem value={'3'}>
                                            3º Ano
                                        </SelectItem>
                                        <SelectItem value={'4'}>
                                            4º Ano
                                        </SelectItem>
                                        <SelectItem value={'5'}>
                                            5º Ano
                                        </SelectItem>
                                        <SelectItem value={'6'}>
                                            6º Ano
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.ano && (
                                    <p className="text-xs text-destructive">
                                        {errors.ano}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="periodo">Periodo</Label>
                                <Select
                                    value={data.periodo.toString()}
                                    onValueChange={(value: string) =>
                                        setData('periodo', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o periodo da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            Regular
                                        </SelectItem>
                                        <SelectItem value={'0'}>
                                            Pós-Laboral
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.periodo && (
                                    <p className="text-xs text-destructive">
                                        {errors.periodo}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="turno">Turno</Label>
                                <Select
                                    value={data.turno.toString()}
                                    onValueChange={(value: string) =>
                                        setData('turno', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o turno da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'0'}>
                                            Manhã
                                        </SelectItem>
                                        <SelectItem value={'1'}>
                                            Tarde
                                        </SelectItem>
                                        <SelectItem value={'2'}>
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
                            <div className="space-y-2">
                                <Label htmlFor="sala_id">Sala</Label>
                                <Select
                                    value={data.sala_id.toString()}
                                    onValueChange={(value: string) =>
                                        setData('sala_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o sala da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {salas.map((sala: any) => (
                                            <SelectItem
                                                value={sala.id.toString()}
                                                key={sala.id}
                                            >
                                                {sala.numero}
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

                            <div className="border-t pt-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <Label className="text-lg font-bold">
                                        Disciplinas e Professores
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addAtribuicao}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />{' '}
                                        Adicionar
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {data.atribuicoes.map((item, index) => (
                                        <div
                                            key={index}
                                            className="relative space-y-3 rounded-lg border bg-muted/30 p-4"
                                        >
                                            {data.atribuicoes.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-white"
                                                    onClick={() =>
                                                        removeAtribuicao(index)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
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
                                                        <SelectTrigger>
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

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
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
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {professores.map(
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
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                            Tempos/Semana
                                                        </Label>
                                                        <Input
                                                            type="number"
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
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* FOOTER FIXO */}
                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                form="Turma-form"
                                disabled={processing}
                            >
                                {processing ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {/* //Modal de visualização - pode ser reutilizado para edição com ajustes */}

            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    {/* HEADER */}
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Detalhes da Turma
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Informações detalhadas da Turma.
                        </p>
                    </div>
                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {selectedTurma ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4"></div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Nome
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.nome}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Curso
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.curso?.nome}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Ano de frequência
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.ano}º Ano
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Periodo
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.periodo}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Turno
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.turno}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Sala
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedTurma.sala?.numero}
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">
                                Nenhuma Turma selecionada.
                            </p>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
            {/* //Modal de edição - pode ser reutilizado para criação com ajustes */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    {/* HEADER */}
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Actualizar Turma
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações da sala.
                        </p>
                    </div>

                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="Turma-form"
                            onSubmit={update}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome</Label>
                                <Input
                                    id="nome"
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

                            <div className="space-y-2">
                                <Label htmlFor="curso_id">Curso</Label>
                                <Select
                                    value={data.curso_id.toString()}
                                    onValueChange={(value: string) =>
                                        setData('curso_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o sala da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {cursos.map(
                                            (curso: any, index: number) => {
                                                <SelectItem
                                                    value={curso.id}
                                                    key={index}
                                                >
                                                    {curso.nome}
                                                </SelectItem>;
                                            },
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.curso_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.curso_id}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ano">Ano de frequência</Label>
                                <Select
                                    value={data.ano.toString()}
                                    onValueChange={(value: string) =>
                                        setData('ano', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o ano de frequência" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            1º Ano
                                        </SelectItem>
                                        <SelectItem value={'2'}>
                                            2º Ano
                                        </SelectItem>
                                        <SelectItem value={'3'}>
                                            3º Ano
                                        </SelectItem>
                                        <SelectItem value={'4'}>
                                            4º Ano
                                        </SelectItem>
                                        <SelectItem value={'5'}>
                                            5º Ano
                                        </SelectItem>
                                        <SelectItem value={'6'}>
                                            6º Ano
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.ano && (
                                    <p className="text-xs text-destructive">
                                        {errors.ano}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="periodo">Periodo</Label>
                                <Select
                                    value={data.periodo.toString()}
                                    onValueChange={(value: string) =>
                                        setData('periodo', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o periodo da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            Regular
                                        </SelectItem>
                                        <SelectItem value={'0'}>
                                            Pós-Laboral
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.periodo && (
                                    <p className="text-xs text-destructive">
                                        {errors.periodo}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="turno">Turno</Label>
                                <Select
                                    value={data.turno.toString()}
                                    onValueChange={(value: string) =>
                                        setData('turno', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o turno da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'0'}>
                                            Manhã
                                        </SelectItem>
                                        <SelectItem value={'1'}>
                                            Tarde
                                        </SelectItem>
                                        <SelectItem value={'2'}>
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
                            <div className="space-y-2">
                                <Label htmlFor="sala_id">Sala</Label>
                                <Select
                                    value={data.sala_id.toString()}
                                    onValueChange={(value: string) =>
                                        setData('sala_id', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o sala da turma" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {salas.map(
                                            (sala: any, index: number) => {
                                                <SelectItem
                                                    value={sala.id}
                                                    key={index}
                                                >
                                                    {sala.numero}
                                                </SelectItem>;
                                            },
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.sala_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.sala_id}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* FOOTER FIXO */}
                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                form="Turma-form"
                                disabled={processing}
                            >
                                {processing ? 'Actualizando...' : 'Actualizar'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {/* //Modal de exclusão - pode ser aprimorado para confirmar com senha, etc. */}
            {deleteOpen && (
                <div
                    className={clsx(
                        'fixed inset-0 z-50 flex items-center justify-center',
                        deleteOpen
                            ? 'opacity-100'
                            : 'pointer-events-none opacity-0',
                    )}
                >
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteOpen(false)}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-lg"
                    >
                        <h2 className="mb-4 text-lg font-semibold">
                            Confirmar Exclusão
                        </h2>

                        <motion.div className="border-variant rounded-lg border-1 bg-destructive/10 p-4 text-center">
                            <AlertTitle>Atenção!</AlertTitle>
                            <p className="text-sm">
                                Tem certeza que deseja excluir a turma{' '}
                                <strong className="text-center">
                                    {selectedTurma?.nome}
                                </strong>{' '}
                                <br />
                                Esta ação não poderá ser desfeita.
                            </p>
                        </motion.div>

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
        </AppLayout>
    );
}
