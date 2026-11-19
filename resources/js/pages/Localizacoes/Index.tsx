import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
import { NOME_SISTEMA } from '@/lib/sistema';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    MapPin,
    Building2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Provincia {
    id: number;
    nome: string;
    municipios_count?: number;
}

interface PaginatedProvincia {
    data: Provincia[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Municipio {
    id: number;
    nome: string;
    id_provincia?: number;
    provincia?: Provincia;
}

interface PaginatedMunicipio {
    data: Municipio[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    search?: string;
    id_provincia?: string;
}

interface Props {
    provincias: PaginatedProvincia;
    municipios: PaginatedMunicipio;
    filters: Filters;
}

// ─── Schemas ─────────────────────────────────────────────────────────────────

const provinciaSchema = z.object({
    nome: z
        .string()
        .min(2, 'Mínimo 2 caracteres')
        .max(100, 'Máximo 100 caracteres'),
});

const municipioSchema = z.object({
    nome: z
        .string()
        .min(2, 'Mínimo 2 caracteres')
        .max(150, 'Máximo 150 caracteres'),
    id_provincia: z.string().min(1, 'Selecione uma província'),
});

type ProvinciaForm = z.infer<typeof provinciaSchema>;
type MunicipioForm = z.infer<typeof municipioSchema>;

// ─── Componente de Paginação Reutilizável ───────────────────────────────────

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    pageParam: 'provincias_page' | 'municipios_page';
    buildHref: (
        param: 'provincias_page' | 'municipios_page',
        page: number,
    ) => string;
}

function Pagination({
    currentPage,
    lastPage,
    pageParam,
    buildHref,
}: PaginationProps) {
    if (lastPage <= 1) return null;

    return (
        <div className="mt-4 flex items-center justify-center gap-2">
            <Link
                href={buildHref(pageParam, currentPage - 1)}
                className={`inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm transition-colors ${
                    currentPage <= 1
                        ? 'pointer-events-none opacity-50'
                        : 'hover:bg-accent'
                }`}
            >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
            </Link>

            <span className="text-sm text-muted-foreground">
                Página {currentPage} de {lastPage}
            </span>

            <Link
                href={buildHref(pageParam, currentPage + 1)}
                className={`inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm transition-colors ${
                    currentPage >= lastPage
                        ? 'pointer-events-none opacity-50'
                        : 'hover:bg-accent'
                }`}
            >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
        </div>
    );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function LocalizacoesIndex({
    provincias,
    municipios,
    filters: initialFilters,
}: Props) {
    const { props } = usePage();
    const currentFilters = (props.filters as Filters) || initialFilters || {};

    const [activeTab, setActiveTab] = useState<'provincias' | 'municipios'>(
        'provincias',
    );

    // Modais
    const [isProvinciaOpen, setIsProvinciaOpen] = useState(false);
    const [isMunicipioOpen, setIsMunicipioOpen] = useState(false);
    const [editingProvincia, setEditingProvincia] = useState<Provincia | null>(
        null,
    );
    const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(
        null,
    );

    // Confirmação de delete
    const [deleteProvinciaTarget, setDeleteProvinciaTarget] =
        useState<Provincia | null>(null);
    const [deleteMunicipioTarget, setDeleteMunicipioTarget] =
        useState<Municipio | null>(null);

    // Filtros
    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const [provinciaFilter, setProvinciaFilter] = useState(
        currentFilters.id_provincia || '',
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Localizações', href: '/provincias' },
    ];

    // ── Forms (DEVEM vir antes dos useEffect que os usam) ───────────────────

    const provinciaForm = useForm<ProvinciaForm>({
        resolver: zodResolver(provinciaSchema),
        defaultValues: { nome: '' },
    });

    const municipioForm = useForm<MunicipioForm>({
        resolver: zodResolver(municipioSchema),
        defaultValues: { nome: '', id_provincia: '' },
    });

    // ── Sincronizar erros do servidor → formulário Província ────────────────

    useEffect(() => {
        if (!isProvinciaOpen) return;

        const serverErrors = (props as any).errors as
            | Record<string, string | string[]>
            | undefined;
        if (!serverErrors) return;

        Object.entries(serverErrors).forEach(([field, message]) => {
            if (field === 'nome') {
                provinciaForm.setError('nome', {
                    type: 'server',
                    message: Array.isArray(message) ? message[0] : message,
                });
            }
        });
    }, [props.errors, isProvinciaOpen, provinciaForm]);

    // ── Sincronizar erros do servidor → formulário Município ─────────────────

    useEffect(() => {
        if (!isMunicipioOpen) return;

        const serverErrors = (props as any).errors as
            | Record<string, string | string[]>
            | undefined;
        if (!serverErrors) return;

        Object.entries(serverErrors).forEach(([field, message]) => {
            if (field === 'nome' || field === 'id_provincia') {
                municipioForm.setError(field as 'nome' | 'id_provincia', {
                    type: 'server',
                    message: Array.isArray(message) ? message[0] : message,
                });
            }
        });
    }, [props.errors, isMunicipioOpen, municipioForm]);

    // ── Filtros ──────────────────────────────────────────────────────────────

    const applyMunicipioFilters = (newFilters: Partial<Filters>) => {
        const params: Record<string, string> = {};
        const merged = { ...currentFilters, ...newFilters };
        if (merged.search) params.search = merged.search;
        if (merged.id_provincia) params.id_provincia = merged.id_provincia;
        router.get('/provincias', params, {
            preserveState: true,
            replace: true,
        });
    };

    const buildPageHref = (
        pageParam: 'provincias_page' | 'municipios_page',
        page: number,
    ) => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (provinciaFilter) params.set('id_provincia', provinciaFilter);
        params.set(pageParam, String(page));
        return `/provincias?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setProvinciaFilter('');
        router.get('/provincias', {}, { preserveState: true, replace: true });
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

    const hasActiveFilters = searchTerm || provinciaFilter;

    // ── Províncias ───────────────────────────────────────────────────────────

    const openCreateProvincia = () => {
        provinciaForm.reset({ nome: '' });
        provinciaForm.clearErrors();
        setEditingProvincia(null);
        setIsProvinciaOpen(true);
    };

    const openEditProvincia = (prov: Provincia) => {
        setEditingProvincia(prov);
        provinciaForm.reset({ nome: prov.nome });
        provinciaForm.clearErrors();
        setIsProvinciaOpen(true);
    };

    const onSubmitProvincia = (values: ProvinciaForm) => {
        if (editingProvincia) {
            router.put(`/provincias/${editingProvincia.id}`, values, {
                onSuccess: () => setIsProvinciaOpen(false),
                // Erros de validação vão para props.errors → useEffect acima
            });
        } else {
            router.post('/provincias', values, {
                onSuccess: () => setIsProvinciaOpen(false),
            });
        }
    };

    const confirmDeleteProvincia = () => {
        if (!deleteProvinciaTarget) return;

        router.delete(`/provincias/${deleteProvinciaTarget.id}`, {
            onSuccess: () => setDeleteProvinciaTarget(null),
            onError: (errors) => {
                setDeleteProvinciaTarget(null);
                const errorMsg = errors.error || 'Erro ao remover província.';
                toast.error(errorMsg);
            },
        });
    };

    // ── Municípios ───────────────────────────────────────────────────────────

    const openCreateMunicipio = () => {
        municipioForm.reset({ nome: '', id_provincia: '' });
        municipioForm.clearErrors();
        setEditingMunicipio(null);
        setIsMunicipioOpen(true);
    };

    const openEditMunicipio = (mun: Municipio) => {
        setEditingMunicipio(mun);
        municipioForm.reset({
            nome: mun.nome,
            id_provincia:
                mun.id_provincia?.toString() ??
                mun.provincia?.id?.toString() ??
                '',
        });
        municipioForm.clearErrors();
        setIsMunicipioOpen(true);
    };

    const onSubmitMunicipio = (values: MunicipioForm) => {
        const payload = {
            nome: values.nome,
            id_provincia: Number(values.id_provincia),
        };

        if (editingMunicipio) {
            router.put(`/municipios/${editingMunicipio.id}`, payload, {
                onSuccess: () => setIsMunicipioOpen(false),
            });
        } else {
            router.post('/municipios', payload, {
                onSuccess: () => setIsMunicipioOpen(false),
            });
        }
    };

    const confirmDeleteMunicipio = () => {
        if (!deleteMunicipioTarget) return;

        router.delete(`/municipios/${deleteMunicipioTarget.id}`, {
            onSuccess: () => setDeleteMunicipioTarget(null),
            onError: (errors) => {
                setDeleteMunicipioTarget(null);
                const errorMsg = errors.error || 'Erro ao remover município.';
                toast.error(errorMsg);
            },
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Localizações — ${NOME_SISTEMA}`} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Cabeçalho */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Localizações
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestão de províncias e municípios de Angola
                    </p>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                        setActiveTab(v as 'provincias' | 'municipios')
                    }
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 md:w-[360px]">
                        <TabsTrigger value="provincias" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Províncias
                            <Badge
                                variant="secondary"
                                className="ml-1 h-5 px-1.5 text-xs"
                            >
                                {provincias.total}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="municipios" className="gap-2">
                            <MapPin className="h-4 w-4" />
                            Municípios
                            <Badge
                                variant="secondary"
                                className="ml-1 h-5 px-1.5 text-xs"
                            >
                                {municipios.total}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* ══ PROVÍNCIAS ══════════════════════════════════════════ */}
                    <TabsContent value="provincias" className="mt-4">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {provincias.total} província
                                {provincias.total !== 1 ? 's' : ''} registada
                                {provincias.total !== 1 ? 's' : ''}
                            </p>
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
                                    <TableRow className="bg-muted/40">
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="w-[120px] text-center">
                                            Municípios
                                        </TableHead>
                                        <TableHead className="w-[120px] text-right">
                                            Ações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {provincias.data.length > 0 ? (
                                        provincias.data.map((prov) => (
                                            <TableRow key={prov.id}>
                                                <TableCell className="font-medium">
                                                    {prov.nome}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">
                                                        {prov.municipios_count ??
                                                            0}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                openEditProvincia(
                                                                    prov,
                                                                )
                                                            }
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                setDeleteProvinciaTarget(
                                                                    prov,
                                                                )
                                                            }
                                                            title="Remover"
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
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                Nenhuma província registada.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={provincias.current_page}
                            lastPage={provincias.last_page}
                            pageParam="provincias_page"
                            buildHref={buildPageHref}
                        />
                    </TabsContent>

                    {/* ══ MUNICÍPIOS ══════════════════════════════════════════ */}
                    <TabsContent value="municipios" className="mt-4">
                        {/* Filtros */}
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 gap-2">
                                <div className="relative max-w-xs flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Pesquisar município..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={provinciaFilter || 'all'}
                                    onValueChange={handleProvinciaFilter}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filtrar por província" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Todas as províncias
                                        </SelectItem>
                                        {provincias.data.map((p) => (
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
                            </div>
                            <Button
                                onClick={openCreateMunicipio}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Novo Município
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40">
                                        <TableHead>Município</TableHead>
                                        <TableHead>Província</TableHead>
                                        <TableHead className="w-[120px] text-right">
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
                                                    {mun.provincia?.nome ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-normal"
                                                        >
                                                            {mun.provincia.nome}
                                                        </Badge>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                openEditMunicipio(
                                                                    mun,
                                                                )
                                                            }
                                                            title="Editar"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                setDeleteMunicipioTarget(
                                                                    mun,
                                                                )
                                                            }
                                                            title="Remover"
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
                                                className="h-24 text-center text-muted-foreground"
                                            >
                                                {hasActiveFilters
                                                    ? 'Nenhum município encontrado com os filtros aplicados.'
                                                    : 'Nenhum município registado.'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={municipios.current_page}
                            lastPage={municipios.last_page}
                            pageParam="municipios_page"
                            buildHref={buildPageHref}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* ══ MODAL: Província ════════════════════════════════════════════ */}
            <Dialog open={isProvinciaOpen} onOpenChange={setIsProvinciaOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProvincia
                                ? 'Editar Província'
                                : 'Nova Província'}
                        </DialogTitle>
                        {editingProvincia && (
                            <DialogDescription>
                                A editar:{' '}
                                <span className="font-medium">
                                    {editingProvincia.nome}
                                </span>
                            </DialogDescription>
                        )}
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
                                        <FormLabel>
                                            Nome da Província *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Benguela"
                                                autoFocus
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
                                <Button
                                    type="submit"
                                    disabled={
                                        provinciaForm.formState.isSubmitting
                                    }
                                >
                                    {provinciaForm.formState.isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            A guardar...
                                        </span>
                                    ) : editingProvincia ? (
                                        'Guardar Alterações'
                                    ) : (
                                        'Criar Província'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══ MODAL: Município ════════════════════════════════════════════ */}
            <Dialog open={isMunicipioOpen} onOpenChange={setIsMunicipioOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMunicipio
                                ? 'Editar Município'
                                : 'Novo Município'}
                        </DialogTitle>
                        {editingMunicipio && (
                            <DialogDescription>
                                A editar:{' '}
                                <span className="font-medium">
                                    {editingMunicipio.nome}
                                </span>
                            </DialogDescription>
                        )}
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
                                        <FormLabel>
                                            Nome do Município *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Lobito"
                                                autoFocus
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
                                        <FormLabel>Província *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a província" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {provincias.data.map((p) => (
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
                                <Button
                                    type="submit"
                                    disabled={
                                        municipioForm.formState.isSubmitting
                                    }
                                >
                                    {municipioForm.formState.isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            A guardar...
                                        </span>
                                    ) : editingMunicipio ? (
                                        'Guardar Alterações'
                                    ) : (
                                        'Criar Município'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══ CONFIRM: Remover Província ══════════════════════════════════ */}
            <AlertDialog
                open={!!deleteProvinciaTarget}
                onOpenChange={(o) => {
                    if (!o) setDeleteProvinciaTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Província</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que deseja remover a província{' '}
                            <span className="font-semibold">
                                {deleteProvinciaTarget?.nome}
                            </span>
                            ?
                            {(deleteProvinciaTarget?.municipios_count ?? 0) >
                                0 && (
                                <span className="mt-1 block text-amber-600">
                                    ⚠️ Esta província tem{' '}
                                    {deleteProvinciaTarget?.municipios_count}{' '}
                                    município(s) associado(s).
                                    <br />
                                    <strong>
                                        Remova os municípios primeiro.
                                    </strong>
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteProvincia}
                            disabled={
                                (deleteProvinciaTarget?.municipios_count ?? 0) >
                                0
                            }
                            className={`${
                                (deleteProvinciaTarget?.municipios_count ?? 0) >
                                0
                                    ? 'pointer-events-none opacity-50'
                                    : 'bg-destructive text-white hover:bg-destructive/90'
                            }`}
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ══ CONFIRM: Remover Município ══════════════════════════════════ */}
            <AlertDialog
                open={!!deleteMunicipioTarget}
                onOpenChange={(o) => {
                    if (!o) setDeleteMunicipioTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover Município</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que deseja remover o município{' '}
                            <span className="font-semibold">
                                {deleteMunicipioTarget?.nome}
                            </span>
                            ? Esta acção não pode ser revertida.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteMunicipio}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
