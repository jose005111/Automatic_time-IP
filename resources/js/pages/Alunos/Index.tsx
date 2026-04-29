import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Users,
    Key,
    GraduationCap,
    BookOpen,
    FileSpreadsheet,
    UploadCloud,
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
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Alunos',
        href: '/alunos',
    },
];

export default function AlunosIndex({
    alunos = [],
    cursos = [],
    turmas = [],
    search = '',
    flash,
}: any) {
    // Estados dos Modais (Sheets / Overlays)
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const [selectedAluno, setSelectedAluno] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    // Formulário Único (usado para Add e Edit)
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: '',
        nome: '',
        curso_id: '',
        turma_id: '',
        arquivo: null as File | null, // Para importação
    });

    // LÓGICA DE FILTRO DE TURMAS: Só mostra as turmas que pertencem ao curso selecionado
    const turmasFiltradas = turmas.filter(
        (t: any) => t.curso_id?.toString() === data.curso_id?.toString(),
    );

    // --- MÉTODOS CRUD ---
    function submitAdd(e: React.FormEvent) {
        e.preventDefault();
        post('/alunos/adicionar', {
            onSuccess: () => {
                reset();
                setAddOpen(false);
            },
        });
    }

    function submitUpdate(e: React.FormEvent) {
        e.preventDefault();
        // Presume-se que tens uma rota PUT para atualizar o aluno
        put(`/alunos/${selectedAluno?.id}`, {
            onSuccess: () => {
                reset();
                setEditOpen(false);
            },
        });
    }

    function submitImport(e: React.FormEvent) {
        e.preventDefault();
        post('/alunos/importar', {
            onSuccess: () => {
                reset();
                setImportOpen(false);
            },
        });
    }

    function destroy() {
        router.delete(`/alunos/${selectedAluno?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    }

    // --- PESQUISA ---
    function handleSearch() {
        router.get(
            '/alunos',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alunos | Gestão" />

            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                {/* Cabeçalho e Ações Principais */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => {
                                reset();
                                setAddOpen(true);
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        </Button>
                        <Button
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => {
                                reset();
                                setImportOpen(true);
                            }}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                            Importar Excel
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Input
                            type="text"
                            placeholder="Pesquisar por nome ou matrícula..."
                            className="w-full sm:w-[300px]"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        {query ? (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setQuery('');
                                    router.get('/alunos');
                                }}
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

                {/* Mensagens de Flash */}
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-600">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-600">
                        {flash.error}
                    </div>
                )}
                {/* Exibir erros de importação */}
                {flash?.import_errors && flash.import_errors.length > 0 && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                        <p className="mb-2 text-sm font-semibold text-yellow-600">
                            ⚠️ Erros durante a importação:
                        </p>
                        <div className="max-h-40 overflow-y-auto">
                            <ul className="list-disc pl-5 text-xs text-yellow-700">
                                {flash.import_errors.map(
                                    (error: string, idx: number) => (
                                        <li key={idx}>{error}</li>
                                    ),
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Tabela de Dados */}
                <div className="max-h-[calc(100vh-260px)] overflow-x-auto overflow-y-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <tr className="border-b text-left">
                                <th className="p-3 font-semibold">
                                    Nome do Aluno
                                </th>
                                <th className="p-3 font-semibold">Matrícula</th>
                                <th className="p-3 font-semibold">Curso</th>
                                <th className="p-3 font-semibold">Turma</th>
                                <th className="p-3 text-center font-semibold">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {!alunos.data || alunos.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-10 text-center text-muted-foreground"
                                    >
                                        Nenhum aluno encontrado.
                                    </td>
                                </tr>
                            ) : (
                                alunos.data.map((aluno: any, index: number) => (
                                    <motion.tr
                                        key={aluno.id}
                                        className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="flex items-center gap-3 p-3 font-medium">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            {aluno.nome}
                                        </td>
                                        <td className="p-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wider text-slate-800">
                                                <Key className="h-3.5 w-3.5 text-slate-400" />
                                                {aluno.matricula}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="flex items-center gap-1.5">
                                                <GraduationCap className="h-4 w-4 text-slate-400" />
                                                {aluno.curso?.nome || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen className="h-4 w-4 text-slate-400" />
                                                {aluno.turma?.nome || 'N/A'}
                                                {aluno.turma?.periodo === 1 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        Regural
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        Pós-Laboral
                                                    </span>
                                                )}
                                                {aluno.turma?.ano === 1 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        1º Ano
                                                    </span>
                                                ) : aluno.turma?.ano === 2 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        2º Ano
                                                    </span>
                                                ) : aluno.turma?.ano === 3 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        3º Ano
                                                    </span>
                                                ) : aluno.turma?.ano === 4 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        4º Ano
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        5º Ano
                                                    </span>
                                                )}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAluno(aluno);
                                                        setData({
                                                            id: aluno.id,
                                                            nome: aluno.nome,
                                                            curso_id:
                                                                aluno.curso_id?.toString() ||
                                                                '',
                                                            turma_id:
                                                                aluno.turma_id?.toString() ||
                                                                '',
                                                            arquivo: null,
                                                        });
                                                        setEditOpen(true);
                                                    }}
                                                    className="border-none bg-yellow-500 text-white hover:bg-yellow-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedAluno(aluno);
                                                        setDeleteOpen(true);
                                                    }}
                                                    className="border-none bg-rose-500 text-white hover:bg-rose-600"
                                                >
                                                    <Trash2Icon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {alunos.data && alunos.data.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
                        <div className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-medium">{alunos.from}</span> a{' '}
                            <span className="font-medium">{alunos.to}</span> de{' '}
                            <span className="font-medium">{alunos.total}</span>{' '}
                            registros
                        </div>

                        <div className="flex items-center gap-1">
                            {alunos.links.map((link: any, index: number) => (
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

            {/* MODAL (Sheet): ADICIONAR ALUNO */}
            <Sheet open={addOpen} onOpenChange={setAddOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Novo Aluno
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Associe um aluno ao curso e turma respetiva.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="add-form"
                            onSubmit={submitAdd}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) =>
                                        setData('nome', e.target.value)
                                    }
                                    required
                                    placeholder="Ex: Ana Luísa Martins"
                                />
                                {errors.nome && (
                                    <p className="text-xs text-destructive">
                                        {errors.nome}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Curso</Label>
                                <Select
                                    value={data.curso_id}
                                    onValueChange={(value) => {
                                        // Ao mudar o curso, limpamos a turma atual
                                        setData((prev) => ({
                                            ...prev,
                                            curso_id: value,
                                            turma_id: '',
                                        }));
                                    }}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um curso..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos?.map((c: any) => (
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
                                <Label>
                                    Turma (Depende do Curso selecionado)
                                </Label>
                                <Select
                                    value={data.turma_id}
                                    onValueChange={(value) =>
                                        setData('turma_id', value)
                                    }
                                    required
                                    disabled={!data.curso_id} // Desativa se não houver curso
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                data.curso_id
                                                    ? 'Selecione uma turma...'
                                                    : 'Selecione o curso primeiro'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turmasFiltradas.length > 0 ? (
                                            turmasFiltradas.map((t: any) => (
                                                <SelectItem
                                                    key={t.id}
                                                    value={t.id.toString()}
                                                >
                                                    {t.nome}
                                                    {t.periodo === 1 ? (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            Regural
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                            Pós-Laboral
                                                        </span>
                                                    )}
                                                    {t.ano === 1 ? (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            1º Ano
                                                        </span>
                                                    ) : t.ano === 2 ? (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            2º Ano
                                                        </span>
                                                    ) : t.ano === 3 ? (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            3º Ano
                                                        </span>
                                                    ) : t.ano === 4 ? (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                            4º Ano
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                            5º Ano
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-sm text-muted-foreground">
                                                Nenhuma turma neste curso
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.turma_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.turma_id}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="add-form"
                                disabled={processing}
                            >
                                {processing ? 'A Salvar...' : 'Salvar Aluno'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* MODAL (Sheet): EDITAR ALUNO */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Editar Aluno
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Atualizar informações da matrícula:{' '}
                            <span className="font-bold">
                                {selectedAluno?.matricula}
                            </span>
                            .
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="edit-form"
                            onSubmit={submitUpdate}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="edit-nome">Nome Completo</Label>
                                <Input
                                    id="edit-nome"
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
                                <Label>Curso</Label>
                                <Select
                                    value={data.curso_id}
                                    onValueChange={(value) =>
                                        setData((prev) => ({
                                            ...prev,
                                            curso_id: value,
                                            turma_id: '',
                                        }))
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um curso..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos?.map((c: any) => (
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
                                <Label>Turma</Label>
                                <Select
                                    value={data.turma_id}
                                    onValueChange={(value) =>
                                        setData('turma_id', value)
                                    }
                                    required
                                    disabled={!data.curso_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma turma..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turmasFiltradas.map((t: any) => (
                                            <SelectItem
                                                key={t.id}
                                                value={t.id.toString()}
                                            >
                                                {t.nome}
                                                {t.periodo === 1 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        Regural
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        Pós-Laboral
                                                    </span>
                                                )}
                                                {t.ano === 1 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        1º Ano
                                                    </span>
                                                ) : t.ano === 2 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        2º Ano
                                                    </span>
                                                ) : t.ano === 3 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        3º Ano
                                                    </span>
                                                ) : t.ano === 4 ? (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        4º Ano
                                                    </span>
                                                ) : (
                                                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                                        5º Ano
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.turma_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.turma_id}
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>

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
                                form="edit-form"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Atualizando...'
                                    : 'Atualizar Aluno'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* MODAL (Sheet): IMPORTAR EXCEL */}
            <Sheet open={importOpen} onOpenChange={setImportOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Importar Alunos
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Faça upload de um ficheiro Excel (.xlsx) ou CSV.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="import-form"
                            onSubmit={submitImport}
                            className="space-y-5"
                        >
                            <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center transition-colors hover:bg-slate-100">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) =>
                                        setData(
                                            'arquivo',
                                            e.target.files
                                                ? e.target.files[0]
                                                : null,
                                        )
                                    }
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />
                                <UploadCloud className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                                <p className="text-sm font-medium text-slate-700">
                                    {data.arquivo
                                        ? data.arquivo.name
                                        : 'Clica ou arrasta o ficheiro aqui'}
                                </p>
                            </div>
                            {errors.arquivo && (
                                <p className="text-center text-xs text-destructive">
                                    {errors.arquivo}
                                </p>
                            )}

                            <div className="rounded-lg bg-blue-50 p-4">
                                <p className="mb-1 text-xs font-medium text-blue-800">
                                    💡 O teu ficheiro deve ter esta estrutura no
                                    cabeçalho:
                                </p>
                                <code className="block rounded border border-blue-100 bg-white px-2 py-1 text-xs text-blue-600">
                                    nome | curso_id | turma_id
                                </code>
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setImportOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="import-form"
                                disabled={processing}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                {processing
                                    ? 'A Importar...'
                                    : 'Iniciar Importação'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* OVERLAY: EXCLUIR ALUNO (Framer Motion) */}
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

                            <div className="border-variant rounded-lg border-1 bg-destructive/10 p-4 text-center">
                                <AlertTitle>Atenção!</AlertTitle>
                                <p className="text-sm">
                                    Tem certeza que deseja excluir o aluno{' '}
                                    <strong className="text-center">
                                        {selectedAluno?.nome}
                                    </strong>
                                    ?<br />
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
                                    className="bg-rose-600 text-white hover:bg-rose-700"
                                >
                                    Excluir Aluno
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
