import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Edit,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import clsx from 'clsx';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Anos de Frequência', href: '/anos' },
];

export default function AnoIndex({ anos = { data: [] }, search = '' }: any) {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedAno, setSelectedAno] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        ano: '',
        estado: '1',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/anos', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    const onEdit = (ano: any) => {
        setSelectedAno(ano);
        setData({ ano: ano.ano.toString(), estado: ano.estado.toString() });
        setEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/anos/${selectedAno.id}`, { onSuccess: () => setEditOpen(false) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anos de Frequência" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header & Busca */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Ano
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <Input
                                placeholder="Filtrar ano..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    router.get('/anos', { search: query })
                                }
                            />
                            {query && (
                                <X
                                    className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground"
                                    onClick={() => {
                                        setQuery('');
                                        router.get('/anos');
                                    }}
                                />
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                router.get('/anos', { search: query })
                            }
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Listagem em Cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {anos.data.map((item: any, index: number) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <span
                                    className={clsx(
                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                        item.estado === 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600',
                                    )}
                                >
                                    {item.estado === 1 ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-2xl font-bold tracking-tight">
                                    {item.ano}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Ano Académico
                                </p>
                            </div>

                            <div className="mt-6 flex gap-2 border-t pt-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => {
                                        setSelectedAno(item);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Trash2Icon className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Sheet Criar/Editar (Responsive) */}
            <Sheet
                open={open || editOpen}
                onOpenChange={(val) => {
                    setOpen(val);
                    setEditOpen(val);
                }}
            >
                <SheetContent
                    side="bottom"
                    className="sm:side-right h-[50vh] sm:h-full sm:max-w-md"
                >
                    <SheetTitle>
                        {editOpen ? 'Editar Ano' : 'Novo Ano'}
                    </SheetTitle>
                    <form
                        onSubmit={editOpen ? handleUpdate : submit}
                        className="mt-6 space-y-6"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="ano">Ano</Label>
                            <Input
                                id="ano"
                                type="number"
                                value={Number(data.ano)}
                                onChange={(e) => setData('ano', e.target.value)}
                                placeholder="Digite o ano"
                            />
                            {errors.ano && (
                                <p className="text-xs text-destructive">
                                    {errors.ano}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Estado do Ano</Label>
                            <Select
                                value={data.estado}
                                onValueChange={(val) => setData('estado', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Ativo</SelectItem>
                                    <SelectItem value="0">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing}
                        >
                            {editOpen ? 'Atualizar Ano' : 'Criar Ano Letivo'}
                        </Button>
                    </form>
                </SheetContent>
            </Sheet>

            {/* Confirmação de Exclusão (Bottom Drawer para Mobile) */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
                    <motion.div
                        initial={{ y: 50 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold">Remover Ano?</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Tens certeza que desejas apagar o ano{' '}
                            <strong>{selectedAno?.ano}</strong>?
                        </p>
                        <div className="mt-6 flex flex-col gap-2">
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    router.delete(`/anos/${selectedAno.id}`, {
                                        onSuccess: () => setDeleteOpen(false),
                                    })
                                }
                            >
                                Sim, Remover
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
