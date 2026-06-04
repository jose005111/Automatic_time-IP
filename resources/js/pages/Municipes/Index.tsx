import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    MapPin,
    User,
    Search,
    X,
    Calendar,
    FileText,
    CreditCard,
    Phone,
    Mail,
    Home,
    Users,
    Briefcase,
    GraduationCap,
    Heart,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    Download,
    Upload,
    Printer,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Types completos baseados no banco de dados
interface Provincia {
    id: number;
    nome: string;
}

interface Municipio {
    id: number;
    nome: string;
    id_provincia: number;
    provincia?: Provincia;
}

interface Progenitor {
    id: number;
    nome_completo: string;
    data_nascimento?: string;
    naturalidade?: string;
    profissao?: string;
    sexo?: string;
}

interface DadosBiografico {
    id?: number;
    nip?: string;
    assento_numero?: string;
    registro_civil?: string;
    registro_numero?: string;
    cedula_numero?: string;
    numero_filhos?: number;
    vencimento?: number;
    ramo_actividade?: string;
    ramo?: string;
    ano_incorporacao?: number;
    ano_abandono?: number;
    ano_servico?: number;
    modo_vida?: string;
}

interface DadosComplementar {
    id?: number;
    caixa_postal?: string;
    nif?: string;
    encargo_familiar?: number;
    habilitacao_literaria?: string;
    profissao?: string;
    numero_irmaos?: number;
    entidade_emissora_bi?: string;
    numero_carta_conducao?: string;
    data_emissao_carta?: string;
    data_validade_carta?: string;
    atributo?: string;
}

interface Endereco {
    id?: number;
    morada?: string;
    localidade?: string;
    comuna?: string;
    id_provincia?: number;
    id_municipio?: number;
    provincia?: Provincia;
    municipio?: Municipio;
}

interface Recrutamento {
    id: number;
    data_recruta: string;
    estado: number;
    observacoes?: string;
    created_at?: string;
}

interface Municipe {
    id: number;
    nome_completo: string;
    data_nascimento: string;
    sexo: string;
    estado_civil?: string;
    naturalidade?: string;
    bi_numero?: string;
    bi_data_emissao?: string;
    bi_data_validade?: string;
    telefone?: string;
    celular?: string;
    id_municipio_naturalidade?: number;
    municipio_naturalidade?: Municipio;
    id_pai?: number;
    pai?: Progenitor;
    id_mae?: number;
    mae?: Progenitor;
    dados_biograficos?: DadosBiografico;
    dados_complementares?: DadosComplementar;
    endereco?: Endereco;
    recrutamentos?: Recrutamento[];
}

interface Filters {
    search?: string;
    sexo?: string;
    estado_civil?: string;
    has_bi?: string;
}

