import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Provincia {
    id: number;
    nome: string;
    municipios_count?: number;
}

interface Municipio {
    id: number;
    nome: string;
    provincia?: Provincia;
}

interface Filters {
    search?: string;
    id_provincia?: string;
}

interface Props {
    provincias: Provincia[];
    municipios: {
        data: Municipio[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: Filters;
}

const provinciaSchema = z.object({
    nome: z.string().min(3, 'Nome da província é obrigatório'),
});

const municipioSchema = z.object({
    nome: z.string().min(3, 'Nome do município é obrigatório'),
    id_provincia: z.coerce.number().min(1, 'Selecione uma província'),
});

export default function LocalizacoesIndex({
    provincias,
    municipios,
    filters: initialFilters,
}: Props) {
    const { props } = usePage();
    const currentFilters = props.filters || initialFilters || {};

    const [activeTab, setActiveTab] = useState<'provincias' | 'municipios'>(
        'provincias',
    );

    const [isProvinciaOpen, setIsProvinciaOpen] = useState(false);
    const [isMunicipioOpen, setIsMunicipioOpen] = useState(false);
    const [editingProvincia, setEditingProvincia] = useState<Provincia | null>(
        null,
    );
    const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(
        null,
    );

    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const [provinciaFilter, setProvinciaFilter] = useState(
        currentFilters.id_provincia || '',
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Localizações', href: '/localizacoes' },
    ];

    const provinciaForm = useForm<z.infer<typeof provinciaSchema>>({
        resolver: zodResolver(provinciaSchema),
        defaultValues: { nome: '' },
    });

    const municipioForm = useForm<z.infer<typeof municipioSchema>>({
        resolver: zodResolver(municipioSchema),
        defaultValues: { nome: '', id_provincia: 0 },
    });

    // ==================== FILTROS MUNICÍPIOS ====================
    const applyMunicipioFilters = (newFilters: Partial<Filters>) => {
        const params: any = { ...currentFilters, ...newFilters };
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });
        router.get('/localizacoes', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        applyMunicipioFilters({ search: value });
    };

    const handleProvinciaFilter = (value: string) => {
        const newValue = value === 'all' ? '' : value;
        setProvinciaFilter(newValue);
        applyMunicipioFilters({ id_provincia: newValue });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setProvinciaFilter('');
        router.get('/localizacoes', {}, { preserveState: true, replace: true });
    };

    // ==================== PROVÍNCIAS ====================
    const openCreateProvincia = () => {
        provinciaForm.reset();
        setEditingProvincia(null);
        setIsProvinciaOpen(true);
    };

    const openEditProvincia = (prov: Provincia) => {
        setEditingProvincia(prov);
        provinciaForm.reset({ nome: prov.nome });
        setIsProvinciaOpen(true);
    };

    const onSubmitProvincia = (values: z.infer<typeof provinciaSchema>) => {
        if (editingProvincia) {
            router.put(`/provincias/${editingProvincia.id}`, values);
        } else {
            router.post('/provincias', values);
        }
        setIsProvinciaOpen(false);
    };

    const deleteProvincia = (id: number) => {
        if (confirm('Tem certeza que deseja remover esta província?')) {
            router.delete(`/provincias/${id}`);
        }
    };

    // ==================== MUNICÍPIOS ====================
    const openCreateMunicipio = () => {
        municipioForm.reset({ nome: '', id_provincia: 0 });
        setEditingMunicipio(null);
        setIsMunicipioOpen(true);
    };

    const openEditMunicipio = (mun: Municipio) => {
        setEditingMunicipio(mun);
        municipioForm.reset({
            nome: mun.nome,
            id_provincia: mun.provincia?.id || 0,
        });
        setIsMunicipioOpen(true);
    };

    const onSubmitMunicipio = (values: z.infer<typeof municipioSchema>) => {
        if (editingMunicipio) {
            router.put(`/municipios/${editingMunicipio.id}`, values);
        } else {
            router.post('/municipios', values);
        }
        setIsMunicipioOpen(false);
    };

    const deleteMunicipio = (id: number) => {
        if (confirm('Tem certeza que deseja remover este município?')) {
            router.delete(`/municipios/${id}`);
        }
    };

    const hasActiveFilters = searchTerm || provinciaFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Localizações - SIGID" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Localizações
                        </h1>
                        <p className="text-muted-foreground">
                            Gestão de Províncias e Municípios de Angola
                        </p>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as 'provincias' | 'municipios')
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="provincias">Províncias</TabsTrigger>
                        <TabsTrigger value="municipios">Municípios</TabsTrigger>
                    </TabsList>

