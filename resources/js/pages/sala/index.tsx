import { Head, useForm, router } from '@inertiajs/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    DoorOpen,
    LayoutGrid,
    Users,
    Save,
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Salas', href: '/salas' }];

export default function SalaIndex({ salas = { data: [] }, search = '' }: any) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedSala, setSelectedSala] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        bloco: '',
        numero: '',
        capacidade: '',
        tipo: '',
        estado: '1',
    });

    // Função para abrir o modal (seja para criar ou editar)
    const openSheet = (sala: any = null) => {
        if (sala) {
            setSelectedSala(sala);
            setData({
                bloco: sala.bloco.toString(),
                numero: sala.numero.toString(),
                capacidade: sala.capacidade.toString(),
                tipo: sala.tipo, // deve bater com 'teórica' ou 'laboratório'
                estado: sala.estado.toString(),
            });
        } else {
            setSelectedSala(null);
            reset();
        }
        setSheetOpen(true);
    };

    function handleSearch() {
        router.get(
            '/salas',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedSala) {
            put(`/salas/${selectedSala.id}`, {
                onSuccess: () => {
                    setSheetOpen(false);
                    reset();
                },
            });
        } else {
            post('/salas', {
                onSuccess: () => {
                    setSheetOpen(false);
                    reset();
                },
            });
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de Salas" />

            <div className="flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between">
                    <Button onClick={() => openSheet()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Nova Sala
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar sala ou bloco..."
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
                        <thead className="bg-muted/50 text-left">
                            <tr className="border-b">
                                <th className="p-3 font-medium">Bloco</th>
                                <th className="p-3 font-medium">Número</th>
                                <th className="p-3 text-center font-medium">
                                    Tipo
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Capacidade
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Estado
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {salas.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="p-6 text-center text-muted-foreground italic"
                                    >
                                        Nenhuma sala encontrada.
                                    </td>
                                </tr>
                            ) : (
                                salas.data.map((item: any, index: number) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="border-b transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 font-medium text-blue-600">
                                            Bloco {item.bloco}
                                        </td>
                                        <td className="p-3 font-bold">
                                            {item.numero}
                                        </td>
                                        <td className="p-3 text-center capitalize italic">
                                            {item.tipo}
                                        </td>
                                        <td className="p-3 text-center">
                                            {item.capacidade} lug.
                                        </td>
                                        <td className="p-3 text-center">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                                    item.estado == 1
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-rose-100 text-rose-700',
                                                )}
                                            >
                                                {item.estado == 1
                                                    ? 'Disponível'
                                                    : 'Manutenção'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-cyan-500 text-white hover:bg-cyan-600"
                                                    onClick={() => {
                                                        setSelectedSala(item);
                                                        setViewOpen(true);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-yellow-500 text-white hover:bg-yellow-600"
                                                    onClick={() =>
                                                        openSheet(item)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-rose-500 text-white hover:bg-rose-600"
                                                    onClick={() => {
                                                        setSelectedSala(item);
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

            {/* Modal Unificado: Criar e Editar */}
            <Sheet
                open={sheetOpen}
                onOpenChange={(val) => {
                    setSheetOpen(val);
                    if (!val) reset();
                }}
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight uppercase">
                            {selectedSala ? (
                                <Edit className="h-5 w-5" />
                            ) : (
                                <PlusCircle className="h-5 w-5" />
                            )}
                            {selectedSala
                                ? `Editar Sala ${selectedSala.numero}`
                                : 'Nova Sala'}
                        </SheetTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {selectedSala
                                ? 'Atualize os dados desta sala.'
                                : 'Preencha os dados para registar a sala.'}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="sala-form-unified"
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bloco">Bloco (Nº)</Label>
                                    <Input
                                        id="bloco"
                                        type="number"
                                        value={data.bloco}
                                        onChange={(e) =>
                                            setData('bloco', e.target.value)
                                        }
                                        placeholder="Ex: 1"
                                        required
                                    />
                                    {errors.bloco && (
                                        <p className="text-xs text-destructive">
                                            {errors.bloco}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numero">Número Sala</Label>
                                    <Input
                                        id="numero"
                                        type="number"
                                        value={data.numero}
                                        onChange={(e) =>
                                            setData('numero', e.target.value)
                                        }
                                        placeholder="Ex: 101"
                                        required
                                    />
                                    {errors.numero && (
                                        <p className="text-xs text-destructive">
                                            {errors.numero}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Sala</Label>
                                <Select
                                    value={data.tipo}
                                    onValueChange={(val) =>
                                        setData('tipo', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="teórica">
                                            Teórica
                                        </SelectItem>
                                        <SelectItem value="laboratório">
                                            Laboratório
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.tipo && (
                                    <p className="text-xs text-destructive">
                                        {errors.tipo}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacidade">Lotação</Label>
                                    <Input
                                        id="capacidade"
                                        type="number"
                                        value={data.capacidade}
                                        onChange={(e) =>
                                            setData(
                                                'capacidade',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select
                                        value={data.estado}
                                        onValueChange={(val) =>
                                            setData('estado', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                Disponível
                                            </SelectItem>
                                            <SelectItem value="0">
                                                Manutenção
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer Fixo */}
                    <div className="border-t bg-muted/20 px-6 py-4">
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setSheetOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="sala-form-unified"
                                disabled={processing}
                            >
                                {processing
                                    ? 'Processando...'
                                    : selectedSala
                                      ? 'Salvar Alterações'
                                      : 'Criar Sala'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal Detalhes (View) */}
            <Sheet open={viewOpen} onOpenChange={setViewOpen}>
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col border-l bg-background p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-bold tracking-widest text-primary uppercase">
                            Detalhes Técnicos
                        </SheetTitle>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-10 text-center">
                        {selectedSala && (
                            <div className="space-y-8">
                                <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-black text-primary">
                                    {selectedSala.numero}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold italic">
                                        Bloco {selectedSala.bloco}
                                    </h3>
                                    <p className="text-sm tracking-tighter text-muted-foreground uppercase">
                                        Localização Física
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                        <LayoutGrid className="mx-auto mb-2 h-5 w-5 text-blue-500" />
                                        <p className="text-xs font-bold text-muted-foreground uppercase">
                                            Tipo
                                        </p>
                                        <p className="font-semibold capitalize">
                                            {selectedSala.tipo}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border bg-card p-4 shadow-sm">
                                        <Users className="mx-auto mb-2 h-5 w-5 text-orange-500" />
                                        <p className="text-xs font-bold text-muted-foreground uppercase">
                                            Lotação
                                        </p>
                                        <p className="font-semibold">
                                            {selectedSala.capacidade} Alunos
                                        </p>
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
                            className="relative z-10 w-full max-w-sm rounded-2xl border bg-background p-6 shadow-2xl"
                        >
                            <h2 className="text-xl font-bold">
                                Eliminar Sala?
                            </h2>
                            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="mb-1 font-bold text-destructive italic">
                                    Atenção!
                                </AlertTitle>
                                <p className="text-sm text-muted-foreground">
                                    Remover a sala <b>{selectedSala?.numero}</b>{' '}
                                    do <b>Bloco {selectedSala?.bloco}</b> é uma
                                    ação definitiva.
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
                                    onClick={() =>
                                        router.delete(
                                            `/salas/${selectedSala.id}`,
                                            {
                                                onSuccess: () =>
                                                    setDeleteOpen(false),
                                            },
                                        )
                                    }
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
