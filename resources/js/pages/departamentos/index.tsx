import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Edit,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    MoreVertical,
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

    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
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
        post(`/departamentos/${selectedDept?.id}`, {
            method: 'put',
            onSuccess: () => setEditOpen(false),
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
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        Departamento
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <Input
                                placeholder="Pesquisar..."
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
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
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

                {/* Mobile First List (Cards) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {departamentos.data.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-muted-foreground">
                            Nenhum departamento encontrado.
                        </div>
                    ) : (
                        departamentos.data.map((dept: any, index: number) => (
                            <motion.div
                                key={dept.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        ID: #{dept.id}
                                    </span>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {dept.nome}
                                    </h3>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                                        onClick={() => {
                                            setSelectedDept(dept);
                                            setData('nome', dept.nome);
                                            setEditOpen(true);
                                        }}
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            setSelectedDept(dept);
                                            setDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2Icon className="h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Create */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="sm:side-right h-[40vh] sm:h-full sm:max-w-md"
                >
                    <SheetTitle className="mb-4">Novo Departamento</SheetTitle>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Departamento</Label>
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
                <SheetContent
                    side="bottom"
                    className="sm:side-right h-[40vh] sm:h-full sm:max-w-md"
                >
                    <SheetTitle className="mb-4">
                        Editar Departamento
                    </SheetTitle>
                    <form onSubmit={update} className="space-y-4">
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
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            Actualizar
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold">
                            Excluir Departamento?
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Tens certeza que desejas remover o departamento{' '}
                            <strong>{selectedDept?.nome}</strong>? Esta ação é
                            permanente.
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                            <Button variant="destructive" onClick={destroy}>
                                Confirmar Exclusão
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    );
}
