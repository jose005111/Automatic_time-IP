import { Head, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, Edit, PlusCircle, Search, Trash2Icon, X } from 'lucide-react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tempos de Aula',
        href: '/tempos_aula',
    },
];

// Helper para formatar o turno baseado no padrão (0, 1, 2)
const getTurnoLabel = (turno: string | number) => {
    switch (turno.toString()) {
        case '0':
            return 'Manhã';
        case '1':
            return 'Tarde';
        case '2':
            return 'Noite';
        default:
            return 'Desconhecido';
    }
};

export default function TempoAulaIndex({
    tempos_aulas = { data: [] },
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedTempo, setSelectedTempo] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        hora_inicio: '',
        hora_fim: '',
        turno: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/tempos_aula', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        put(`/tempos_aula/${selectedTempo?.id}`, {
            onSuccess: () => setEditOpen(false),
        });
    }

    function destroy() {
        router.delete(`/tempos_aula/${selectedTempo?.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteOpen(false),
        });
    }

    function handleSearch() {
        router.get(
            '/tempos_aula',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    // Formata a hora vinda da BD (ex: "07:30:00" -> "07:30")
    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tempos de Aula" />

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
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tempo
                    </Button>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full">
                            <Input
                                placeholder="Pesquisar por hora (ex: 07:30)..."
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
                                        router.get('/tempos_aula');
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {tempos_aulas.data.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-muted-foreground">
                            Nenhum tempo de aula configurado.
                        </div>
                    ) : (
                        tempos_aulas.data.map((tempo: any, index: number) => (
                            <motion.div
                                key={tempo.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/50"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium tracking-wider text-primary uppercase">
                                        {getTurnoLabel(tempo.turno)}
                                    </span>
                                    <div className="flex items-center gap-2 text-foreground">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="text-xl font-bold tracking-tight">
                                            {formatTime(tempo.hora_inicio)} -{' '}
                                            {formatTime(tempo.hora_fim)}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 sm:flex-row">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                                        onClick={() => {
                                            setSelectedTempo(tempo);
                                            setData({
                                                hora_inicio: formatTime(
                                                    tempo.hora_inicio,
                                                ),
                                                hora_fim: formatTime(
                                                    tempo.hora_fim,
                                                ),
                                                turno: tempo.turno.toString(),
                                            });
                                            setEditOpen(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            setSelectedTempo(tempo);
                                            setDeleteOpen(true);
                                        }}
                                    >
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Criação / Edição (Reaproveitado visualmente) */}
            <Sheet
                open={open || editOpen}
                onOpenChange={(val) => {
                    setOpen(val);
                    setEditOpen(val);
                }}
            >
                <SheetContent
                    side="right"
                    className="flex h-full w-full flex-col p-0 sm:max-w-md"
                >
                    <div className="border-b px-6 py-4">
                        <SheetTitle className="text-lg font-semibold">
                            {editOpen
                                ? 'Editar Tempo de Aula'
                                : 'Novo Tempo de Aula'}
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                            Configure os blocos exatos de tempo usados na grade.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="tempo-form"
                            onSubmit={editOpen ? update : submit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="turno">Turno</Label>
                                <Select
                                    value={data.turno}
                                    onValueChange={(val) =>
                                        setData('turno', val)
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o turno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Manhã</SelectItem>
                                        <SelectItem value="1">Tarde</SelectItem>
                                        <SelectItem value="2">Noite</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.turno && (
                                    <p className="text-xs text-destructive">
                                        {errors.turno}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hora_inicio">
                                        Hora de Início
                                    </Label>
                                    <Input
                                        id="hora_inicio"
                                        type="time"
                                        value={data.hora_inicio}
                                        onChange={(e) =>
                                            setData(
                                                'hora_inicio',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {errors.hora_inicio && (
                                        <p className="text-xs text-destructive">
                                            {errors.hora_inicio}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hora_fim">
                                        Hora do Fim
                                    </Label>
                                    <Input
                                        id="hora_fim"
                                        type="time"
                                        value={data.hora_fim}
                                        onChange={(e) =>
                                            setData('hora_fim', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.hora_fim && (
                                        <p className="text-xs text-destructive">
                                            {errors.hora_fim}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    setEditOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="tempo-form"
                                disabled={processing}
                            >
                                {processing ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Modal de Exclusão */}
            {deleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl"
                    >
                        <h2 className="text-xl font-bold">
                            Excluir Tempo de Aula?
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Tem certeza que deseja remover o tempo{' '}
                            <strong className="text-foreground">
                                {formatTime(selectedTempo?.hora_inicio)} -{' '}
                                {formatTime(selectedTempo?.hora_fim)}
                            </strong>{' '}
                            do turno{' '}
                            <strong>
                                {getTurnoLabel(selectedTempo?.turno)}
                            </strong>
                            ? Esta ação é permanente e pode afetar as
                            disponibilidades.
                        </p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={destroy}>
                                Confirmar Exclusão
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AppLayout>
    );
}
