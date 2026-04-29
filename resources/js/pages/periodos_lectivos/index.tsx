import { Head, useForm, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit,
    Eye,
    PlusCircle,
    Search,
    Trash2Icon,
    X,
    Calendar,
    TrendingUp,
    AlertCircle,
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
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Períodos Lectivos', href: '/periodos_lectivos' },
];

const estadoColors = {
    activo: 'bg-green-100 text-green-800 border-green-200',
    inactivo: 'bg-gray-100 text-gray-800 border-gray-200',
    concluido: 'bg-blue-100 text-blue-800 border-blue-200',
};

const estadoLabels = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    concluido: 'Concluído',
};

export default function PeriodoLectivoIndex({
    periodos = { data: [] },
    search = '',
}: any) {
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState<any>(null);
    const [query, setQuery] = useState(search || '');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        ano: '',
        semestre: '',
        data_inicio: '',
        data_fim: '',
        estado: 'inactivo',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/periodos_lectivos', {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    }

    function update(e: React.FormEvent) {
        e.preventDefault();
        put(`/periodos_lectivos/${selectedPeriodo?.id}`, {
            onSuccess: () => {
                setEditOpen(false);
                reset();
            },
        });
    }

    function destroy() {
        router.delete(`/periodos_lectivos/${selectedPeriodo?.id}`, {
            onSuccess: () => setDeleteOpen(false),
        });
    }

    function handleSearch() {
        router.get(
            '/periodos_lectivos',
            { search: query },
            { preserveState: true, replace: true },
        );
    }

    function getSemestreLabel(semestre: number) {
        return semestre === 1 ? '1º Semestre' : '2º Semestre';
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Períodos Lectivos" />

            <div className="flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        onClick={() => {
                            reset();
                            setOpen(true);
                        }}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                        Período Lectivo
                    </Button>
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Pesquisar por ano ou semestre..."
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
                                <th className="p-3 font-medium">Ano Lectivo</th>
                                <th className="p-3 text-center font-medium">
                                    Semestre
                                </th>
                                <th className="p-3 text-center font-medium">
                                    Vigência
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
                            {periodos.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-muted-foreground italic"
                                    >
                                        Nenhum período lectivo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                periodos.data.map(
                                    (periodo: any, index: number) => (
                                        <motion.tr
                                            key={periodo.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-3 font-bold text-slate-800">
                                                {periodo.ano}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset">
                                                    {getSemestreLabel(
                                                        periodo.semestre,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center text-xs text-muted-foreground">
                                                {new Date(
                                                    periodo.data_inicio,
                                                ).toLocaleDateString()}{' '}
                                                -{' '}
                                                {new Date(
                                                    periodo.data_fim,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Badge
                                                    className={
                                                        estadoColors[
                                                            periodo.estado as keyof typeof estadoColors
                                                        ]
                                                    }
                                                >
                                                    {
                                                        estadoLabels[
                                                            periodo.estado as keyof typeof estadoLabels
                                                        ]
                                                    }
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 bg-cyan-500 text-white hover:bg-cyan-600"
                                                        onClick={() => {
                                                            setSelectedPeriodo(
                                                                periodo,
                                                            );
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
                                                            setSelectedPeriodo(
                                                                periodo,
                                                            );
                                                            setData({
                                                                ano: periodo.ano,
                                                                semestre:
                                                                    periodo.semestre.toString(),
                                                                data_inicio:
                                                                    periodo.data_inicio,
                                                                data_fim:
                                                                    periodo.data_fim,
                                                                estado: periodo.estado,
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
                                                            setSelectedPeriodo(
                                                                periodo,
                                                            );
                                                            setDeleteOpen(true);
                                                        }}
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
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
                            <Calendar className="h-5 w-5 text-primary" />
                            {editOpen
                                ? 'Editar Período Lectivo'
                                : 'Novo Período Lectivo'}
                        </SheetTitle>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <form
                            id="periodo-form"
                            onSubmit={editOpen ? update : submit}
                            className="space-y-5"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ano">Ano Lectivo</Label>
                                    <Input
                                        id="ano"
                                        type="number"
                                        placeholder="2024"
                                        value={data.ano}
                                        onChange={(e) =>
                                            setData('ano', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.ano && (
                                        <p className="text-xs text-destructive">
                                            {errors.ano}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semestre">Semestre</Label>
                                    <Select
                                        value={data.semestre}
                                        onValueChange={(val) =>
                                            setData('semestre', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o semestre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                1º Semestre
                                            </SelectItem>
                                            <SelectItem value="2">
                                                2º Semestre
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.semestre && (
                                        <p className="text-xs text-destructive">
                                            {errors.semestre}
                                        </p>
                                    )}
                                </div>
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
                                    {errors.data_inicio && (
                                        <p className="text-xs text-destructive">
                                            {errors.data_inicio}
                                        </p>
                                    )}
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
                                    {errors.data_fim && (
                                        <p className="text-xs text-destructive">
                                            {errors.data_fim}
                                        </p>
                                    )}
                                </div>
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
                                        <SelectValue placeholder="Selecione o estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="activo">
                                            Activo
                                        </SelectItem>
                                        <SelectItem value="inactivo">
                                            Inactivo
                                        </SelectItem>
                                        <SelectItem value="concluido">
                                            Concluído
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.estado && (
                                    <p className="text-xs text-destructive">
                                        {errors.estado}
                                    </p>
                                )}
                            </div>

                            {data.estado === 'activo' && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-sm text-blue-800">
                                        Apenas um período lectivo pode estar
                                        activo por vez.
                                    </AlertTitle>
                                </Alert>
                            )}
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
                                form="periodo-form"
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
                            Detalhes do Período Lectivo
                        </SheetTitle>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        {selectedPeriodo && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-2xl leading-tight font-black text-primary">
                                        {selectedPeriodo.ano}
                                    </h3>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge
                                            className={
                                                estadoColors[
                                                    selectedPeriodo.estado as keyof typeof estadoColors
                                                ]
                                            }
                                        >
                                            {
                                                estadoLabels[
                                                    selectedPeriodo.estado as keyof typeof estadoLabels
                                                ]
                                            }
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-purple-50"
                                        >
                                            {getSemestreLabel(
                                                selectedPeriodo.semestre,
                                            )}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-slate-500 italic">
                                        <Calendar className="h-4 w-4" /> Período
                                        de Duração
                                    </Label>
                                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                    Início
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    {new Date(
                                                        selectedPeriodo.data_inicio,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <span className="block text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                    Fim
                                                </span>
                                                <span className="text-sm font-semibold">
                                                    {new Date(
                                                        selectedPeriodo.data_fim,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedPeriodo.turmas &&
                                    selectedPeriodo.turmas.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-500 italic">
                                                Turmas Associadas
                                            </Label>
                                            <div className="rounded-xl border bg-muted/30 p-4">
                                                <p className="text-sm text-muted-foreground">
                                                    Este período lectivo possui{' '}
                                                    {
                                                        selectedPeriodo.turmas
                                                            .length
                                                    }{' '}
                                                    turma(s) associada(s).
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
                                Excluir Período Lectivo?
                            </h2>
                            <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-center">
                                <AlertTitle className="mb-2 font-bold text-destructive">
                                    Ação Irreversível!
                                </AlertTitle>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Tens certeza que desejas remover o período
                                    lectivo <br />{' '}
                                    <b>
                                        {selectedPeriodo?.ano} -{' '}
                                        {selectedPeriodo?.semestre}º Semestre
                                    </b>
                                    ?
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