                    {/* ==================== PROVÍNCIAS ==================== */}
                    <TabsContent value="provincias" className="mt-4">
                        <div className="mb-4 flex justify-end">
                            <Button
                                onClick={openCreateProvincia}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Nova Província
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome da Província</TableHead>
                                        <TableHead className="text-center">
                                            Municípios
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Ações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {provincias.length > 0 ? (
                                        provincias.map((prov) => (
                                            <TableRow key={prov.id}>
                                                <TableCell className="font-medium">
                                                    {prov.nome}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {prov.municipios_count || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditProvincia(
                                                                    prov,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                deleteProvincia(
                                                                    prov.id,
                                                                )
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
                                                colSpan={3}
                                                className="h-24 text-center"
                                            >
                                                Nenhuma província encontrada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    {/* ==================== MUNICÍPIOS (com paginação e filtros) ==================== */}
                    <TabsContent value="municipios" className="mt-4">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div className="flex-1">
                                <div className="relative max-w-sm">
                                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Pesquisar município..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Select
                                    value={provinciaFilter || 'all'}
                                    onValueChange={handleProvinciaFilter}
                                >
                                    <SelectTrigger className="w-[220px]">
                                        <SelectValue placeholder="Filtrar por província" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas as províncias
                                        </SelectItem>
                                        {provincias.map((p) => (
                                            <SelectItem
                                                key={p.id}
                                                value={p.id.toString()}
                                            >
                                                {p.nome}
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

                                <Button
                                    onClick={openCreateMunicipio}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Novo Município
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Município</TableHead>
                                        <TableHead>Província</TableHead>
                                        <TableHead className="text-right">
                                            Ações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {municipios.data.length > 0 ? (
                                        municipios.data.map((mun) => (
                                            <TableRow key={mun.id}>
                                                <TableCell className="font-medium">
                                                    {mun.nome}
                                                </TableCell>
                                                <TableCell>
                                                    {mun.provincia?.nome || '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditMunicipio(
                                                                    mun,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                deleteMunicipio(
                                                                    mun.id,
                                                                )
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
                                                colSpan={3}
                                                className="h-24 text-center"
                                            >
                                                Nenhum município encontrado com
                                                os filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginação Municípios */}
                        {municipios.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {municipios.data.length} de{' '}
                                    {municipios.total} municípios
                                </p>
                                <div className="flex gap-2">
                                    {municipios.current_page > 1 && (
                                        <Link
                                            href={`/localizacoes?page=${municipios.current_page - 1}`}
                                            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm"
                                        >
                                            Anterior
                                        </Link>
                                    )}
                                    {municipios.current_page <
                                        municipios.last_page && (
                                        <Link
                                            href={`/localizacoes?page=${municipios.current_page + 1}`}
                                            className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm"
                                        >
                                            Próximo
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ==================== MODAL PROVÍNCIA ==================== */}
            <Dialog open={isProvinciaOpen} onOpenChange={setIsProvinciaOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingProvincia
                                ? 'Editar Província'
                                : 'Nova Província'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...provinciaForm}>
                        <form
                            onSubmit={provinciaForm.handleSubmit(
                                onSubmitProvincia,
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={provinciaForm.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Província</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Benguela"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsProvinciaOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL MUNICÍPIO ==================== */}
            <Dialog open={isMunicipioOpen} onOpenChange={setIsMunicipioOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingMunicipio
                                ? 'Editar Município'
                                : 'Novo Município'}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...municipioForm}>
                        <form
                            onSubmit={municipioForm.handleSubmit(
                                onSubmitMunicipio,
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={municipioForm.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Município</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Lobito"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={municipioForm.control}
                                name="id_provincia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Província</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a província" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {provincias.map((p) => (
                                                    <SelectItem
                                                        key={p.id}
                                                        value={p.id.toString()}
                                                    >
                                                        {p.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsMunicipioOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
