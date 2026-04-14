import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Eye,
    ListFilter,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import clsx from 'clsx';
import { AlertTitle } from '@/components/ui/alert';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cursos', href: '/cursos' }];

export default function CursoIndex({ cursos = [], search = '' }: any) {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedCurso, setSelectedCurso] = useState<any>(
        cursos?.data[0] || null,
    );
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        sigla: '',
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
            onSuccess: () => setEditOpen(false),
        });
    }

    function destroy() {
        router.delete(`/cursos/${selectedCurso?.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    // Pesquisa simples - pode ser aprimorada para debounce, etc.
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
            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={() => {
                                reset();
                                setOpen(true);
                            }}
                        >
                            <PlusCircle className="h-4 w-4" /> Adicionar Curso
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar curso..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />

                        {query ? (
                            <Button
                                variant="secondary"
                                onClick={() => router.get('/cursos')}
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

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b text-left">
                                <th className="p-3">Nome do Curso</th>
                                {/* <th className="p-3">Sigla</th> */}
                                <th className="p-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Nenhum curso encontrado.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {cursos.data.map(
                                        (curso: any, index: number) => (
                                            <motion.tr
                                                key={curso.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.03,
                                                }}
                                                className="border-b hover:bg-muted/30"
                                            >
                                                <td className="p-3 font-medium">
                                                    {curso.nome}
                                                </td>
                                                {/* <td className="p-3 uppercase">
                                                {curso.sigla || '---'}
                                            </td> */}
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            // variant="outline"
                                                            className="border-none bg-yellow-500 hover:bg-yellow-600"
                                                            onClick={() => {
                                                                setSelectedCurso(
                                                                    curso,
                                                                );
                                                                setData({
                                                                    nome: curso.nome,
                                                                    sigla:
                                                                        curso.sigla ||
                                                                        '',
                                                                });
                                                                setEditOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            // variant="destructive"
                                                            className="border-none bg-rose-500 hover:bg-rose-600"
                                                            onClick={() => {
                                                                setSelectedCurso(
                                                                    curso,
                                                                );
                                                                setDeleteOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ),
                                    )}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sheet para Criar/Editar (Exemplo simplificado) */}
            <Sheet
                open={open || editOpen}
                onOpenChange={(val) =>
                    val ? null : (setOpen(false), setEditOpen(false))
                }
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle>
                            {editOpen ? 'Editar Curso' : 'Novo Curso'}
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações do curso.
                        </p>
                    </div>

                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="curso-form"
                            onSubmit={editOpen ? update : submit}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <Label>Nome</Label>
                                <Input
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
                                form="curso-form"
                                disabled={processing}
                            >
                                {processing ? 'Salvando...' : 'Salvar'}
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
                                Tem certeza que deseja excluir o curso{' '}
                                <strong className="text-center">
                                    {selectedCurso?.nome}?
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
