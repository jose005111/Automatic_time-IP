import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import { useAppDialog } from '@/components/app-dialog-provider';
import AppLayout from '@/layouts/app-layout';
import { NOME_SISTEMA } from '@/lib/sistema';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import MunicipeBox from '@/components/component/MunicipeBox';

interface Municipe {
    id: number;
    nome_completo: string;
    bi_numero?: string;
}

interface Recrutamento {
    id: number;
    data_recruta: string;
    estado: number;
    observacoes?: string;
    municipe: {
        id: number;
        nome_completo: string;
        bi_numero?: string;
        municipioNaturalidade?: {
            nome: string;
        };
    };
    transferencia?: any;
}

interface Filters {
    search?: string;
    estado?: string;
    mes?: string;
    ano?: string;
}

interface Props {
    recrutamentos: {
        data: Recrutamento[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    municipes: Municipe[];
    filters: Filters;
    estatisticas: {
        pendentes: number;
        aprovados: number;
        total_mes_atual: number;
    };
}

const formSchema = z.object({
    id_municipe: z.coerce.number().min(1, 'Munícipe é obrigatório'),
    data_recruta: z.string().min(1, 'Data é obrigatória'),
    observacoes: z.string().optional(),
    estado: z.coerce.number().min(0).max(2),
});

export default function RecrutamentosIndex({
    recrutamentos,
    municipes,
    filters: initialFilters,
    estatisticas,
}: Props) {
    const { confirm } = useAppDialog();
    const { props } = usePage();
    const currentFilters = props.filters || initialFilters || {};

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRecrutamento, setSelectedRecrutamento] =
        useState<Recrutamento | null>(null);

    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const [estadoFilter, setEstadoFilter] = useState(
        currentFilters.estado || '',
    );
    const [mesFilter, setMesFilter] = useState(currentFilters.mes || '');
    const [anoFilter, setAnoFilter] = useState(currentFilters.ano || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Recrutamentos', href: '/recrutamentos' },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_municipe: undefined,
            data_recruta: new Date().toISOString().split('T')[0],
            observacoes: '',
            estado: 0,
        },
    });

    const applyFilters = (newFilters: Partial<Filters>) => {
        const params: any = { ...currentFilters, ...newFilters };
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });
        router.get('/recrutamentos', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        applyFilters({ search: value });
    };

    const handleEstadoChange = (value: string) => {
        const newValue = value === 'all' ? '' : value;
        setEstadoFilter(newValue);
        applyFilters({ estado: newValue });
    };

    const handleMesChange = (value: string) => {
        const newValue = value === 'all' ? '' : value;
        setMesFilter(newValue);
        applyFilters({ mes: newValue });
    };

    const handleAnoChange = (value: string) => {
        const newValue = value === 'all' ? '' : value;
        setAnoFilter(newValue);
        applyFilters({ ano: newValue });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setEstadoFilter('');
        setMesFilter('');
        setAnoFilter('');
        router.get(
            '/recrutamentos',
            {},
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        form.reset({
            id_municipe: undefined,
            data_recruta: new Date().toISOString().split('T')[0],
            observacoes: '',
            estado: 0,
        });
        setIsCreateOpen(true);
    };

    const openEdit = (recrutamento: Recrutamento) => {
        setSelectedRecrutamento(recrutamento);
        form.reset({
            id_municipe: recrutamento.municipe.id,
            data_recruta: recrutamento.data_recruta,
            observacoes: recrutamento.observacoes || '',
            estado: recrutamento.estado,
        });
        setIsEditOpen(true);
    };

    const onSubmitCreate = (values: z.infer<typeof formSchema>) => {
        router.post('/recrutamentos', values, {
            onSuccess: () => setIsCreateOpen(false),
        });
    };

    const onSubmitEdit = (values: z.infer<typeof formSchema>) => {
        if (!selectedRecrutamento) return;
        router.put(`/recrutamentos/${selectedRecrutamento.id}`, values, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedRecrutamento(null);
            },
        });
    };

    const handleDelete = async (recrutamento: Recrutamento) => {
        const confirmado = await confirm({
            title: 'Remover recrutamento',
            description: `Remover recrutamento de ${recrutamento.municipe.nome_completo}?`,
            confirmLabel: 'Remover',
            destructive: true,
        });
        if (!confirmado) return;
        router.delete(`/recrutamentos/${recrutamento.id}`);
    };

    const getEstadoBadge = (estado: number) => {
        switch (estado) {
            case 0:
                return <Badge variant="secondary">Pendente</Badge>;
            case 1:
                return <Badge className="bg-green-500">Aprovado</Badge>;
            case 2:
                return <Badge variant="destructive">Rejeitado</Badge>;
            default:
                return <Badge>Desconhecido</Badge>;
        }
    };

    const hasActiveFilters =
        searchTerm || estadoFilter || mesFilter || anoFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Recrutamentos - ${NOME_SISTEMA}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header + Stats */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Recrutamentos
                        </h1>
                        <p className="text-muted-foreground">
                            Recenseamento Militar e Recrutamento - DMRMAB
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Recrutamento
                    </Button>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            Pendentes
                        </div>
                        <div className="text-3xl font-bold text-orange-600">
                            {estatisticas.pendentes}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            Aprovados
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                            {estatisticas.aprovados}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            Este Mês
                        </div>
                        <div className="text-3xl font-bold">
                            {estatisticas.total_mes_atual}
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquisar por nome ou BI do munícipe..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <Select
                            value={estadoFilter || 'all'}
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="0">Pendente</SelectItem>
                                <SelectItem value="1">Aprovado</SelectItem>
                                <SelectItem value="2">Rejeitado</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={mesFilter || 'all'}
                            onValueChange={handleMesChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos os meses
                                </SelectItem>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem
                                        key={i + 1}
                                        value={(i + 1).toString()}
                                    >
                                        {new Date(0, i).toLocaleString(
                                            'pt-PT',
                                            { month: 'long' },
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={anoFilter || 'all'}
                            onValueChange={handleAnoChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos os anos
                                </SelectItem>
                                {[2024, 2025, 2026].map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="gap-2"
                            >
                                <X className="h-4 w-4" /> Limpar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabela */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Munícipe</TableHead>
                                <TableHead>Data do Recrutamento</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Observações</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recrutamentos.data.length > 0 ? (
                                recrutamentos.data.map((rec) => (
                                    <TableRow key={rec.id}>
                                        <TableCell className="font-medium">
                                            {rec.municipe.nome_completo}
                                            {rec.municipe.bi_numero && (
                                                <div className="text-xs text-muted-foreground">
                                                    BI: {rec.municipe.bi_numero}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(rec.data_recruta),
                                                'dd/MM/yyyy',
                                                { locale: pt },
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(rec.estado)}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                            {rec.observacoes || '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEdit(rec)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(rec)
                                                    }
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center"
                                    >
                                        Nenhum recrutamento encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                {recrutamentos.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {recrutamentos.data.length} de{' '}
                            {recrutamentos.total}
                        </p>
                        <div className="flex gap-2">
                            {recrutamentos.current_page > 1 && (
                                <Link
                                    href={`/recrutamentos?page=${recrutamentos.current_page - 1}`}
                                    className="rounded border px-4 py-2"
                                >
                                    Anterior
                                </Link>
                            )}
                            {recrutamentos.current_page <
                                recrutamentos.last_page && (
                                <Link
                                    href={`/recrutamentos?page=${recrutamentos.current_page + 1}`}
                                    className="rounded border px-4 py-2"
                                >
                                    Próximo
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registar Novo Recrutamento</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmitCreate)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="id_municipe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Munícipe *</FormLabel>

                                        <MunicipeBox
                                            value={field.value}
                                            onChange={field.onChange}
                                            listas={municipes}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="data_recruta"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Data do Recrutamento *
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Pendente
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Aprovado
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Rejeitado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="observacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    Registar Recrutamento
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Recrutamento</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmitEdit)}
                            className="space-y-4"
                        >
                            {/* Same fields as create */}
                            <FormField
                                control={form.control}
                                name="data_recruta"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Data do Recrutamento
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">
                                                    Pendente
                                                </SelectItem>
                                                <SelectItem value="1">
                                                    Aprovado
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Rejeitado
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="observacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar Alterações</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
