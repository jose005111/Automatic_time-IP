import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Edit,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Building2, // Novo ícone para representar departamento
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departamentos',
        href: '/departamentos',
    },
];

export default function DepartamentoIndex({
    departamentos = { data: [] },
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    // ATUALIZADO: Incluído o campo 'sigla'
    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
        sigla: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/departamentos', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        // Usamos post com _method put para suportar envio de ficheiros se necessário no futuro,
        // ou podes usar router.put direto.
        router.put(`/departamentos/${selectedDept?.id}`, data, {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    }

    function destroy() {
        router.delete(`/departamentos/${selectedDept?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    }

    function handleSearch() {
        router.get(
            '/departamentos',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departamentos" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-center sm:flex-row sm:items-center sm:justify-between md:text-left">
                        <Button
                            onClick={() => {
                                reset();
                                setOpen(true);
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                            Departamento
                        </Button>
                    </div>

                    <div className="flex max-w-md items-center gap-2">
                        <div className="relative w-full">
                            <Input
                                placeholder="Pesquisar por nome ou sigla..."
                                className="pr-10"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('');
                                        router.get('/departamentos');
                                    }}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSearch}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {departamentos.data.length === 0 ? (
                        <div className="col-span-full rounded-xl border-2 border-dashed py-10 text-center text-muted-foreground">
                            Nenhum departamento encontrado.
                        </div>
                    ) : (
                        departamentos.data.map((dept: any, index: number) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-blue-500/50 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                <Building2 className="h-4 w-4" />
                                            </span>
                                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                                #{dept.id}
                                            </span>
                                        </div>
                                        <h3 className="mt-2 text-lg leading-tight font-bold text-foreground">
                                            {dept.nome}
                                        </h3>
                                        {/* EXIBIÇÃO DA SIGLA */}
                                        <div className="mt-1">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 uppercase">
                                                {dept.sigla || 'S/S'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-yellow-600 hover:bg-yellow-50"
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setData({
                                                    nome: dept.nome,
                                                    sigla: dept.sigla || '',
                                                });
                                                setEditOpen(true);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2Icon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Create */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-full p-4 sm:max-w-md">
                    <SheetTitle className="border-b pb-4 text-xl font-bold">
                        Novo Departamento
                    </SheetTitle>
                    <form onSubmit={submit} className="mt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">
                                    Nome do Departamento
                                </Label>
                                <Input
                                    id="nome"
                                    value={data.nome}
                                    onChange={(e) =>
                                        setData('nome', e.target.value)
                                    }
                                    placeholder="Ex: Engenharia Informática"
                                    required
                                />
                                {errors.nome && (
                                    <p className="text-xs text-destructive">
                                        {errors.nome}
                                    </p>
                                )}
                            </div>

                            {/* NOVO CAMPO SIGLA */}
                            <div className="space-y-2">
                                <Label htmlFor="sigla">Sigla / Acrónimo</Label>
                                <Input
                                    id="sigla"
                                    value={data.sigla}
                                    onChange={(e) =>
                                        setData(
                                            'sigla',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Ex: DEI"
                                    maxLength={10}
                                />
                                {errors.sigla && (
                                    <p className="text-xs text-destructive">
                                        {errors.sigla}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing ? 'Salvando...' : 'Salvar Departamento'}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Modal Edit */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent side="right" className="w-full p-4 sm:max-w-md">
                    <SheetTitle className="border-b pb-4 text-xl font-bold">
                        Editar Departamento
                    </SheetTitle>
                    <form onSubmit={update} className="mt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_nome">Nome</Label>
                                <Input
                                    id="edit_nome"
                                    value={data.nome}
                                    onChange={(e) =>
                                        setData('nome', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* NOVO CAMPO SIGLA NO EDIT */}
                            <div className="space-y-2">
                                <Label htmlFor="edit_sigla">Sigla</Label>
                                <Input
                                    id="edit_sigla"
                                    value={data.sigla}
                                    onChange={(e) =>
                                        setData(
                                            'sigla',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="Ex: DEI"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            Actualizar Dados
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation (Modernizado) */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <Trash2Icon className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Excluir Departamento?
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            Tens certeza que desejas remover{' '}
                            <strong>{selectedDept?.nome}</strong>? Todos os
                            cursos e professores vinculados poderão ser
                            afetados.
                        </p>
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
                                Sim, Excluir
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    );
}
