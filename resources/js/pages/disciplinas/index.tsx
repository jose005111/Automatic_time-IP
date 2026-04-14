import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BookOpen,
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Clock,
    UserCheck,
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
    { title: 'Disciplinas', href: '/disciplinas' },
];

export default function DisciplinaIndex({
    disciplinas = { data: [] },
    professores = [],
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedDisciplina, setSelectedDisciplina] = useState<any>(null);

    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nome: '',
        professor_ids: [] as string[], // Para o relacionamento pivô
    });

    function handleSearch() {
        router.get(
            '/disciplinas',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/disciplinas', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        put(`/disciplinas/${selectedDisciplina?.id}`, {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Disciplinas" />
            <div className="flex flex-col gap-4 rounded-xl bg-background p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        Disciplina
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar disciplina..."
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
                                    Nome da Disciplina
                                </th>

                                <th className="p-3 text-center font-medium">
                                    Professores
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {disciplinas.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma disciplina encontrada.
                                    </td>
                                </tr>
                            ) : (
                                disciplinas.data.map(
                                    (item: any, index: number) => (
                                        <motion.tr
                                            key={item.id}
                                            className="border-b hover:bg-muted/30"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <td className="p-3 font-medium">
                                                {item.nome}
                                            </td>

                                            <td className="p-3 text-center">
                                                <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                                                    {item.professores?.length ||
                                                        0}{' '}
                                                    vinculados
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedDisciplina(
                                                                item,
                                                            );
                                                            setViewOpen(true);
                                                        }}
                                                        className="border-none bg-cyan-500 hover:bg-cyan-600"
                                                    >
                                                        <Eye className="h-4 w-4 text-background" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        className="border-none bg-yellow-500 hover:bg-yellow-600"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedDisciplina(
                                                                item,
                                                            );
                                                            setData({
                                                                nome: item.nome,
                                                                professor_ids:
                                                                    item.professores?.map(
                                                                        (
                                                                            p: any,
                                                                        ) =>
                                                                            p.id,
                                                                    ) || [],
                                                            });
                                                            setEditOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 text-background" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        className="border-none bg-rose-500 hover:bg-rose-600"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setSelectedDisciplina(
                                                                item,
                                                            );
                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2Icon className="h-4 w-4 text-background" />
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
                {disciplinas.data.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
                        {/* Informação */}
                        <div className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-medium">
                                {disciplinas.from}
                            </span>{' '}
                            a{' '}
                            <span className="font-medium">
                                {disciplinas.to}
                            </span>{' '}
                            de{' '}
                            <span className="font-medium">
                                {disciplinas.total}
                            </span>{' '}
                            registros
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center gap-1">
                            {disciplinas.links.map(
                                (link: any, index: number) => (
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
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Cadastro (Create) */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    {/* HEADER */}
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="mb-6 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" /> Nova Disciplina
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações da disciplina.
                        </p>
                    </div>
                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="disciplina-form"
                            onSubmit={submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome da Disciplina</Label>
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
                                form="disciplina-form"
                                disabled={processing}
                            >
                                {processing ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal de Visualização (Detail) */}
            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    {/* HEADER */}
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            Detalhes da Disciplina
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Informações detalhadas da disciplina.
                        </p>
                    </div>
                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {selectedDisciplina && (
                            <div className="mt-6 space-y-6">
                                <div className="rounded-lg bg-muted p-4">
                                    <h3 className="text-lg font-bold">
                                        {selectedDisciplina.nome}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />{' '}
                                        Professores Habilitados
                                    </Label>
                                    <div className="space-y-2">
                                        {selectedDisciplina.professores
                                            ?.length > 0 ? (
                                            selectedDisciplina.professores.map(
                                                (prof: any) => (
                                                    <div
                                                        key={prof.id}
                                                        className="flex items-center justify-between rounded border p-2 text-sm"
                                                    >
                                                        <span>{prof.nome}</span>
                                                        <span className="text-xs text-muted-foreground uppercase">
                                                            {prof.especialidade}
                                                        </span>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                Nenhum professor vinculado.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal de Edição */}
            <Sheet
                open={editOpen}
                onOpenChange={(val) => {
                    setEditOpen(val);
                    if (!val) reset();
                }}
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Edit className="h-4 w-4" /> Editar Disciplina
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Atualize os dados da disciplina e seus vínculos.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="edit-disciplina-form"
                            onSubmit={update}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="edit-nome">Nome</Label>
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
                        </form>
                    </div>

                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setEditOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="edit-disciplina-form"
                                disabled={processing}
                            >
                                {processing ? 'Atualizando...' : 'Atualizar'}
                            </Button>
                        </div>
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
                            className="relative z-10 w-full max-w-md rounded-xl bg-background p-6 shadow-lg"
                        >
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                Confirmar Exclusão
                            </h2>

                            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="mb-2 font-bold text-destructive">
                                    Atenção!
                                </AlertTitle>
                                <p className="text-sm text-muted-foreground">
                                    Tem certeza que deseja excluir a disciplina:{' '}
                                    <br />
                                    <strong className="text-foreground">
                                        {selectedDisciplina?.nome}
                                    </strong>
                                    ?
                                    <br />
                                    <br />
                                    Isso removerá os vínculos com professores e
                                    horários já gerados.
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
                                    onClick={() => {
                                        router.delete(
                                            `/disciplinas/${selectedDisciplina.id}`,
                                            {
                                                onSuccess: () =>
                                                    setDeleteOpen(false),
                                            },
                                        );
                                    }}
                                    className="bg-rose-600 text-white hover:bg-rose-700"
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