interface Props {
    municipes: {
        data: Municipe[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    provincias: Provincia[];
    municipios: Municipio[];
    filters: Filters;
}

// Schemas de validação completos
const formSchema = z.object({
    nome_completo: z.string().min(3, 'Nome completo é obrigatório'),
    data_nascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    sexo: z.enum(['M', 'F']),
    estado_civil: z.string().optional(),
    naturalidade: z.string().optional(),
    id_municipio_naturalidade: z.coerce.number().optional(),
    bi_numero: z.string().optional(),
    bi_data_emissao: z.string().optional(),
    bi_data_validade: z.string().optional(),
    telefone: z.string().optional(),
    celular: z.string().optional(),
    id_pai: z.coerce.number().optional(),
    id_mae: z.coerce.number().optional(),
});

const biograficoSchema = z.object({
    nip: z.string().optional(),
    assento_numero: z.string().optional(),
    registro_civil: z.string().optional(),
    registro_numero: z.string().optional(),
    cedula_numero: z.string().optional(),
    numero_filhos: z.coerce.number().min(0).optional(),
    vencimento: z.coerce.number().min(0).optional(),
    ramo_actividade: z.string().optional(),
    ramo: z.string().optional(),
    ano_incorporacao: z.coerce
        .number()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    ano_abandono: z.coerce
        .number()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    ano_servico: z.coerce.number().min(0).optional(),
    modo_vida: z.string().optional(),
});

const complementarSchema = z.object({
    caixa_postal: z.string().optional(),
    nif: z.string().optional(),
    encargo_familiar: z.coerce.number().min(0).optional(),
    habilitacao_literaria: z.string().optional(),
    profissao: z.string().optional(),
    numero_irmaos: z.coerce.number().min(0).optional(),
    entidade_emissora_bi: z.string().optional(),
    numero_carta_conducao: z.string().optional(),
    data_emissao_carta: z.string().optional(),
    data_validade_carta: z.string().optional(),
    atributo: z.string().optional(),
});

const enderecoSchema = z.object({
    morada: z.string().optional(),
    localidade: z.string().optional(),
    comuna: z.string().optional(),
    id_provincia: z.coerce.number().optional(),
    id_municipio: z.coerce.number().optional(),
});

const recrutamentoSchema = z.object({
    data_recruta: z.string().min(1, 'Data é obrigatória'),
    observacoes: z.string().optional(),
    estado: z.coerce.number().min(0).max(2),
});

// Componente de Estatísticas
const StatsCards = ({ total }: { total: number }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de Munícipes
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                    <p className="text-xs text-muted-foreground">
                        Cadastrados no sistema
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Homens
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">
                        População masculina
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Mulheres
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">
                        População feminina
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Com BI
                    </CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">—</div>
                    <p className="text-xs text-muted-foreground">
                        Documentados
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

// Componente de Filtros Avançados
const FilterBar = ({
    searchTerm,
    setSearchTerm,
    sexoFilter,
    setSexoFilter,
    estadoCivilFilter,
    setEstadoCivilFilter,
    hasBiFilter,
    setHasBiFilter,
    applyFilters,
    clearFilters,
    hasActiveFilters,
}: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sexoFilter: string;
    setSexoFilter: (value: string) => void;
    estadoCivilFilter: string;
    setEstadoCivilFilter: (value: string) => void;
    hasBiFilter: string;
    setHasBiFilter: (value: string) => void;
    applyFilters: () => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="p-4">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por nome, BI, telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && applyFilters()
                            }
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={sexoFilter || 'all'}
                            onValueChange={(v) =>
                                setSexoFilter(v === 'all' ? '' : v)
                            }
                        >
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="M">Masculino</SelectItem>
                                <SelectItem value="F">Feminino</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={estadoCivilFilter}
                            onValueChange={setEstadoCivilFilter}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Estado Civil" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Solteiro">
                                    Solteiro
                                </SelectItem>
                                <SelectItem value="Casado">Casado</SelectItem>
                                <SelectItem value="Divorciado">
                                    Divorciado
                                </SelectItem>
                                <SelectItem value="Viúvo">Viúvo</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={hasBiFilter}
                            onValueChange={setHasBiFilter}
                        >
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Situação BI" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="yes">Com BI</SelectItem>
                                <SelectItem value="no">Sem BI</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={applyFilters}
                            variant="default"
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" /> Filtrar
                        </Button>
                        {hasActiveFilters && (
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                                className="gap-2"
                            >
                                <X className="h-4 w-4" /> Limpar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Componente de Linha da Tabela
const MunicipeTableRow = ({
    municipe,
    onView,
    onEdit,
    onDelete,
}: {
    municipe: Municipe;
    onView: (m: Municipe) => void;
    onEdit: (m: Municipe) => void;
    onDelete: (m: Municipe) => void;
}) => {
    const getEstadoBadge = (estado: number) => {
        switch (estado) {
            case 0:
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendente
                    </Badge>
                );
            case 1:
                return (
                    <Badge className="gap-1 bg-green-500">
                        <CheckCircle className="h-3 w-3" />
                        Aprovado
                    </Badge>
                );
            case 2:
                return (
                    <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Rejeitado
                    </Badge>
                );
            default:
                return <Badge>Desconhecido</Badge>;
        }
    };

    const calcularIdade = (dataNascimento: string) => {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate()))
            idade--;
        return idade;
    };

    return (
        <TableRow className="group transition-colors hover:bg-muted/50">
            <TableCell className="font-medium">
                <div>
                    <div className="font-semibold">
                        {municipe.nome_completo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        ID: {municipe.id}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div>
                    <div>
                        {format(
                            new Date(municipe.data_nascimento),
                            'dd/MM/yyyy',
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {calcularIdade(municipe.data_nascimento)} anos
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    variant={municipe.sexo === 'M' ? 'default' : 'secondary'}
                >
                    {municipe.sexo === 'M' ? 'Masculino' : 'Feminino'}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="space-y-1">
                    {municipe.bi_numero && (
                        <div className="flex items-center gap-1 text-sm">
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                            <span>{municipe.bi_numero}</span>
                        </div>
                    )}
                    {municipe.celular && (
                        <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{municipe.celular}</span>
                        </div>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">
                        {municipe.endereco?.localidade ||
                            municipe.municipio_naturalidade?.nome ||
                            '—'}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                {municipe.recrutamentos && municipe.recrutamentos.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {municipe.recrutamentos.slice(0, 2).map((r) => (
                            <div key={r.id}>{getEstadoBadge(r.estado)}</div>
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        Nenhum
                    </span>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(municipe)}
                        title="Visualizar"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(municipe)}
                        title="Editar"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(municipe)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
};

export default function MunicipesIndex({
    municipes,
    provincias,
    municipios,
    filters: initialFilters,
}: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isBiograficoOpen, setIsBiograficoOpen] = useState(false);
    const [isComplementarOpen, setIsComplementarOpen] = useState(false);
    const [isEnderecoOpen, setIsEnderecoOpen] = useState(false);
    const [isRecrutamentoOpen, setIsRecrutamentoOpen] = useState(false);
    const [selectedMunicipe, setSelectedMunicipe] = useState<Municipe | null>(
        null,
    );
    const [activeTab, setActiveTab] = useState('pessoal');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtros
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [sexoFilter, setSexoFilter] = useState(initialFilters.sexo || '');
    const [estadoCivilFilter, setEstadoCivilFilter] = useState(
        initialFilters.estado_civil || '',
    );
    const [hasBiFilter, setHasBiFilter] = useState(initialFilters.has_bi || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Munícipes', href: '/municipes' },
    ];

    // Formulários
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome_completo: '',
            data_nascimento: '',
            sexo: 'M',
            estado_civil: '',
            naturalidade: '',
            id_municipio_naturalidade: undefined,
            bi_numero: '',
            bi_data_emissao: '',
            bi_data_validade: '',
            telefone: '',
            celular: '',
            id_pai: undefined,
            id_mae: undefined,
        },
    });

    const biograficoForm = useForm<z.infer<typeof biograficoSchema>>({
        resolver: zodResolver(biograficoSchema),
        defaultValues: {},
    });

    const complementarForm = useForm<z.infer<typeof complementarSchema>>({
        resolver: zodResolver(complementarSchema),
        defaultValues: {},
    });

    const enderecoForm = useForm<z.infer<typeof enderecoSchema>>({
        resolver: zodResolver(enderecoSchema),
        defaultValues: {},
    });

    const recrutamentoForm = useForm<z.infer<typeof recrutamentoSchema>>({
        resolver: zodResolver(recrutamentoSchema),
        defaultValues: {
            data_recruta: new Date().toISOString().split('T')[0],
            estado: 0,
        },
    });

    const applyFilters = () => {
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (sexoFilter) params.sexo = sexoFilter;
        if (estadoCivilFilter) params.estado_civil = estadoCivilFilter;
        if (hasBiFilter) params.has_bi = hasBiFilter;
        router.get('/municipes', params, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSexoFilter('');
        setEstadoCivilFilter('');
        setHasBiFilter('');
        router.get('/municipes', {}, { preserveState: true, replace: true });
    };

    const openCreate = () => {
        form.reset();
        setIsCreateOpen(true);
    };

    const openEdit = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        form.reset({
            nome_completo: municipe.nome_completo,
            data_nascimento: municipe.data_nascimento,
            sexo: municipe.sexo as 'M' | 'F',
            estado_civil: municipe.estado_civil || '',
            naturalidade: municipe.naturalidade || '',
            id_municipio_naturalidade: municipe.municipio_naturalidade?.id,
            bi_numero: municipe.bi_numero || '',
            bi_data_emissao: municipe.bi_data_emissao || '',
            bi_data_validade: municipe.bi_data_validade || '',
            telefone: municipe.telefone || '',
            celular: municipe.celular || '',
            id_pai: municipe.pai?.id,
            id_mae: municipe.mae?.id,
        });
        setIsEditOpen(true);
    };

    const openView = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        setActiveTab('pessoal');
        setIsViewOpen(true);
    };

    const openBiograficoModal = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        biograficoForm.reset(municipe.dados_biograficos || {});
        setIsBiograficoOpen(true);
    };

    const openComplementarModal = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        complementarForm.reset(municipe.dados_complementares || {});
        setIsComplementarOpen(true);
    };

    const openEnderecoModal = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        enderecoForm.reset({
            morada: municipe.endereco?.morada || '',
            localidade: municipe.endereco?.localidade || '',
            comuna: municipe.endereco?.comuna || '',
            id_provincia: municipe.endereco?.id_provincia,
            id_municipio: municipe.endereco?.id_municipio,
        });
        setIsEnderecoOpen(true);
    };

    const openRecrutamentoModal = (municipe: Municipe) => {
        setSelectedMunicipe(municipe);
        recrutamentoForm.reset({
            data_recruta: new Date().toISOString().split('T')[0],
            estado: 0,
            observacoes: '',
        });
        setIsRecrutamentoOpen(true);
    };

    const onSubmitCreate = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        router.post('/municipes', values, {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const onSubmitEdit = async (values: z.infer<typeof formSchema>) => {
        if (!selectedMunicipe) return;
        setIsSubmitting(true);
        router.put(`/municipes/${selectedMunicipe.id}`, values, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedMunicipe(null);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleDelete = (municipe: Municipe) => {
        if (
            confirm(
                `Tem certeza que deseja remover ${municipe.nome_completo}? Esta ação não pode ser desfeita.`,
            )
        ) {
            router.delete(`/municipes/${municipe.id}`);
        }
    };

    const onSubmitBiografico = async (
        values: z.infer<typeof biograficoSchema>,
    ) => {
        if (!selectedMunicipe) return;
        setIsSubmitting(true);
        router.post(`/municipes/${selectedMunicipe.id}/biografico`, values, {
            onSuccess: () => {
                setIsBiograficoOpen(false);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const onSubmitComplementar = async (
        values: z.infer<typeof complementarSchema>,
    ) => {
        if (!selectedMunicipe) return;
        setIsSubmitting(true);
        router.post(`/municipes/${selectedMunicipe.id}/complementar`, values, {
            onSuccess: () => {
                setIsComplementarOpen(false);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const onSubmitEndereco = async (values: z.infer<typeof enderecoSchema>) => {
        if (!selectedMunicipe) return;
        setIsSubmitting(true);
        router.post(`/municipes/${selectedMunicipe.id}/endereco`, values, {
            onSuccess: () => {
                setIsEnderecoOpen(false);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const onSubmitRecrutamento = async (
        values: z.infer<typeof recrutamentoSchema>,
    ) => {
        if (!selectedMunicipe) return;
        setIsSubmitting(true);
        router.post(`/municipes/${selectedMunicipe.id}/recrutamento`, values, {
            onSuccess: () => {
                setIsRecrutamentoOpen(false);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const hasActiveFilters = !!(
        searchTerm ||
        sexoFilter ||
        estadoCivilFilter ||
        hasBiFilter
    );

    // Filtros por município para o select de endereço
    const municipiosFiltrados = enderecoForm.watch('id_provincia')
        ? municipios.filter(
              (m) => m.id_provincia === enderecoForm.getValues('id_provincia'),
          )
        : municipios;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de Munícipes - SIGID" />

            <div className="flex h-full flex-1 flex-col gap-6 bg-background p-6">
                {/* Header com estatísticas */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                                Munícipes
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Gestão completa do cadastro de cidadãos do
                                município de Benguela
                            </p>
                        </div>
                        <Button
                            onClick={openCreate}
                            size="lg"
                            className="gap-2 shadow-lg transition-all hover:shadow-xl"
                        >
                            <Plus className="h-5 w-5" />
                            Novo Munícipe
                        </Button>
                    </div>
                    <StatsCards total={municipes.total} />
                </div>

                {/* Filtros */}
                <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sexoFilter={sexoFilter}
                    setSexoFilter={setSexoFilter}
                    estadoCivilFilter={estadoCivilFilter}
                    setEstadoCivilFilter={setEstadoCivilFilter}
                    hasBiFilter={hasBiFilter}
                    setHasBiFilter={setHasBiFilter}
                    applyFilters={applyFilters}
                    clearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {/* Tabela de Munícipes */}
                <Card>
                    <CardContent className="p-0">
                        <div className="rounded-md border-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[250px]">
                                            Nome Completo
                                        </TableHead>
                                        <TableHead className="w-[120px]">
                                            Nascimento
                                        </TableHead>
                                        <TableHead className="w-[100px]">
                                            Sexo
                                        </TableHead>
                                        <TableHead className="w-[180px]">
                                            Documentos
                                        </TableHead>
                                        <TableHead className="w-[150px]">
                                            Localidade
                                        </TableHead>
                                        <TableHead className="w-[130px]">
                                            Recrutamento
                                        </TableHead>
                                        <TableHead className="w-[100px] text-right">
                                            Ações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {municipes.data.length > 0 ? (
                                        municipes.data.map((municipe) => (
                                            <MunicipeTableRow
                                                key={municipe.id}
                                                municipe={municipe}
                                                onView={openView}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="h-64 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Users className="h-12 w-12 text-muted-foreground" />
                                                    <p className="text-lg font-medium">
                                                        Nenhum munícipe
                                                        encontrado
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hasActiveFilters
                                                            ? 'Tente ajustar os filtros aplicados'
                                                            : 'Clique em "Novo Munícipe" para começar'}
                                                    </p>
                                                    {hasActiveFilters && (
                                                        <Button
                                                            onClick={
                                                                clearFilters
                                                            }
                                                            variant="outline"
                                                            className="mt-2"
                                                        >
                                                            Limpar Filtros
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Paginação */}
                {municipes.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando{' '}
                            <span className="font-medium">
                                {municipes.data.length}
                            </span>{' '}
                            de{' '}
                            <span className="font-medium">
                                {municipes.total}
                            </span>{' '}
                            munícipes
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={municipes.current_page <= 1}
                                onClick={() =>
                                    router.get(
                                        `/municipes?page=${municipes.current_page - 1}`,
                                        {},
                                        { preserveState: true },
                                    )
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            municipes.last_page,
                                        ),
                                    },
                                    (_, i) => {
                                        let pageNum;
                                        if (municipes.last_page <= 5) {
                                            pageNum = i + 1;
                                        } else if (
                                            municipes.current_page <= 3
                                        ) {
                                            pageNum = i + 1;
                                        } else if (
                                            municipes.current_page >=
                                            municipes.last_page - 2
                                        ) {
                                            pageNum =
                                                municipes.last_page - 4 + i;
                                        } else {
                                            pageNum =
                                                municipes.current_page - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={
                                                    municipes.current_page ===
                                                    pageNum
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                className="w-9"
                                                onClick={() =>
                                                    router.get(
                                                        `/municipes?page=${pageNum}`,
                                                        {},
                                                        { preserveState: true },
                                                    )
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    },
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                    municipes.current_page >=
                                    municipes.last_page
                                }
                                onClick={() =>
                                    router.get(
                                        `/municipes?page=${municipes.current_page + 1}`,
                                        {},
                                        { preserveState: true },
                                    )
                                }
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================== MODAL DE CRIAÇÃO ==================== */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            Cadastrar Novo Munícipe
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados pessoais do munícipe. Os dados
                            complementares podem ser adicionados posteriormente.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="my-4" />
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmitCreate)}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="nome_completo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Nome Completo *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: João Pedro da Silva"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="data_nascimento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Data de Nascimento *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sexo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Sexo *
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Selecione o sexo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="M">
                                                        Masculino
                                                    </SelectItem>
                                                    <SelectItem value="F">
                                                        Feminino
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="estado_civil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Estado Civil
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Solteiro">
                                                        Solteiro
                                                    </SelectItem>
                                                    <SelectItem value="Casado">
                                                        Casado
                                                    </SelectItem>
                                                    <SelectItem value="Divorciado">
                                                        Divorciado
                                                    </SelectItem>
                                                    <SelectItem value="Viúvo">
                                                        Viúvo
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="naturalidade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Naturalidade
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Benguela"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="id_municipio_naturalidade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Município de Naturalidade
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value?.toString()}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
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
                                    name="bi_numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Número do BI
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: 123456789LA042"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bi_data_emissao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Data de Emissão BI
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bi_data_validade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Data de Validade BI
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Telefone
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: 272123456"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="celular"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold">
                                                Celular
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: 923456789"
                                                    {...field}
                                                    className="h-11"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Separator className="my-4" />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    size="lg"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Cadastrar Munícipe
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL DE VISUALIZAÇÃO COMPLETO ==================== */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="rounded-full bg-primary/10 p-2">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            {selectedMunicipe?.nome_completo}
                        </DialogTitle>
                        <DialogDescription>
                            Detalhes completos do munícipe • Código: #
                            {selectedMunicipe?.id}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="my-4" />
                    {selectedMunicipe && (
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="grid h-12 w-full grid-cols-5">
                                <TabsTrigger value="pessoal" className="gap-2">
                                    <User className="h-4 w-4" />
                                    Pessoais
                                </TabsTrigger>
                                <TabsTrigger
                                    value="biografico"
                                    className="gap-2"
                                >
                                    <FileText className="h-4 w-4" />
                                    Biográficos
                                </TabsTrigger>
                                <TabsTrigger
                                    value="complementar"
                                    className="gap-2"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    Complementares
                                </TabsTrigger>
                                <TabsTrigger value="endereco" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Endereço
                                </TabsTrigger>
                                <TabsTrigger
                                    value="recrutamento"
                                    className="gap-2"
                                >
                                    <Users className="h-4 w-4" />
                                    Recrutamento
                                </TabsTrigger>
                            </TabsList>

                            {/* Dados Pessoais */}
                            <TabsContent value="pessoal" className="pt-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Informações Pessoais
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Data Nascimento:
                                                </span>
                                                <span className="font-medium">
                                                    {format(
                                                        new Date(
                                                            selectedMunicipe.data_nascimento,
                                                        ),
                                                        'dd/MM/yyyy',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Idade:
                                                </span>
                                                <span className="font-medium">
                                                    {new Date().getFullYear() -
                                                        new Date(
                                                            selectedMunicipe.data_nascimento,
                                                        ).getFullYear()}{' '}
                                                    anos
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Sexo:
                                                </span>
                                                <Badge
                                                    variant={
                                                        selectedMunicipe.sexo ===
                                                        'M'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {selectedMunicipe.sexo ===
                                                    'M'
                                                        ? 'Masculino'
                                                        : 'Feminino'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Estado Civil:
                                                </span>
                                                <span>
                                                    {selectedMunicipe.estado_civil ||
                                                        'Não informado'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Documentação
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    BI Número:
                                                </span>
                                                <span className="font-mono">
                                                    {selectedMunicipe.bi_numero ||
                                                        '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Validade:
                                                </span>
                                                <span>
                                                    {selectedMunicipe.bi_data_validade
                                                        ? format(
                                                              new Date(
                                                                  selectedMunicipe.bi_data_validade,
                                                              ),
                                                              'dd/MM/yyyy',
                                                          )
                                                        : '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Naturalidade:
                                                </span>
                                                <span>
                                                    {selectedMunicipe.naturalidade ||
                                                        '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Município:
                                                </span>
                                                <span>
                                                    {selectedMunicipe
                                                        .municipio_naturalidade
                                                        ?.nome || '—'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Contactos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Telefone:
                                                </span>
                                                <span>
                                                    {selectedMunicipe.telefone ||
                                                        '—'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Celular:
                                                </span>
                                                <span>
                                                    {selectedMunicipe.celular ||
                                                        '—'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="md:col-span-2 lg:col-span-3">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Progenitores
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium">
                                                        Pai:
                                                    </span>
                                                </div>
                                                <span>
                                                    {selectedMunicipe.pai
                                                        ?.nome_completo ||
                                                        'Não informado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                                                <div className="flex items-center gap-2">
                                                    <Heart className="h-4 w-4 text-pink-500" />
                                                    <span className="font-medium">
                                                        Mãe:
                                                    </span>
                                                </div>
                                                <span>
                                                    {selectedMunicipe.mae
                                                        ?.nome_completo ||
                                                        'Não informado'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Dados Biográficos */}
                            <TabsContent value="biografico" className="pt-6">
                                {selectedMunicipe.dados_biograficos ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        NIP
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .nip || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Assento Número
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .assento_numero ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Registo Civil
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .registro_civil ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Nº Registo
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .registro_numero ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Nº Cédula
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .cedula_numero ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Nº Filhos
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .numero_filhos ?? 0}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Vencimento
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .vencimento
                                                            ? `${selectedMunicipe.dados_biograficos.vencimento.toLocaleString()} Kz`
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Ramo Actividade
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .ramo_actividade ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Ramo
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .ramo || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Ano Incorporação
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .ano_incorporacao ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Ano Abandono
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .ano_abandono ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Anos Serviço
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .ano_servico ?? '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Modo de Vida
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_biograficos
                                                            .modo_vida || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            Nenhum dado biográfico registado
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Clique no botão abaixo para
                                            adicionar
                                        </p>
                                        <Button
                                            onClick={() =>
                                                openBiograficoModal(
                                                    selectedMunicipe,
                                                )
                                            }
                                            className="mt-4 gap-2"
                                        >
                                            <Plus className="h-4 w-4" />{' '}
                                            Adicionar Dados Biográficos
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Dados Complementares */}
                            <TabsContent value="complementar" className="pt-6">
                                {selectedMunicipe.dados_complementares ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Caixa Postal
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .caixa_postal ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        NIF
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .nif || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Encargos Familiares
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .encargo_familiar ??
                                                            0}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Habilitação Literária
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .habilitacao_literaria ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Profissão
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .profissao || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Nº Irmãos
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .numero_irmaos ?? 0}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Entidade Emissora BI
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .entidade_emissora_bi ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Nº Carta Condução
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .numero_carta_conducao ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Data Emissão Carta
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .data_emissao_carta
                                                            ? format(
                                                                  new Date(
                                                                      selectedMunicipe
                                                                          .dados_complementares
                                                                          .data_emissao_carta,
                                                                  ),
                                                                  'dd/MM/yyyy',
                                                              )
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Data Validade Carta
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .data_validade_carta
                                                            ? format(
                                                                  new Date(
                                                                      selectedMunicipe
                                                                          .dados_complementares
                                                                          .data_validade_carta,
                                                                  ),
                                                                  'dd/MM/yyyy',
                                                              )
                                                            : '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Atributo
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .dados_complementares
                                                            .atributo || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Briefcase className="mb-4 h-16 w-16 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            Nenhum dado complementar registado
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Clique no botão abaixo para
                                            adicionar
                                        </p>
                                        <Button
                                            onClick={() =>
                                                openComplementarModal(
                                                    selectedMunicipe,
                                                )
                                            }
                                            className="mt-4 gap-2"
                                        >
                                            <Plus className="h-4 w-4" />{' '}
                                            Adicionar Dados Complementares
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Endereço */}
                            <TabsContent value="endereco" className="pt-6">
                                {selectedMunicipe.endereco ? (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Morada
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .endereco.morada ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Localidade
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .endereco
                                                            .localidade || '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Comuna
                                                    </p>
                                                    <p className="font-medium">
                                                        {selectedMunicipe
                                                            .endereco.comuna ||
                                                            '—'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="space-y-2">
                                                    <p className="text-sm text-muted-foreground">
                                                        Província / Município
                                                    </p>
                                                    <p className="font-medium">
                                                        {
                                                            selectedMunicipe
                                                                .endereco
                                                                .provincia?.nome
                                                        }{' '}
                                                        /{' '}
                                                        {
                                                            selectedMunicipe
                                                                .endereco
                                                                .municipio?.nome
                                                        }
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <MapPin className="mb-4 h-16 w-16 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            Nenhum endereço registado
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Clique no botão abaixo para
                                            adicionar
                                        </p>
                                        <Button
                                            onClick={() =>
                                                openEnderecoModal(
                                                    selectedMunicipe,
                                                )
                                            }
                                            className="mt-4 gap-2"
                                        >
                                            <Plus className="h-4 w-4" />{' '}
                                            Adicionar Endereço
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Recrutamento */}
                            <TabsContent value="recrutamento" className="pt-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="text-lg font-semibold">
                                        Histórico de Recrutamento
                                    </h4>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            openRecrutamentoModal(
                                                selectedMunicipe,
                                            )
                                        }
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" /> Novo
                                        Recrutamento
                                    </Button>
                                </div>
                                {selectedMunicipe.recrutamentos &&
                                selectedMunicipe.recrutamentos.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedMunicipe.recrutamentos.map(
                                            (rec) => (
                                                <Card
                                                    key={rec.id}
                                                    className="transition-shadow hover:shadow-md"
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">
                                                                        {format(
                                                                            new Date(
                                                                                rec.data_recruta,
                                                                            ),
                                                                            'dd/MM/yyyy',
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                {rec.observacoes && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            rec.observacoes
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {rec.estado ===
                                                                    0 && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="gap-1"
                                                                    >
                                                                        <Clock className="h-3 w-3" />
                                                                        Pendente
                                                                    </Badge>
                                                                )}
                                                                {rec.estado ===
                                                                    1 && (
                                                                    <Badge className="gap-1 bg-green-500">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Aprovado
                                                                    </Badge>
                                                                )}
                                                                {rec.estado ===
                                                                    2 && (
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="gap-1"
                                                                    >
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        Rejeitado
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="mb-4 h-16 w-16 text-muted-foreground" />
                                        <p className="text-lg font-medium">
                                            Nenhum recrutamento registado
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Clique no botão acima para registrar
                                        </p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                    <Separator className="my-4" />
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsViewOpen(false)}
                            size="lg"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL DADOS BIOGRÁFICOS ==================== */}
            <Dialog open={isBiograficoOpen} onOpenChange={setIsBiograficoOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Dados Biográficos
                        </DialogTitle>
                        <DialogDescription>
                            Complete as informações biográficas do munícipe
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...biograficoForm}>
                        <form
                            onSubmit={biograficoForm.handleSubmit(
                                onSubmitBiografico,
                            )}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <FormField
                                    control={biograficoForm.control}
                                    name="nip"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NIP</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="assento_numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Assento Número
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="registro_civil"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registo Civil</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="registro_numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nº Registo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="cedula_numero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nº Cédula</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="numero_filhos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nº Filhos</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="vencimento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Vencimento (Kz)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="ramo_actividade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Ramo Actividade
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="ramo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ramo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="ano_incorporacao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Ano Incorporação
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="ano_abandono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ano Abandono</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="ano_servico"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Anos de Serviço
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={biograficoForm.control}
                                    name="modo_vida"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modo de Vida</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsBiograficoOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL DADOS COMPLEMENTARES ==================== */}
            <Dialog
                open={isComplementarOpen}
                onOpenChange={setIsComplementarOpen}
            >
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Dados Complementares
                        </DialogTitle>
                        <DialogDescription>
                            Complete as informações complementares do munícipe
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...complementarForm}>
                        <form
                            onSubmit={complementarForm.handleSubmit(
                                onSubmitComplementar,
                            )}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <FormField
                                    control={complementarForm.control}
                                    name="caixa_postal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Caixa Postal</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="nif"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NIF</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="encargo_familiar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Encargos Familiares
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="habilitacao_literaria"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Habilitação Literária
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="profissao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profissão</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="numero_irmaos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nº Irmãos</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="entidade_emissora_bi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Entidade Emissora BI
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="numero_carta_conducao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Nº Carta Condução
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="data_emissao_carta"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Data Emissão Carta
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="data_validade_carta"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Data Validade Carta
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={complementarForm.control}
                                    name="atributo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Atributo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsComplementarOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL ENDEREÇO ==================== */}
            <Dialog open={isEnderecoOpen} onOpenChange={setIsEnderecoOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Endereço do Munícipe
                        </DialogTitle>
                        <DialogDescription>
                            Registe o endereço completo do munícipe
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...enderecoForm}>
                        <form
                            onSubmit={enderecoForm.handleSubmit(
                                onSubmitEndereco,
                            )}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={enderecoForm.control}
                                    name="morada"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Morada</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Rua 15, Casa 10"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={enderecoForm.control}
                                    name="localidade"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localidade</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Centro"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={enderecoForm.control}
                                    name="comuna"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comuna</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Benguela"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={enderecoForm.control}
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
                                                        <SelectValue placeholder="Selecione" />
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
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEnderecoOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Salvar Endereço
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL RECRUTAMENTO ==================== */}
            <Dialog
                open={isRecrutamentoOpen}
                onOpenChange={setIsRecrutamentoOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Registar Recrutamento
                        </DialogTitle>
                        <DialogDescription>
                            Para {selectedMunicipe?.nome_completo}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...recrutamentoForm}>
                        <form
                            onSubmit={recrutamentoForm.handleSubmit(
                                onSubmitRecrutamento,
                            )}
                            className="space-y-4"
                        >
                            <FormField
                                control={recrutamentoForm.control}
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
                                control={recrutamentoForm.control}
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
                                control={recrutamentoForm.control}
                                name="observacoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observações</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Observações adicionais..."
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsRecrutamentoOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Registar Recrutamento
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
