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
        title: 'Salas',
        href: '/sala',
    },
];

export default function SalaIndex({ salas = [], search = '' }: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedSala, setSelectedSala] = useState<any>(
        salas.data[0] || null,
    );

    const [query, setQuery] = useState(search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        id: '',
        designacao: '',
        estado: '',
        numero: '',
        capacidade: '',
        escola_id: '',
    });

    //Metodos CRUD - podem ser aprimorados para tratar erros, loading, etc.
    function submit(e: React.FormEvent) {
        e.preventDefault();
        console.log(data);
        post('/salas', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();

        post(`/salas/${selectedSala?.id}`, {
            method: 'put',
            onSuccess: () => {
                setEditOpen(false);
            },
        });
    }

    function destroy() {
        router.delete(`/salas/${selectedSala?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    }

    // Pesquisa simples - pode ser aprimorada para debounce, etc.
    function handleSearch() {
        router.get(
            '/salas',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="salas" />
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
                                onClick={() => router.get('/salas')}
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
                                <th className="p-3">Número</th>
                                <th className="p-3">Capacidade</th>
                                <th className="p-3">estado</th>
                                <th className="p-3 text-center">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salas.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma sala encontrada.
                                    </td>
                                </tr>
                            ) : (
                                salas.data.map((Sala: any, index: number) => (
                                    // <tr key={Sala.id} className="border-b">
                                    <motion.tr
                                        key={Sala.id}
                                        className="border-b"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }} // Efeito cascata subtil
                                    >
                                        <td className="p-3">{Sala.numero}</td>

                                        <td className="p-3">
                                            {Sala.capacidade}
                                        </td>
                                        <td className="p-3">
                                            {Sala.estado === 1 ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                    Disponível
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                    Indisponível
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSala(Sala);
                                                        setViewOpen(true);
                                                    }}
                                                    className="border-none bg-cyan-500 hover:bg-cyan-600"
                                                >
                                                    <Eye className="h-4 w-4 text-background" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedSala(Sala);
                                                        setData({
                                                            designacao:
                                                                Sala.designacao,
                                                            estado: Sala.estado,
                                                            numero: Sala.numero,
                                                            capacidade:
                                                                Sala.capacidade,
                                                            escola_id:
                                                                Sala.escola_id,
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
                                                        setSelectedSala(Sala);
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
                {salas.data.length > 0 && (
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
                        {/* Informação */}
                        <div className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-medium">{salas.from}</span> a{' '}
                            <span className="font-medium">{salas.to}</span> de{' '}
                            <span className="font-medium">{salas.total}</span>{' '}
                            registros
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center gap-1">
                            {salas.links.map((link: any, index: number) => (
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
                            Nova Sala
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações da Sala
                        </p>
                    </div>

                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="Sala-form"
                            onSubmit={submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="designacao">Designação</Label>
                                <Input
                                    id="designacao"
                                    value={data.designacao}
                                    onChange={(e) =>
                                        setData('designacao', e.target.value)
                                    }
                                    required
                                />
                                {errors.designacao && (
                                    <p className="text-xs text-destructive">
                                        {errors.designacao}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select
                                    value={data.estado.toString()}
                                    onValueChange={(value: string) =>
                                        setData('estado', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estado da sala" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            Disponível
                                        </SelectItem>
                                        <SelectItem value={'0'}>
                                            Indisponível
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.estado && (
                                    <p className="text-xs text-destructive">
                                        {errors.estado}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input
                                    id="numero"
                                    value={data.numero}
                                    onChange={(e) =>
                                        setData('numero', e.target.value)
                                    }
                                    required
                                />
                                {errors.numero && (
                                    <p className="text-xs text-destructive">
                                        {errors.numero}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacidade">Capacidade</Label>
                                <Input
                                    id="capacidade"
                                    value={data.capacidade}
                                    onChange={(e) =>
                                        setData('capacidade', e.target.value)
                                    }
                                    required
                                />
                                {errors.capacidade && (
                                    <p className="text-xs text-destructive">
                                        {errors.capacidade}
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
                                form="Sala-form"
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
                            Detalhes da Sala
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Informações detalhadas da Sala.
                        </p>
                    </div>
                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {selectedSala ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4"></div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Designação
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedSala.designacao}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Número
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedSala.numero}
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Capacidade
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedSala.capacidade} Estudantes
                                    </label>
                                </div>
                                <div className="flex items-center justify-between space-y-2">
                                    <label className="font-bold text-foreground">
                                        Estado
                                    </label>
                                    <label className="font-bold text-foreground">
                                        {selectedSala.estado === 1 ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                Disponível
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                Indisponível
                                            </span>
                                        )}
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground">
                                Nenhuma Sala selecionada.
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
                            Actualizar Sala
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Preencha as informações da sala.
                        </p>
                    </div>

                    {/* BODY (scrollável) */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="Sala-form"
                            onSubmit={update}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="designacao">Designação</Label>
                                <Input
                                    id="designacao"
                                    value={data.designacao}
                                    onChange={(e) =>
                                        setData('designacao', e.target.value)
                                    }
                                    required
                                />
                                {errors.designacao && (
                                    <p className="text-xs text-destructive">
                                        {errors.designacao}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select
                                    value={data.estado?.toString()}
                                    onValueChange={(value: string) =>
                                        setData('estado', value)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estado da sala" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value={'1'}>
                                            Disponível
                                        </SelectItem>
                                        <SelectItem value={'0'}>
                                            Indisponível
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.estado && (
                                    <p className="text-xs text-destructive">
                                        {errors.estado}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input
                                    id="numero"
                                    value={data.numero}
                                    onChange={(e) =>
                                        setData('numero', e.target.value)
                                    }
                                    required
                                />
                                {errors.numero && (
                                    <p className="text-xs text-destructive">
                                        {errors.numero}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacidade">Capacidade</Label>
                                <Input
                                    id="capacidade"
                                    value={data.capacidade}
                                    onChange={(e) =>
                                        setData('capacidade', e.target.value)
                                    }
                                    required
                                />
                                {errors.capacidade && (
                                    <p className="text-xs text-destructive">
                                        {errors.capacidade}
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
                                form="Sala-form"
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
                                Tem certeza que deseja excluir a sala{' '}
                                <strong className="text-center">
                                    {selectedSala?.numero}
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
