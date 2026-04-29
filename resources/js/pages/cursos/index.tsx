import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    GraduationCap,
    Calendar,
    Building,
    AlignLeft,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import clsx from 'clsx';
import { AlertTitle } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cursos', href: '/cursos' }];

export default function CursoIndex({
    cursos = { data: [] },
    departamentos = [], // Recebido do Controller
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        departamento_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/cursos', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        put(`/cursos/${selectedCurso?.id}`, {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    }

    function destroy() {
        router.delete(`/cursos/${selectedCurso?.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    function handleSearch() {
        router.get(
            '/cursos',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cursos" />

            <div className="flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Curso
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar curso..."
                            className="max-w-xs"
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

                {/* Tabela */}
                <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b text-left">
                                <th className="p-3 font-medium">
                                    Nome do Curso
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Departamento
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Vigência
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-6 text-center text-muted-foreground italic"
                                    >
                                        Nenhum curso encontrado.
                                    </td>
                                </tr>
                            ) : (
                                cursos.data.map((curso: any, index: number) => (
                                    <motion.tr
                                        key={curso.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="border-b transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 font-bold text-slate-800">
                                            {curso.nome}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                                                {curso.departamento?.sigla ||
                                                    'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center text-xs text-muted-foreground">
                                            {new Date(
                                                curso.data_inicio,
                                            ).getFullYear()}{' '}
                                            -{' '}
                                            {new Date(
                                                curso.data_fim,
                                            ).getFullYear()}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-cyan-500 text-white hover:bg-cyan-600"
                                                    onClick={() => {
                                                        setSelectedCurso(curso);
                                                        setViewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-yellow-500 text-white hover:bg-yellow-600"
                                                    onClick={() => {
                                                        setSelectedCurso(curso);
                                                        setData({
                                                            nome: curso.nome,
                                                            descricao:
                                                                curso.descricao,
                                                            data_inicio:
                                                                curso.data_inicio,
                                                            data_fim:
                                                                curso.data_fim,
                                                            departamento_id:
                                                                curso.departamento_id.toString(),
                                                        });
                                                        setEditOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-rose-500 text-white hover:bg-rose-600"
                                                    onClick={() => {
                                                        setSelectedCurso(curso);
                                                        setDeleteOpen(true);
                                                    }}
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
            </div>

            {/* Modal de Criação / Edição */}
            <Sheet
                open={open || editOpen}
                onOpenChange={(val) =>
                    !val && (setOpen(false), setEditOpen(false), reset())
                }
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="flex items-center gap-2 tracking-wide uppercase">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            {editOpen ? 'Editar Curso' : 'Novo Curso'}
                        </SheetTitle>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="curso-form"
                            onSubmit={editOpen ? update : submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Curso</Label>
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
                                <Label htmlFor="departamento_id">
                                    Departamento
                                </Label>
                                <Select
                                    value={data.departamento_id}
                                    onValueChange={(val) =>
                                        setData('departamento_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um departamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departamentos.map((dept: any) => (
                                            <SelectItem
                                                key={dept.id}
                                                value={dept.id.toString()}
                                            >
                                                {dept.nome} ({dept.sigla})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.departamento_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.departamento_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <textarea
                                    id="descricao"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.descricao}
                                    onChange={(e) =>
                                        setData('descricao', e.target.value)
                                    }
                                    required
                                />
                                {errors.descricao && (
                                    <p className="text-xs text-destructive">
                                        {errors.descricao}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="data_inicio">
                                        Data de Início
                                    </Label>
                                    <Input
                                        id="data_inicio"
                                        type="date"
                                        value={data.data_inicio}
                                        onChange={(e) =>
                                            setData(
                                                'data_inicio',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="data_fim">
                                        Data de Fim
                                    </Label>
                                    <Input
                                        id="data_fim"
                                        type="date"
                                        value={data.data_fim}
                                        onChange={(e) =>
                                            setData('data_fim', e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-muted/20 px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => (
                                    setOpen(false),
                                    setEditOpen(false)
                                )}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="curso-form"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Processando...'
                                    : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal de Detalhes (View) */}
            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-bold">
                            Detalhes do Curso
                        </SheetTitle>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        {selectedCurso && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl leading-tight font-black text-primary">
                                        {selectedCurso.nome}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        <Building className="h-3 w-3" />
                                        {selectedCurso.departamento?.nome}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-slate-500 italic">
                                        <AlignLeft className="h-4 w-4" />{' '}
                                        Descrição
                                    </Label>
                                    <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-sm leading-relaxed font-medium text-slate-700 italic">
                                        {selectedCurso.descricao}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                                        <Calendar className="mb-2 h-4 w-4 text-blue-500" />
                                        <span className="block text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                            Início
                                        </span>
                                        <span className="text-sm font-semibold italic">
                                            {new Date(
                                                selectedCurso.data_inicio,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                                        <Calendar className="mb-2 h-4 w-4 text-orange-500" />
                                        <span className="block text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                            Fim previsto
                                        </span>
                                        <span className="text-sm font-semibold italic">
                                            {new Date(
                                                selectedCurso.data_fim,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal de Exclusão */}
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
                            className="relative z-10 w-full max-w-sm rounded-2xl border bg-white p-6 shadow-xl"
                        >
                            <h2 className="text-xl font-bold">
                                Excluir Curso?
                            </h2>
                            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="mb-2 font-bold text-destructive">
                                    Ação Irreversível!
                                </AlertTitle>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Tens certeza que desejas remover o curso{' '}
                                    <br /> <b>{selectedCurso?.nome}</b>?
                                </p>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDeleteOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={destroy}
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
