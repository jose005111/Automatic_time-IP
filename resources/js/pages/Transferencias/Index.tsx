import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

import AppLayout from '@/layouts/app-layout';
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
import { Plus, Edit, Trash2, Search, X, CheckCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Recrutamento {
    id: number;
    municipe: {
        id: number;
        nome_completo: string;
    };
}

interface Municipio {
    id: number;
    nome: string;
    provincia?: {
        nome: string;
    };
}

interface Transferencia {
    id: number;
    data_solicitacao: string;
    estado: number;
    local_destino?: string;
    data_aprovacao?: string;
    recrutamento: {
        id: number;
        municipe: {
            nome_completo: string;
        };
    };
    municipioDestino?: {
        nome: string;
        provincia?: {
            nome: string;
        };
    };
    userAprovou?: {
        name: string;
    };
}

interface Filters {
    search?: string;
    estado?: string;
    id_municipio_destino?: string;
}

interface Props {
    transferencias: {
        data: Transferencia[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    recrutamentos: Recrutamento[];
    municipios: Municipio[];
    filters: Filters;
}

const formSchema = z.object({
    id_recrutamento: z.coerce.number().min(1, 'Recrutamento é obrigatório'),
    data_solicitacao: z.string().min(1, 'Data é obrigatória'),
    id_municipio_destino: z.coerce.number().optional(),
    local_destino: z.string().optional(),
    estado: z.coerce.number().min(0).max(2).optional(),
});

export default function TransferenciasIndex({
    transferencias,
    recrutamentos,
    municipios,
    filters: initialFilters,
}: Props) {
    const { props } = usePage();
    const currentFilters = props.filters || initialFilters || {};

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTransferencia, setSelectedTransferencia] =
        useState<Transferencia | null>(null);

    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const [estadoFilter, setEstadoFilter] = useState(
        currentFilters.estado || '',
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Transferências', href: '/transferencias' },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id_recrutamento: undefined,
            data_solicitacao: new Date().toISOString().split('T')[0],
            id_municipio_destino: undefined,
            local_destino: '',
            estado: 0,
        },
    });

    const applyFilters = (newFilters: Partial<Filters>) => {
        const params: any = { ...currentFilters, ...newFilters };
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });
        router.get('/transferencias', params, {
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

    const clearFilters = () => {
        setSearchTerm('');
        setEstadoFilter('');
        router.get(
            '/transferencias',
            {},
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        form.reset({
            id_recrutamento: undefined,
            data_solicitacao: new Date().toISOString().split('T')[0],
            id_municipio_destino: undefined,
            local_destino: '',
            estado: 0,
        });
        setIsCreateOpen(true);
    };

    const openEdit = (transferencia: Transferencia) => {
        setSelectedTransferencia(transferencia);
        form.reset({
            id_recrutamento: transferencia.recrutamento.id,
            data_solicitacao: transferencia.data_solicitacao,
            id_municipio_destino: transferencia.municipioDestino?.id,
            local_destino: transferencia.local_destino || '',
            estado: transferencia.estado,
        });
        setIsEditOpen(true);
    };

    const onSubmitCreate = (values: z.infer<typeof formSchema>) => {
        router.post('/transferencias', values, {
            onSuccess: () => setIsCreateOpen(false),
        });
    };

    const onSubmitEdit = (values: z.infer<typeof formSchema>) => {
        if (!selectedTransferencia) return;
        router.put(`/transferencias/${selectedTransferencia.id}`, values, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedTransferencia(null);
            },
        });
    };

    const handleDelete = (transferencia: Transferencia) => {
        if (confirm('Remover esta solicitação de transferência?')) {
            router.delete(`/transferencias/${transferencia.id}`);
        }
    };

    const handleAprovar = (transferencia: Transferencia) => {
        if (
            confirm(
                `Aprovar transferência de ${transferencia.recrutamento.municipe.nome_completo}?`,
            )
        ) {
            router.post(
                `/transferencias/${transferencia.id}/aprovar`,
                {},
                {
                    onSuccess: () => {
                        // Inertia will automatically refresh the page data
                    },
                },
            );
        }
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

    const hasActiveFilters = searchTerm || estadoFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transferências - SIGID" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Transferências
                        </h1>
                        <p className="text-muted-foreground">
                            Gestão de transferências de recrutamento entre
                            municípios
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Solicitação
                    </Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-end">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquisar por munícipe ou destino..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Select
                            value={estadoFilter || 'all'}
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos os estados
                                </SelectItem>
                                <SelectItem value="0">Pendente</SelectItem>
                                <SelectItem value="1">Aprovado</SelectItem>
                                <SelectItem value="2">Rejeitado</SelectItem>
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
                                <TableHead>Data Solicitação</TableHead>
                                <TableHead>Destino</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Aprovado por</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transferencias.data.length > 0 ? (
                                transferencias.data.map((trans) => (
                                    <TableRow key={trans.id}>
                                        <TableCell className="font-medium">
                                            {
                                                trans.recrutamento.municipe
                                                    .nome_completo
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {format(
                                                new Date(
                                                    trans.data_solicitacao,
                                                ),
                                                'dd/MM/yyyy',
                                                { locale: pt },
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {trans.municipioDestino ? (
                                                <>
                                                    {
                                                        trans.municipioDestino
                                                            .nome
                                                    }
                                                    {trans.municipioDestino
                                                        .provincia && (
                                                        <span className="block text-xs text-muted-foreground">
                                                            {
                                                                trans
                                                                    .municipioDestino
                                                                    .provincia
                                                                    .nome
                                                            }
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                trans.local_destino || '—'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getEstadoBadge(trans.estado)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {trans.estado === 1 &&
                                            trans.userAprovou ? (
                                                <div>
                                                    {trans.userAprovou.name}
                                                    <div className="text-xs text-muted-foreground">
                                                        {trans.data_aprovacao &&
                                                            format(
                                                                new Date(
                                                                    trans.data_aprovacao,
                                                                ),
                                                                'dd/MM/yyyy',
                                                            )}
                                                    </div>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {trans.estado === 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleAprovar(trans)
                                                        }
                                                        className="gap-1 border-green-600 text-green-600 hover:bg-green-50"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Aprovar
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        openEdit(trans)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(trans)
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
                                        colSpan={6}
                                        className="h-24 text-center"
                                    >
                                        Nenhuma transferência encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                {transferencias.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {transferencias.data.length} de{' '}
                            {transferencias.total}
                        </p>
                        <div className="flex gap-2">
                            {transferencias.current_page > 1 && (
                                <Link
                                    href={`/transferencias?page=${transferencias.current_page - 1}`}
                                    className="rounded border px-4 py-2"
                                >
                                    Anterior
                                </Link>
                            )}
                            {transferencias.current_page <
                                transferencias.last_page && (
                                <Link
                                    href={`/transferencias?page=${transferencias.current_page + 1}`}
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
                        <DialogTitle>
                            Nova Solicitação de Transferência
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmitCreate)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="id_recrutamento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Recrutamento *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o recrutamento" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {recrutamentos.map((r) => (
                                                    <SelectItem
                                                        key={r.id}
                                                        value={r.id.toString()}
                                                    >
                                                        {
                                                            r.municipe
                                                                .nome_completo
                                                        }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="data_solicitacao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Data da Solicitação
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="id_municipio_destino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Município de Destino
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o município" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {municipios.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id.toString()}
                                                    >
                                                        {m.nome}{' '}
                                                        {m.provincia &&
                                                            `(${m.provincia.nome})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="local_destino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Local de Destino (se não for
                                            município)
                                        </FormLabel>
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
                                    Solicitar Transferência
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
                        <DialogTitle>Editar Transferência</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmitEdit)}
                            className="space-y-4"
                        >
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
                                name="local_destino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Local de Destino</FormLabel>
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
