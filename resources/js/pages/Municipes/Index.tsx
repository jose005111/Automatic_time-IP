import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

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
import { Textarea } from '@/components/ui/textarea';
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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    Home,
    Users,
    Briefcase,
    Heart,
    AlertCircle,
    CheckCircle,
    Clock,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowRightLeft,
    UserCheck,
    UserX,
    Download,
    FileDown,
    Mail,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import generateFichaMunicipePDF from './../../lib/pdf/generateFichaMunicipePDF';
// ...
// ─── TIPOS ────────────────────────────────────────────────────────────────────

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
    sexo?: string;
    profissao?: string;
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
interface Transferencia {
    id: number;
    data_solicitacao: string;
    local_destino?: string;
    estado: number;
    data_aprovacao?: string;
    municipio_destino?: Municipio;
}
interface Recrutamento {
    id: number;
    data_recruta: string;
    estado: number;
    observacoes?: string;
    created_at?: string;
    transferencias?: Transferencia[];
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
    email?: string;
    foto_url?: string;
    foto?: string;
    user?: { id: number; email: string };
    usuarios?: { id: number; id_municipe: number; email: string }[];
}
interface Stats {
    total: number;
    masculino: number;
    feminino: number;
    com_bi: number;
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
    progenitores: Progenitor[];
    filters: {
        search?: string;
        sexo?: string;
        estado_civil?: string;
        has_bi?: string;
    };
    stats: Stats;
}

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const municipeSchema = z.object({
    nome_completo: z
        .string()
        .min(3, 'Informe o nome completo (mínimo 3 caracteres).'),
    data_nascimento: z.string().min(1, 'Informe a data de nascimento.'),
    sexo: z.enum(['M', 'F'], { error: 'Selecione o sexo.' }),
    estado_civil: z.string().optional(),
    naturalidade: z.string().optional(),
    id_municipio_naturalidade: z.number().optional(),
    bi_numero: z.string().optional(),
    bi_data_emissao: z.string().optional(),
    bi_data_validade: z.string().optional(),
    telefone: z.string().optional(),
    celular: z.string().optional(),
    id_pai: z.number().optional(),
    id_mae: z.number().optional(),
    email: z
        .string()
        .email('Informe um email válido.')
        .optional()
        .or(z.literal('')),
});

const biograficoSchema = z.object({
    nip: z.string().optional(),
    assento_numero: z.string().optional(),
    registro_civil: z.string().optional(),
    registro_numero: z.string().optional(),
    cedula_numero: z.string().optional(),
    numero_filhos: z.number().min(0).optional(),
    vencimento: z.string().min(0).optional(),
    ramo_actividade: z.string().optional(),
    ramo: z.string().optional(),
    ano_incorporacao: z
        .number()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    ano_abandono: z
        .number()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional(),
    ano_servico: z.number().min(0).optional(),
    modo_vida: z.string().optional(),
});

const complementarSchema = z.object({
    caixa_postal: z.string().optional(),
    nif: z.string().optional(),
    encargo_familiar: z.number().min(0).optional(),
    habilitacao_literaria: z.string().optional(),
    profissao: z.string().optional(),
    numero_irmaos: z.number().min(0).optional(),
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
    id_provincia: z.number().optional(),
    id_municipio: z.number().optional(),
});

const recrutamentoSchema = z.object({
    data_recruta: z.string().min(1, 'Informe a data de recruta.'),
    estado: z.number().min(0).max(2),
    observacoes: z.string().optional(),
});

const transferenciaSchema = z.object({
    data_solicitacao: z.string().min(1, 'Informe a data da solicitação.'),
    id_municipio_destino: z.number().optional(),
    local_destino: z.string().optional(),
    estado: z.number().min(0).max(2),
});

const progenitorSchema = z.object({
    nome_completo: z
        .string()
        .min(3, 'Informe o nome completo (mínimo 3 caracteres).'),
    data_nascimento: z.string().optional(),
    naturalidade: z.string().optional(),
    profissao: z.string().optional(),
    sexo: z.enum(['M', 'F'], { error: 'Selecione o sexo.' }).optional(),
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const toDateInputValue = (value?: string | null): string => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? ''
        : `${parsed.getFullYear().toString().padStart(4, '0')}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`;
};

const toLocalDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const dateOnly = toDateInputValue(value);
    if (dateOnly) {
        const [ano, mes, dia] = dateOnly.split('-').map(Number);
        return new Date(ano, mes - 1, dia, 12);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nasc = toLocalDate(dataNascimento);
    if (!nasc) return 0;
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (
        hoje.getMonth() - nasc.getMonth() < 0 ||
        (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
    )
        idade--;
    return idade;
};

const formatDate = (d?: string) => {
    const parsed = toLocalDate(d);
    return parsed ? format(parsed, 'dd/MM/yyyy') : '—';
};

/** Verifica se um munícipe tem recrutamento aprovado (bloqueia novo recrutamento) */
const temRecrutamentoAprovado = (m: Municipe) =>
    (m.recrutamentos || []).some((r) => r.estado === 1);

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

const EstadoBadge = ({ estado }: { estado: number }) => {
    if (estado === 1)
        return (
            <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600">
                <CheckCircle className="h-3 w-3" />
                Aprovado
            </Badge>
        );
    if (estado === 2)
        return (
            <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Rejeitado
            </Badge>
        );
    return (
        <Badge
            variant="secondary"
            className="gap-1 bg-amber-100 text-amber-700"
        >
            <Clock className="h-3 w-3" />
            Pendente
        </Badge>
    );
};

const StatCard = ({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: number | string;
    icon: any;
    color: string;
}) => (
    <Card className="relative overflow-hidden border-0 shadow-sm">
        <div className={`absolute inset-0 opacity-5 ${color}`} />
        <CardContent className="p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${color} bg-opacity-10`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children}
    </div>
);

const ROTULOS_ERRO: Record<string, string> = {
    nome_completo: 'Nome completo',
    data_nascimento: 'Data de nascimento',
    sexo: 'Sexo',
    estado_civil: 'Estado civil',
    naturalidade: 'Naturalidade',
    id_municipio_naturalidade: 'Município de naturalidade',
    bi_numero: 'Número do BI',
    bi_data_emissao: 'Emissão do BI',
    bi_data_validade: 'Validade do BI',
    telefone: 'Telefone',
    celular: 'Celular',
    email: 'Email de acesso',
    id_pai: 'Pai',
    id_mae: 'Mãe',
    nip: 'NIP',
    assento_numero: 'Assento nº',
    registro_civil: 'Registo civil',
    registro_numero: 'Nº de registo',
    cedula_numero: 'Cédula nº',
    numero_filhos: 'Nº de filhos',
    vencimento: 'Vencimento',
    ramo_actividade: 'Ramo de actividade',
    ramo: 'Ramo',
    ano_incorporacao: 'Ano de incorporação',
    ano_abandono: 'Ano de abandono',
    ano_servico: 'Ano de serviço',
    modo_vida: 'Modo de vida',
    caixa_postal: 'Caixa postal',
    nif: 'NIF',
    encargo_familiar: 'Encargo familiar',
    habilitacao_literaria: 'Habilitação literária',
    profissao: 'Profissão',
    numero_irmaos: 'Nº de irmãos',
    entidade_emissora_bi: 'Entidade emissora do BI',
    numero_carta_conducao: 'Nº da carta de condução',
    data_emissao_carta: 'Emissão da carta',
    data_validade_carta: 'Validade da carta',
    atributo: 'Atributo',
    morada: 'Morada',
    localidade: 'Localidade',
    comuna: 'Comuna',
    id_provincia: 'Província',
    id_municipio: 'Município',
    data_recruta: 'Data de recruta',
    observacoes: 'Observações',
    estado: 'Estado',
    data_solicitacao: 'Data da solicitação',
    id_municipio_destino: 'Município de destino',
    local_destino: 'Local de destino',
    foto: 'Fotografia',
};

const ServerErrorBanner = ({ mensagens }: { mensagens: string[] }) =>
    mensagens.length === 0 ? null : (
        <div
            role="alert"
            className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
            <p className="font-semibold">Não foi possível guardar:</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {mensagens.map((mensagem, indice) => (
                    <li key={indice}>{mensagem}</li>
                ))}
            </ul>
        </div>
    );

const SubmitBtn = ({
    label,
    isSubmitting,
}: {
    label: string;
    isSubmitting: boolean;
}) => (
    <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
    </Button>
);

// ─── COMBOBOX DE PROGENITORES (pesquisa assíncrona) ───────────────────────────

interface ProgenitorComboboxProps {
    value?: number;
    onChange: (id: number | undefined) => void;
    sexoFiltro?: 'M' | 'F';
    placeholder: string;
    progenitoresIniciais: Progenitor[];
}

function ProgenitorCombobox({
    value,
    onChange,
    sexoFiltro,
    placeholder,
    progenitoresIniciais,
}: ProgenitorComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Progenitor[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Progenitor seleccionado
    const selected =
        progenitoresIniciais.find((p) => p.id === value) ||
        results.find((p) => p.id === value);

    const buscar = useCallback(
        (q: string) => {
            setLoading(true);
            const params = new URLSearchParams({ q });
            if (sexoFiltro) params.append('sexo', sexoFiltro);

            fetch(`/progenitores/search?${params}`, {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((r) => r.json())
                .then((data) => setResults(data))
                .catch(() => setResults([]))
                .finally(() => setLoading(false));
        },
        [sexoFiltro],
    );

    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => buscar(query), 250);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, open, buscar]);

    useEffect(() => {
        if (open) buscar('');
    }, [open]);

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            )
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const lista =
        results.length > 0
            ? results
            : progenitoresIniciais
                  .filter(
                      (p) => !sexoFiltro || p.sexo === sexoFiltro || !p.sexo,
                  )
                  .filter(
                      (p) =>
                          !query ||
                          p.nome_completo
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                  )
                  .slice(0, 20);

    return (
        <div ref={wrapperRef} className="relative">
            <div
                onClick={() => setOpen((o) => !o)}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring"
            >
                <span className={selected ? '' : 'text-muted-foreground'}>
                    {selected ? selected.nome_completo : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(undefined);
                                setQuery('');
                            }}
                            className="rounded p-0.5 hover:bg-muted"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    <div className="border-b p-2">
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquisar nome..."
                            className="w-full rounded border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Pesquisando...
                            </div>
                        )}
                        {!loading && lista.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Nenhum resultado
                            </p>
                        )}
                        {!loading &&
                            lista.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(p.id);
                                        setOpen(false);
                                        setQuery('');
                                    }}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent ${value === p.id ? 'bg-accent font-medium' : ''}`}
                                >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                        {p.nome_completo.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="leading-tight">
                                            {p.nome_completo}
                                        </p>
                                        {p.profissao && (
                                            <p className="text-xs text-muted-foreground">
                                                {p.profissao}
                                            </p>
                                        )}
                                    </div>
                                    {value === p.id && (
                                        <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
                                    )}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({
    icon: Icon,
    label,
    children,
}: {
    icon: any;
    label: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
            <Icon className="h-12 w-12 opacity-30" />
            <p className="font-medium">{label}</p>
            {children}
        </div>
    );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function MunicipesIndex({
    municipes,
    provincias,
    municipios,
    progenitores: progenitoresIniciais,
    filters: initialFilters,
    stats,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Munícipes', href: '/municipes' },
    ];

    // ── modais
    const [modal, setModal] = useState<
        | 'create'
        | 'edit'
        | 'view'
        | 'biografico'
        | 'complementar'
        | 'endereco'
        | 'recrutamento'
        | 'transferencia'
        | 'progenitor'
        | null
    >(null);
    // Guarda o modal que estava aberto antes de abrir o modal de progenitor,
    // para poder restaurá-lo quando o progenitor fechar.
    const [previousModal, setPreviousModal] = useState<
        'create' | 'edit' | null
    >(null);
    const [selected, setSelected] = useState<Municipe | null>(null);
    const [selectedRecrutamento, setSelectedRecrutamento] =
        useState<Recrutamento | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Municipe | null>(null);
    const [activeTab, setActiveTab] = useState('pessoal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const [progenitorRole, setProgenitorRole] = useState<'pai' | 'mae'>('pai');

    // Lista local de progenitores (actualizada após cadastrar novo)
    const [progenitores, setProgenitores] =
        useState<Progenitor[]>(progenitoresIniciais);

    // ── filtros
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [sexoFilter, setSexoFilter] = useState(initialFilters.sexo || '');
    const [estadoCivilFilter, setEstadoCivilFilter] = useState(
        initialFilters.estado_civil || '',
    );
    const [hasBiFilter, setHasBiFilter] = useState(initialFilters.has_bi || '');
    const hasActiveFilters = !!(
        searchTerm ||
        sexoFilter ||
        estadoCivilFilter ||
        hasBiFilter
    );

    // ─── forms
    type MunicipeFormType = z.infer<typeof municipeSchema>;
    type BiograficoFormType = z.infer<typeof biograficoSchema>;
    type ComplementarFormType = z.infer<typeof complementarSchema>;
    type EnderecoFormType = z.infer<typeof enderecoSchema>;
    type RecrutamentoFormType = z.infer<typeof recrutamentoSchema>;
    type TransferenciaFormType = z.infer<typeof transferenciaSchema>;
    type ProgenitorFormType = z.infer<typeof progenitorSchema>;

    const form = useForm<MunicipeFormType, unknown, MunicipeFormType>({
        resolver: zodResolver(municipeSchema) as any,
        defaultValues: { sexo: 'M' },
    });
    const biograficoForm = useForm<
        BiograficoFormType,
        unknown,
        BiograficoFormType
    >({
        resolver: zodResolver(biograficoSchema) as any,
    });
    const complementarForm = useForm<
        ComplementarFormType,
        unknown,
        ComplementarFormType
    >({
        resolver: zodResolver(complementarSchema) as any,
    });
    const enderecoForm = useForm<EnderecoFormType, unknown, EnderecoFormType>({
        resolver: zodResolver(enderecoSchema) as any,
    });
    const recrutamentoForm = useForm<
        RecrutamentoFormType,
        unknown,
        RecrutamentoFormType
    >({
        resolver: zodResolver(recrutamentoSchema) as any,
        defaultValues: {
            estado: 0,
            data_recruta: new Date().toISOString().split('T')[0],
        },
    });
    const transferenciaForm = useForm<
        TransferenciaFormType,
        unknown,
        TransferenciaFormType
    >({
        resolver: zodResolver(transferenciaSchema) as any,
        defaultValues: {
            estado: 0,
            data_solicitacao: new Date().toISOString().split('T')[0],
        },
    });
    const progenitorForm = useForm<
        ProgenitorFormType,
        unknown,
        ProgenitorFormType
    >({
        resolver: zodResolver(progenitorSchema) as any,
        defaultValues: { sexo: 'M' },
    });

    const limparErros = () => {
        setServerErrors([]);
        form.clearErrors();
        biograficoForm.clearErrors();
        complementarForm.clearErrors();
        enderecoForm.clearErrors();
        recrutamentoForm.clearErrors();
        transferenciaForm.clearErrors();
        progenitorForm.clearErrors();
    };

    const aplicarErrosServidor = (
        errors: Record<string, string | string[]>,
        f: UseFormReturn<any>,
    ) => {
        setIsSubmitting(false);
        limparErros();
        const mensagens: string[] = [];

        Object.entries(errors).forEach(([campo, valor]) => {
            const mensagem = Array.isArray(valor)
                ? valor.join(' ')
                : String(valor);
            const rotulo = ROTULOS_ERRO[campo] ?? campo;
            mensagens.push(`${rotulo}: ${mensagem}`);

            if (campo in f.getValues()) {
                f.setError(campo as any, {
                    type: 'server',
                    message: mensagem,
                });
            }
        });

        setServerErrors(mensagens);
        if (mensagens.length > 0) {
            toast.error('Não foi possível guardar. Corrija os erros indicados.');
        }
    };

    useEffect(() => {
        limparErros();
    }, [modal]);

    const watchedProvincia = enderecoForm.watch('id_provincia');
    const municipiosFiltrados = watchedProvincia
        ? municipios.filter((m) => m.id_provincia === Number(watchedProvincia))
        : municipios;

    // ── filtros e navegação
    const applyFilters = () => {
        const params: Record<string, string> = {};
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

    const submit = (routeFn: () => void) => {
        setIsSubmitting(true);
        routeFn();
    };

    const normalizarDatasMunicipe = (v: MunicipeFormType): MunicipeFormType => ({
        ...v,
        data_nascimento: toDateInputValue(v.data_nascimento),
        bi_data_emissao: toDateInputValue(v.bi_data_emissao),
        bi_data_validade: toDateInputValue(v.bi_data_validade),
    });

    const normalizarDatasComplementar = (
        v: ComplementarFormType,
    ): ComplementarFormType => ({
        ...v,
        data_emissao_carta: toDateInputValue(v.data_emissao_carta),
        data_validade_carta: toDateInputValue(v.data_validade_carta),
    });

    // ── abrir modais
    const openCreate = () => {
        form.reset({ sexo: 'M' });
        setModal('create');
    };

    const openEdit = (m: Municipe) => {
        setSelected(m);
        form.reset({
            nome_completo: m.nome_completo,
            data_nascimento: toDateInputValue(m.data_nascimento),
            sexo: m.sexo as 'M' | 'F',
            estado_civil: m.estado_civil || '',
            naturalidade: m.naturalidade || '',
            id_municipio_naturalidade: m.id_municipio_naturalidade ?? undefined,
            bi_numero: m.bi_numero || '',
            bi_data_emissao: toDateInputValue(m.bi_data_emissao),
            bi_data_validade: toDateInputValue(m.bi_data_validade),
            telefone: m.telefone || '',
            celular: m.celular || '',
            id_pai: m.id_pai ?? m.pai?.id,
            id_mae: m.id_mae ?? m.mae?.id,
            email: m.usuarios?.[0]?.email ?? m.user?.email ?? '',
        });
        setModal('edit');
    };

    const openView = (m: Municipe) => {
        setSelected(m);
        setActiveTab('pessoal');
        setModal('view');
    };
    const openBiografico = (m: Municipe) => {
        const b = m.dados_biograficos;
        setSelected(m);
        biograficoForm.reset({
            nip: b?.nip ?? '',
            assento_numero: b?.assento_numero ?? '',
            registro_civil: b?.registro_civil ?? '',
            registro_numero: b?.registro_numero ?? '',
            cedula_numero: b?.cedula_numero ?? '',
            numero_filhos: b?.numero_filhos ?? undefined,
            vencimento:
                b?.vencimento !== null && b?.vencimento !== undefined
                    ? String(b.vencimento)
                    : undefined,
            ramo_actividade: b?.ramo_actividade ?? '',
            ramo: b?.ramo ?? '',
            ano_incorporacao: b?.ano_incorporacao ?? undefined,
            ano_abandono: b?.ano_abandono ?? undefined,
            ano_servico: b?.ano_servico ?? undefined,
            modo_vida: b?.modo_vida ?? '',
        });
        setModal('biografico');
    };
    const openComplementar = (m: Municipe) => {
        const c = m.dados_complementares;
        setSelected(m);
        complementarForm.reset({
            caixa_postal: c?.caixa_postal ?? '',
            nif: c?.nif ?? '',
            encargo_familiar: c?.encargo_familiar ?? undefined,
            habilitacao_literaria: c?.habilitacao_literaria ?? '',
            profissao: c?.profissao ?? '',
            numero_irmaos: c?.numero_irmaos ?? undefined,
            entidade_emissora_bi: c?.entidade_emissora_bi ?? '',
            numero_carta_conducao: c?.numero_carta_conducao ?? '',
            data_emissao_carta: toDateInputValue(c?.data_emissao_carta),
            data_validade_carta: toDateInputValue(c?.data_validade_carta),
            atributo: c?.atributo ?? '',
        });
        setModal('complementar');
    };

    const openEndereco = (m: Municipe) => {
        setSelected(m);
        enderecoForm.reset({
            morada: m.endereco?.morada || '',
            localidade: m.endereco?.localidade || '',
            comuna: m.endereco?.comuna || '',
            id_provincia: m.endereco?.id_provincia ?? undefined,
            id_municipio: m.endereco?.id_municipio ?? undefined,
        });
        setModal('endereco');
    };

    const openRecrutamento = (m: Municipe) => {
        setSelected(m);
        recrutamentoForm.reset({
            data_recruta: new Date().toISOString().split('T')[0],
            estado: 0,
            observacoes: '',
        });
        setModal('recrutamento');
    };

    const openTransferencia = (m: Municipe, rec: Recrutamento) => {
        setSelected(m);
        setSelectedRecrutamento(rec);
        transferenciaForm.reset({
            data_solicitacao: new Date().toISOString().split('T')[0],
            estado: 0,
        });
        setModal('transferencia');
    };

    const openProgenitor = (role: 'pai' | 'mae') => {
        // Guarda qual modal estava aberto para restaurar depois
        if (modal === 'create' || modal === 'edit') {
            setPreviousModal(modal);
        }
        setProgenitorRole(role);
        progenitorForm.reset({ sexo: role === 'pai' ? 'M' : 'F' });
        setModal('progenitor');
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setSelectedRecrutamento(null);
        setIsSubmitting(false);
        setPreviousModal(null);
    };

    // Fecha apenas o modal de progenitor e restaura o modal anterior (create/edit)
    const closeProgenitorModal = () => {
        setIsSubmitting(false);
        if (previousModal) {
            setModal(previousModal);
            setPreviousModal(null);
        } else {
            closeModal();
        }
    };

    // ── submits
    const onCreateSubmit = (v: z.infer<typeof municipeSchema>) =>
        submit(() =>
            router.post('/municipes', normalizarDatasMunicipe(v), {
                onSuccess: closeModal,
                onError: (errors) => aplicarErrosServidor(errors, form),
            }),
        );

    const onEditSubmit = (v: z.infer<typeof municipeSchema>) => {
        if (!selected) return;
        submit(() =>
            router.put(
                `/municipes/${selected.id}`,
                normalizarDatasMunicipe(v),
                {
                    onSuccess: closeModal,
                    onError: (errors) => aplicarErrosServidor(errors, form),
                },
            ),
        );
    };

    const onBiograficoSubmit = (v: z.infer<typeof biograficoSchema>) => {
        if (!selected) return;
        submit(() =>
            router.post(`/municipes/${selected.id}/biografico`, v, {
                onSuccess: closeModal,
                onError: (errors) =>
                    aplicarErrosServidor(errors, biograficoForm),
            }),
        );
    };

    const onComplementarSubmit = (v: z.infer<typeof complementarSchema>) => {
        if (!selected) return;
        submit(() =>
            router.post(
                `/municipes/${selected.id}/complementar`,
                normalizarDatasComplementar(v),
                {
                    onSuccess: closeModal,
                    onError: (errors) =>
                        aplicarErrosServidor(errors, complementarForm),
                },
            ),
        );
    };

    const onEnderecoSubmit = (v: z.infer<typeof enderecoSchema>) => {
        if (!selected) return;
        submit(() =>
            router.post(`/municipes/${selected.id}/endereco`, v, {
                onSuccess: closeModal,
                onError: (errors) =>
                    aplicarErrosServidor(errors, enderecoForm),
            }),
        );
    };

    const onRecrutamentoSubmit = (v: z.infer<typeof recrutamentoSchema>) => {
        if (!selected) return;
        submit(() =>
            router.post(`/municipes/${selected.id}/recrutamento`, v, {
                onSuccess: closeModal,
                onError: (errors) =>
                    aplicarErrosServidor(errors, recrutamentoForm),
            }),
        );
    };

    const onTransferenciaSubmit = (v: z.infer<typeof transferenciaSchema>) => {
        if (!selected || !selectedRecrutamento) return;
        submit(() =>
            router.post(
                `/municipes/${selected.id}/recrutamento/${selectedRecrutamento.id}/transferencia`,
                v,
                {
                    onSuccess: closeModal,
                    onError: (errors) =>
                        aplicarErrosServidor(errors, transferenciaForm),
                },
            ),
        );
    };

    /**
     * Cadastra progenitor via fetch JSON para obter o ID devolvido e auto-seleccionar.
     */
    const onProgenitorSubmit = async (v: z.infer<typeof progenitorSchema>) => {
        setIsSubmitting(true);
        try {
            // Lê o token CSRF da meta tag injectada pelo Blade
            const csrfToken =
                document.querySelector<HTMLMetaElement>(
                    'meta[name="csrf-token"]',
                )?.content ?? '';

            const res = await fetch('/progenitores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(v),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                aplicarErrosServidor(
                    err.errors ?? {
                        form: err.message ?? 'Erro ao cadastrar progenitor.',
                    },
                    progenitorForm,
                );
                return;
            }

            const novo: Progenitor = await res.json();

            // Actualiza lista local
            setProgenitores((prev) =>
                [...prev, novo].sort((a, b) =>
                    a.nome_completo.localeCompare(b.nome_completo),
                ),
            );

            // Auto-selecciona no formulário pai/mãe com base no sexo preenchido
            // M → pai, F → mãe (independentemente de como o modal foi aberto)
            if (v.sexo === 'F') {
                form.setValue('id_mae', novo.id);
            } else {
                // M ou não preenchido → pai
                form.setValue('id_pai', novo.id);
            }

            const papel = v.sexo === 'F' ? 'Mãe' : 'Pai';
            toast.success(
                `${papel} "${novo.nome_completo}" cadastrado e seleccionado!`,
                {
                    duration: 3500,
                    style: {
                        borderRadius: '10px',
                        background: '#f0fdf4',
                        color: '#14532d',
                        border: '1px solid #bbf7d0',
                        fontWeight: '500',
                        fontSize: '14px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                    iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
                },
            );

            // Fecha o modal de progenitor e volta ao modal anterior (create/edit)
            closeProgenitorModal();
        } catch {
            setIsSubmitting(false);
            toast.error('Erro ao cadastrar progenitor. Tente novamente.', {
                duration: 5000,
                style: {
                    borderRadius: '10px',
                    background: '#fef2f2',
                    color: '#7f1d1d',
                    border: '1px solid #fecaca',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
                iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
            });
        }
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/municipes/${deleteTarget.id}`, {
            onFinish: () => setDeleteTarget(null),
        });
    };
    const downloadPdf = (m: Municipe) => {
        generateFichaMunicipePDF(m)(); // chama imediatamente o handler retornado
    };
    // ─── Formulário munícipe com combobox de progenitores ─────────────────────
    const MunicipeFormFields = ({ f }: { f: typeof form }) => (
        <>
            <FieldGrid>
                <FormField
                    control={f.control}
                    name="nome_completo"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2 lg:col-span-2">
                            <FormLabel>Nome Completo *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: João Pedro da Silva"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="data_nascimento"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data de Nascimento *</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="sexo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sexo *</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Feminino</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="estado_civil"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado Civil</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || ''}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {[
                                        'Solteiro',
                                        'Casado',
                                        'Divorciado',
                                        'Viúvo',
                                    ].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="naturalidade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Naturalidade</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Benguela" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="id_municipio_naturalidade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Município de Naturalidade</FormLabel>
                            <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {municipios.map((m) => (
                                        <SelectItem
                                            key={m.id}
                                            value={m.id.toString()}
                                        >
                                            {m.nome}
                                            {m.provincia &&
                                                ` (${m.provincia.nome})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="bi_numero"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Número do BI</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: 123456789LA042"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="bi_data_emissao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Emissão BI</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="bi_data_validade"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Validade BI</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="telefone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: 272123456" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="celular"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Celular</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: 923456789" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={f.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                Email de Acesso
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    {...field}
                                />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                                Cria uma conta para o munícipe aceder ao sistema
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </FieldGrid>

            {/* ── PROGENITORES com combobox pesquisável ── */}
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                        Progenitores
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => openProgenitor('pai')}
                    >
                        <Plus className="h-3 w-3" /> Cadastrar progenitor
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={f.control}
                        name="id_pai"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-blue-500" />{' '}
                                    Pai
                                </FormLabel>
                                <FormControl>
                                    <ProgenitorCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        sexoFiltro="M"
                                        placeholder="Pesquisar e selecionar o pai..."
                                        progenitoresIniciais={progenitores}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={f.control}
                        name="id_mae"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-pink-500" />{' '}
                                    Mãe
                                </FormLabel>
                                <FormControl>
                                    <ProgenitorCombobox
                                        value={field.value}
                                        onChange={field.onChange}
                                        sexoFiltro="F"
                                        placeholder="Pesquisar e selecionar a mãe..."
                                        progenitoresIniciais={progenitores}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </>
    );

    // ─── Linha de tabela ──────────────────────────────────────────────────────
    const TableRowItem = ({ m }: { m: Municipe }) => {
        const aprovado = temRecrutamentoAprovado(m);
        return (
            <TableRow className="group transition-colors hover:bg-muted/40">
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${m.sexo === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}
                        >
                            {m.nome_completo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="leading-tight font-semibold">
                                {m.nome_completo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                #{m.id}
                            </p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-sm">
                    <div>{formatDate(m.data_nascimento)}</div>
                    <div className="text-xs text-muted-foreground">
                        {calcularIdade(m.data_nascimento)} anos
                    </div>
                </TableCell>
                <TableCell>
                    <Badge
                        variant={m.sexo === 'M' ? 'default' : 'secondary'}
                        className="text-xs"
                    >
                        {m.sexo === 'M' ? 'Masc.' : 'Fem.'}
                    </Badge>
                </TableCell>
                <TableCell>
                    {m.bi_numero ? (
                        <div className="flex items-center gap-1 text-xs">
                            <CreditCard className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono">{m.bi_numero}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">
                            Sem BI
                        </span>
                    )}
                    {m.celular && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {m.celular}
                        </div>
                    )}
                </TableCell>
                <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {m.endereco?.localidade ||
                            m.municipio_naturalidade?.nome || (
                                <span className="text-muted-foreground">—</span>
                            )}
                    </div>
                </TableCell>
                <TableCell>
                    {m.recrutamentos && m.recrutamentos.length > 0 ? (
                        <EstadoBadge estado={m.recrutamentos[0].estado} />
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            Sem recrutamento
                        </span>
                    )}
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openView(m)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEdit(m)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => downloadPdf(m)}
                                    >
                                        <FileDown className="h-4 w-4 text-indigo-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Exportar PDF</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => setDeleteTarget(m)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remover</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </TableCell>
            </TableRow>
        );
    };

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Munícipes — SIGID" />

            <div className="flex flex-col gap-6 p-6">
                {/* HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Munícipes
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Gestão completa do cadastro de cidadãos · Benguela
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" /> Novo Munícipe
                    </Button>
                </div>

                {/* STAT CARDS */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total cadastrado"
                        value={stats.total}
                        icon={Users}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        label="Homens"
                        value={stats.masculino}
                        icon={User}
                        color="bg-blue-500"
                    />
                    <StatCard
                        label="Mulheres"
                        value={stats.feminino}
                        icon={User}
                        color="bg-pink-500"
                    />
                    <StatCard
                        label="Com BI"
                        value={stats.com_bi}
                        icon={CreditCard}
                        color="bg-emerald-500"
                    />
                </div>

                {/* FILTROS */}
                <Card className="border shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[220px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Nome, BI, telefone..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && applyFilters()
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Select
                                value={sexoFilter || 'all'}
                                onValueChange={(v) =>
                                    setSexoFilter(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Sexo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="M">Masculino</SelectItem>
                                    <SelectItem value="F">Feminino</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={estadoCivilFilter || 'all'}
                                onValueChange={(v) =>
                                    setEstadoCivilFilter(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Estado civil" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {[
                                        'Solteiro',
                                        'Casado',
                                        'Divorciado',
                                        'Viúvo',
                                        'União de Facto',
                                    ].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={hasBiFilter || 'all'}
                                onValueChange={(v) =>
                                    setHasBiFilter(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Doc. BI" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="yes">
                                        <span className="flex items-center gap-2">
                                            <UserCheck className="h-3 w-3" />
                                            Com BI
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="no">
                                        <span className="flex items-center gap-2">
                                            <UserX className="h-3 w-3" />
                                            Sem BI
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={applyFilters} className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtrar
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    onClick={clearFilters}
                                    variant="ghost"
                                    className="gap-2 text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Limpar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* TABELA */}
                <Card className="overflow-hidden border shadow-sm">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-[260px]">
                                        Munícipe
                                    </TableHead>
                                    <TableHead className="w-[110px]">
                                        Nascimento
                                    </TableHead>
                                    <TableHead className="w-[80px]">
                                        Sexo
                                    </TableHead>
                                    <TableHead className="w-[180px]">
                                        Documentos
                                    </TableHead>
                                    <TableHead className="w-[140px]">
                                        Localidade
                                    </TableHead>
                                    <TableHead className="w-[130px]">
                                        Recrutamento
                                    </TableHead>
                                    <TableHead className="w-[120px] text-right">
                                        Ações
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {municipes.data.length > 0 ? (
                                    municipes.data.map((m) => (
                                        <TableRowItem key={m.id} m={m} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-52 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Users className="h-10 w-10" />
                                                <p className="font-medium">
                                                    Nenhum munícipe encontrado
                                                </p>
                                                <p className="text-sm">
                                                    {hasActiveFilters
                                                        ? 'Tente ajustar os filtros'
                                                        : 'Clique em "Novo Munícipe" para começar'}
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        onClick={clearFilters}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Limpar filtros
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* PAGINAÇÃO */}
                {municipes.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3">
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
                        <div className="flex items-center gap-1">
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
                            </Button>
                            {Array.from(
                                { length: Math.min(7, municipes.last_page) },
                                (_, i) => {
                                    let p: number;
                                    if (municipes.last_page <= 7) p = i + 1;
                                    else if (municipes.current_page <= 4)
                                        p = i + 1;
                                    else if (
                                        municipes.current_page >=
                                        municipes.last_page - 3
                                    )
                                        p = municipes.last_page - 6 + i;
                                    else p = municipes.current_page - 3 + i;
                                    return (
                                        <Button
                                            key={p}
                                            variant={
                                                municipes.current_page === p
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            className="w-9"
                                            onClick={() =>
                                                router.get(
                                                    `/municipes?page=${p}`,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                        >
                                            {p}
                                        </Button>
                                    );
                                },
                            )}
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
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════ MODAL: CRIAR ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'create'}
                onOpenChange={() => {
                    /* bloqueado — só fecha via botão Cancelar */
                }}
            >
                <DialogContent
                    className="max-h-[92vh] min-w-6xl overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Cadastrar Novo Munícipe
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados pessoais. Os dados complementares
                            podem ser adicionados depois.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onCreateSubmit)}
                            className="space-y-6"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <MunicipeFormFields f={form} />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Cadastrar Munícipe"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: EDITAR ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'edit'}
                onOpenChange={(o) => {
                    if (!o) closeModal();
                }}
            >
                <DialogContent
                    className="max-h-[92vh] min-w-6xl overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Editar Munícipe
                        </DialogTitle>
                        <DialogDescription>
                            A actualizar:{' '}
                            <span className="font-medium">
                                {selected?.nome_completo}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onEditSubmit)}
                            className="space-y-6"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <MunicipeFormFields f={form} />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Guardar Alterações"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: VER DETALHES ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'view'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-h-[92vh] min-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${selected?.sexo === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}
                            >
                                {selected?.nome_completo.charAt(0)}
                            </div>
                            <div>
                                <p>{selected?.nome_completo}</p>
                                <p className="text-sm font-normal text-muted-foreground">
                                    Código #{selected?.id}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto gap-2"
                                onClick={() =>
                                    selected && downloadPdf(selected)
                                }
                            >
                                <FileDown className="h-4 w-4" /> Exportar PDF
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <Separator />

                    {selected && (
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid h-auto w-full grid-cols-5">
                                {[
                                    {
                                        val: 'pessoal',
                                        label: 'Pessoais',
                                        icon: User,
                                    },
                                    {
                                        val: 'biografico',
                                        label: 'Biográficos',
                                        icon: FileText,
                                    },
                                    {
                                        val: 'complementar',
                                        label: 'Complementares',
                                        icon: Briefcase,
                                    },
                                    {
                                        val: 'endereco',
                                        label: 'Endereço',
                                        icon: Home,
                                    },
                                    {
                                        val: 'recrutamento',
                                        label: 'Recrutamento',
                                        icon: Users,
                                    },
                                ].map(({ val, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={val}
                                        value={val}
                                        className="gap-1.5 py-2 text-xs"
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* PESSOAIS */}
                            <TabsContent
                                value="pessoal"
                                className="space-y-4 pt-4"
                            >
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Card>
                                        <CardContent className="space-y-3 pt-5">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Informações Pessoais
                                            </p>
                                            {[
                                                [
                                                    'Nascimento',
                                                    formatDate(
                                                        selected.data_nascimento,
                                                    ),
                                                ],
                                                [
                                                    'Idade',
                                                    `${calcularIdade(selected.data_nascimento)} anos`,
                                                ],
                                                [
                                                    'Sexo',
                                                    selected.sexo === 'M'
                                                        ? 'Masculino'
                                                        : 'Feminino',
                                                ],
                                                [
                                                    'Estado Civil',
                                                    selected.estado_civil ||
                                                        '—',
                                                ],
                                                [
                                                    'Naturalidade',
                                                    selected.naturalidade ||
                                                        '—',
                                                ],
                                            ].map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {k}
                                                    </span>
                                                    <span className="font-medium">
                                                        {v}
                                                    </span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="space-y-3 pt-5">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Documentação
                                            </p>
                                            {[
                                                [
                                                    'Nº BI',
                                                    selected.bi_numero || '—',
                                                ],
                                                [
                                                    'Emissão',
                                                    formatDate(
                                                        selected.bi_data_emissao,
                                                    ),
                                                ],
                                                [
                                                    'Validade',
                                                    formatDate(
                                                        selected.bi_data_validade,
                                                    ),
                                                ],
                                                [
                                                    'Município',
                                                    selected
                                                        .municipio_naturalidade
                                                        ?.nome || '—',
                                                ],
                                            ].map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {k}
                                                    </span>
                                                    <span className="font-mono font-medium">
                                                        {v}
                                                    </span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="space-y-3 pt-5">
                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Contactos
                                            </p>
                                            {[
                                                [
                                                    'Telefone',
                                                    selected.telefone || '—',
                                                ],
                                                [
                                                    'Celular',
                                                    selected.celular || '—',
                                                ],
                                            ].map(([k, v]) => (
                                                <div
                                                    key={k}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {k}
                                                    </span>
                                                    <span className="font-medium">
                                                        {v}
                                                    </span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                    <Card className="sm:col-span-2 lg:col-span-3">
                                        <CardContent className="pt-5">
                                            <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                Progenitores
                                            </p>
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                                    <Heart className="h-4 w-4 shrink-0 text-blue-500" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Pai
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {selected.pai
                                                                ?.nome_completo ||
                                                                'Não informado'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                                    <Heart className="h-4 w-4 shrink-0 text-pink-500" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Mãe
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {selected.mae
                                                                ?.nome_completo ||
                                                                'Não informado'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1"
                                    onClick={() => openEdit(selected)}
                                >
                                    <Edit className="h-3 w-3" />
                                    Editar dados pessoais
                                </Button>
                            </TabsContent>

                            {/* BIOGRÁFICOS */}
                            <TabsContent value="biografico" className="pt-4">
                                {selected.dados_biograficos ? (
                                    <>
                                        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                [
                                                    'NIP',
                                                    selected.dados_biograficos
                                                        .nip,
                                                ],
                                                [
                                                    'Assento Nº',
                                                    selected.dados_biograficos
                                                        .assento_numero,
                                                ],
                                                [
                                                    'Registo Civil',
                                                    selected.dados_biograficos
                                                        .registro_civil,
                                                ],
                                                [
                                                    'Nº Registo',
                                                    selected.dados_biograficos
                                                        .registro_numero,
                                                ],
                                                [
                                                    'Nº Cédula',
                                                    selected.dados_biograficos
                                                        .cedula_numero,
                                                ],
                                                [
                                                    'Nº Filhos',
                                                    selected.dados_biograficos
                                                        .numero_filhos ?? 0,
                                                ],
                                                [
                                                    'Vencimento',
                                                    selected.dados_biograficos
                                                        .vencimento
                                                        ? `${Number(selected.dados_biograficos.vencimento).toLocaleString('pt-AO')} Kz`
                                                        : null,
                                                ],
                                                [
                                                    'Ramo Actividade',
                                                    selected.dados_biograficos
                                                        .ramo_actividade,
                                                ],
                                                [
                                                    'Ramo',
                                                    selected.dados_biograficos
                                                        .ramo,
                                                ],
                                                [
                                                    'Ano Incorporação',
                                                    selected.dados_biograficos
                                                        .ano_incorporacao,
                                                ],
                                                [
                                                    'Ano Abandono',
                                                    selected.dados_biograficos
                                                        .ano_abandono,
                                                ],
                                                [
                                                    'Anos Serviço',
                                                    selected.dados_biograficos
                                                        .ano_servico,
                                                ],
                                                [
                                                    'Modo de Vida',
                                                    selected.dados_biograficos
                                                        .modo_vida,
                                                ],
                                            ].map(([k, v]) => (
                                                <Card key={String(k)}>
                                                    <CardContent className="pt-4 pb-4">
                                                        <p className="text-xs text-muted-foreground">
                                                            {k}
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {v ?? '—'}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                openBiografico(selected)
                                            }
                                            className="gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Editar
                                        </Button>
                                    </>
                                ) : (
                                    <EmptyState
                                        icon={FileText}
                                        label="Nenhum dado biográfico registado"
                                    >
                                        <Button
                                            onClick={() =>
                                                openBiografico(selected)
                                            }
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    </EmptyState>
                                )}
                            </TabsContent>

                            {/* COMPLEMENTARES */}
                            <TabsContent value="complementar" className="pt-4">
                                {selected.dados_complementares ? (
                                    <>
                                        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                [
                                                    'Caixa Postal',
                                                    selected
                                                        .dados_complementares
                                                        .caixa_postal,
                                                ],
                                                [
                                                    'NIF',
                                                    selected
                                                        .dados_complementares
                                                        .nif,
                                                ],
                                                [
                                                    'Encargos Familiares',
                                                    selected
                                                        .dados_complementares
                                                        .encargo_familiar ?? 0,
                                                ],
                                                [
                                                    'Habilitação',
                                                    selected
                                                        .dados_complementares
                                                        .habilitacao_literaria,
                                                ],
                                                [
                                                    'Profissão',
                                                    selected
                                                        .dados_complementares
                                                        .profissao,
                                                ],
                                                [
                                                    'Nº Irmãos',
                                                    selected
                                                        .dados_complementares
                                                        .numero_irmaos ?? 0,
                                                ],
                                                [
                                                    'Entidade Emissora BI',
                                                    selected
                                                        .dados_complementares
                                                        .entidade_emissora_bi,
                                                ],
                                                [
                                                    'Nº Carta Condução',
                                                    selected
                                                        .dados_complementares
                                                        .numero_carta_conducao,
                                                ],
                                                [
                                                    'Emissão Carta',
                                                    formatDate(
                                                        selected
                                                            .dados_complementares
                                                            .data_emissao_carta,
                                                    ),
                                                ],
                                                [
                                                    'Validade Carta',
                                                    formatDate(
                                                        selected
                                                            .dados_complementares
                                                            .data_validade_carta,
                                                    ),
                                                ],
                                                [
                                                    'Atributo',
                                                    selected
                                                        .dados_complementares
                                                        .atributo,
                                                ],
                                            ].map(([k, v]) => (
                                                <Card key={String(k)}>
                                                    <CardContent className="pt-4 pb-4">
                                                        <p className="text-xs text-muted-foreground">
                                                            {k}
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {v ?? '—'}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                openComplementar(selected)
                                            }
                                            className="gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Editar
                                        </Button>
                                    </>
                                ) : (
                                    <EmptyState
                                        icon={Briefcase}
                                        label="Nenhum dado complementar registado"
                                    >
                                        <Button
                                            onClick={() =>
                                                openComplementar(selected)
                                            }
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    </EmptyState>
                                )}
                            </TabsContent>

                            {/* ENDEREÇO */}
                            <TabsContent value="endereco" className="pt-4">
                                {selected.endereco ? (
                                    <>
                                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                                            {[
                                                [
                                                    'Morada',
                                                    selected.endereco.morada,
                                                ],
                                                [
                                                    'Localidade',
                                                    selected.endereco
                                                        .localidade,
                                                ],
                                                [
                                                    'Comuna',
                                                    selected.endereco.comuna,
                                                ],
                                                [
                                                    'Província',
                                                    selected.endereco.provincia
                                                        ?.nome,
                                                ],
                                                [
                                                    'Município',
                                                    selected.endereco.municipio
                                                        ?.nome,
                                                ],
                                            ].map(([k, v]) => (
                                                <Card key={String(k)}>
                                                    <CardContent className="pt-4 pb-4">
                                                        <p className="text-xs text-muted-foreground">
                                                            {k}
                                                        </p>
                                                        <p className="mt-1 font-semibold">
                                                            {v || '—'}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                openEndereco(selected)
                                            }
                                            className="gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Editar
                                        </Button>
                                    </>
                                ) : (
                                    <EmptyState
                                        icon={MapPin}
                                        label="Nenhum endereço registado"
                                    >
                                        <Button
                                            onClick={() =>
                                                openEndereco(selected)
                                            }
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    </EmptyState>
                                )}
                            </TabsContent>

                            {/* RECRUTAMENTO */}
                            <TabsContent value="recrutamento" className="pt-4">
                                {(() => {
                                    const aprovado =
                                        temRecrutamentoAprovado(selected);
                                    return (
                                        <div className="mb-4 flex items-center justify-between">
                                            <p className="font-semibold">
                                                Histórico de Recrutamentos
                                            </p>
                                            {!aprovado ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        openRecrutamento(
                                                            selected,
                                                        )
                                                    }
                                                    className="gap-1"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Novo
                                                </Button>
                                            ) : (
                                                <Badge className="gap-1 bg-emerald-500 text-white">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Recrutamento Aprovado
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })()}
                                {selected.recrutamentos &&
                                selected.recrutamentos.length > 0 ? (
                                    <div className="space-y-3">
                                        {selected.recrutamentos.map((rec) => (
                                            <Card
                                                key={rec.id}
                                                className="border"
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                {formatDate(
                                                                    rec.data_recruta,
                                                                )}
                                                            </div>
                                                            {rec.observacoes && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        rec.observacoes
                                                                    }
                                                                </p>
                                                            )}
                                                            {rec.transferencias &&
                                                                rec
                                                                    .transferencias
                                                                    .length >
                                                                    0 && (
                                                                    <div className="mt-2 space-y-1">
                                                                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                                                            Transferências
                                                                        </p>
                                                                        {rec.transferencias.map(
                                                                            (
                                                                                t,
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        t.id
                                                                                    }
                                                                                    className="flex items-center gap-2 rounded bg-muted/40 px-2 py-1 text-xs"
                                                                                >
                                                                                    <ArrowRightLeft className="h-3 w-3" />
                                                                                    <span>
                                                                                        {formatDate(
                                                                                            t.data_solicitacao,
                                                                                        )}
                                                                                    </span>
                                                                                    {t.municipio_destino && (
                                                                                        <span>
                                                                                            →{' '}
                                                                                            {
                                                                                                t
                                                                                                    .municipio_destino
                                                                                                    .nome
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                    {t.local_destino && (
                                                                                        <span>
                                                                                            {
                                                                                                t.local_destino
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                    <EstadoBadge
                                                                                        estado={
                                                                                            t.estado
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <EstadoBadge
                                                                estado={
                                                                    rec.estado
                                                                }
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 gap-1 text-xs"
                                                                onClick={() =>
                                                                    openTransferencia(
                                                                        selected,
                                                                        rec,
                                                                    )
                                                                }
                                                            >
                                                                <ArrowRightLeft className="h-3 w-3" />
                                                                Transferência
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        icon={Users}
                                        label="Nenhum recrutamento registado"
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: BIOGRÁFICOS ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'biografico'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-h-[90vh] min-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dados Biográficos</DialogTitle>
                        <DialogDescription>
                            {selected?.nome_completo}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...biograficoForm}>
                        <form
                            onSubmit={biograficoForm.handleSubmit(
                                onBiograficoSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <FieldGrid>
                                {[
                                    { name: 'nip', label: 'NIP', type: 'text' },
                                    {
                                        name: 'assento_numero',
                                        label: 'Assento Nº',
                                        type: 'text',
                                    },
                                    {
                                        name: 'registro_civil',
                                        label: 'Registo Civil',
                                        type: 'text',
                                    },
                                    {
                                        name: 'registro_numero',
                                        label: 'Nº Registo',
                                        type: 'text',
                                    },
                                    {
                                        name: 'cedula_numero',
                                        label: 'Nº Cédula',
                                        type: 'text',
                                    },
                                    {
                                        name: 'numero_filhos',
                                        label: 'Nº Filhos',
                                        type: 'number',
                                    },
                                    {
                                        name: 'vencimento',
                                        label: 'Vencimento (Kz)',
                                        type: 'text',
                                    },
                                    {
                                        name: 'ramo_actividade',
                                        label: 'Ramo Actividade',
                                        type: 'text',
                                    },
                                    {
                                        name: 'ramo',
                                        label: 'Ramo',
                                        type: 'text',
                                    },
                                    {
                                        name: 'ano_incorporacao',
                                        label: 'Ano Incorporação',
                                        type: 'number',
                                    },
                                    {
                                        name: 'ano_abandono',
                                        label: 'Ano Abandono',
                                        type: 'number',
                                    },
                                    {
                                        name: 'ano_servico',
                                        label: 'Anos de Serviço',
                                        type: 'number',
                                    },
                                    {
                                        name: 'modo_vida',
                                        label: 'Modo de Vida',
                                        type: 'text',
                                    },
                                ].map(({ name, label, type }) => (
                                    <FormField
                                        key={name}
                                        control={biograficoForm.control}
                                        name={name as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{label}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type={type}
                                                        {...field}
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        onChange={(e) => {
                                                            const raw =
                                                                e.target.value;
                                                            field.onChange(
                                                                type ===
                                                                    'number'
                                                                    ? raw === ''
                                                                        ? undefined
                                                                        : Number(
                                                                              raw,
                                                                          )
                                                                    : raw,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </FieldGrid>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Guardar"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: COMPLEMENTARES ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'complementar'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-h-[90vh] min-w-6xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Dados Complementares</DialogTitle>
                        <DialogDescription>
                            {selected?.nome_completo}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...complementarForm}>
                        <form
                            onSubmit={complementarForm.handleSubmit(
                                onComplementarSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <FieldGrid>
                                {[
                                    {
                                        name: 'caixa_postal',
                                        label: 'Caixa Postal',
                                        type: 'text',
                                    },
                                    { name: 'nif', label: 'NIF', type: 'text' },
                                    {
                                        name: 'encargo_familiar',
                                        label: 'Encargos Familiares',
                                        type: 'number',
                                    },
                                    {
                                        name: 'habilitacao_literaria',
                                        label: 'Habilitação Literária',
                                        type: 'text',
                                    },
                                    {
                                        name: 'profissao',
                                        label: 'Profissão',
                                        type: 'text',
                                    },
                                    {
                                        name: 'numero_irmaos',
                                        label: 'Nº Irmãos',
                                        type: 'number',
                                    },
                                    {
                                        name: 'entidade_emissora_bi',
                                        label: 'Entidade Emissora BI',
                                        type: 'text',
                                    },
                                    {
                                        name: 'numero_carta_conducao',
                                        label: 'Nº Carta Condução',
                                        type: 'text',
                                    },
                                    {
                                        name: 'data_emissao_carta',
                                        label: 'Emissão Carta',
                                        type: 'date',
                                    },
                                    {
                                        name: 'data_validade_carta',
                                        label: 'Validade Carta',
                                        type: 'date',
                                    },
                                    {
                                        name: 'atributo',
                                        label: 'Atributo',
                                        type: 'text',
                                    },
                                ].map(({ name, label, type }) => (
                                    <FormField
                                        key={name}
                                        control={complementarForm.control}
                                        name={name as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{label}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type={type}
                                                        {...field}
                                                        value={
                                                            field.value ?? ''
                                                        }
                                                        onChange={(e) => {
                                                            const raw =
                                                                e.target.value;
                                                            field.onChange(
                                                                type ===
                                                                    'number'
                                                                    ? raw === ''
                                                                        ? undefined
                                                                        : Number(
                                                                              raw,
                                                                          )
                                                                    : raw,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </FieldGrid>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Guardar"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: ENDEREÇO ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'endereco'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Endereço</DialogTitle>
                        <DialogDescription>
                            {selected?.nome_completo}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...enderecoForm}>
                        <form
                            onSubmit={enderecoForm.handleSubmit(
                                onEnderecoSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={enderecoForm.control}
                                    name="morada"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
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
                                                    placeholder="Ex: Benguela-Sede"
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
                                                onValueChange={(v) => {
                                                    field.onChange(Number(v));
                                                    enderecoForm.setValue(
                                                        'id_municipio',
                                                        undefined,
                                                    );
                                                }}
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
                                <FormField
                                    control={enderecoForm.control}
                                    name="id_municipio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Município</FormLabel>
                                            <Select
                                                onValueChange={(v) =>
                                                    field.onChange(Number(v))
                                                }
                                                value={field.value?.toString()}
                                                disabled={
                                                    municipiosFiltrados.length ===
                                                    0
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue
                                                            placeholder={
                                                                municipiosFiltrados.length ===
                                                                0
                                                                    ? 'Selecione província'
                                                                    : 'Selecione'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {municipiosFiltrados.map(
                                                        (m) => (
                                                            <SelectItem
                                                                key={m.id}
                                                                value={m.id.toString()}
                                                            >
                                                                {m.nome}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Guardar Endereço"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: RECRUTAMENTO ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'recrutamento'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registar Recrutamento</DialogTitle>
                        <DialogDescription>
                            {selected?.nome_completo}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...recrutamentoForm}>
                        <form
                            onSubmit={recrutamentoForm.handleSubmit(
                                onRecrutamentoSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <FormField
                                control={recrutamentoForm.control}
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
                                control={recrutamentoForm.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={(v) =>
                                                field.onChange(Number(v))
                                            }
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
                                            <Textarea
                                                placeholder="Observações adicionais..."
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Registar"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: TRANSFERÊNCIA ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'transferencia'}
                onOpenChange={(o) => !o && closeModal()}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Registar Transferência
                        </DialogTitle>
                        <DialogDescription>
                            Recrutamento de{' '}
                            {formatDate(selectedRecrutamento?.data_recruta)}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...transferenciaForm}>
                        <form
                            onSubmit={transferenciaForm.handleSubmit(
                                onTransferenciaSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <FormField
                                control={transferenciaForm.control}
                                name="data_solicitacao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Data da Solicitação *
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={transferenciaForm.control}
                                name="id_municipio_destino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Município de Destino
                                        </FormLabel>
                                        <Select
                                            onValueChange={(v) =>
                                                field.onChange(Number(v))
                                            }
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {municipios.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id.toString()}
                                                    >
                                                        {m.nome}
                                                        {m.provincia &&
                                                            ` — ${m.provincia.nome}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={transferenciaForm.control}
                                name="local_destino"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Local de Destino</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Batalhão X"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={transferenciaForm.control}
                                name="estado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={(v) =>
                                                field.onChange(Number(v))
                                            }
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
                                                    Aprovada
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    Rejeitada
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Registar Transferência"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ MODAL: CADASTRAR PROGENITOR ══════════════════════════════════════════ */}
            <Dialog
                open={modal === 'progenitor'}
                onOpenChange={(o) => {
                    if (!o) closeProgenitorModal();
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Progenitor(a)</DialogTitle>
                        <DialogDescription>
                            O progenitor será auto-seleccionado após o cadastro.
                        </DialogDescription>
                    </DialogHeader>
                    <Separator />
                    <Form {...progenitorForm}>
                        <form
                            onSubmit={progenitorForm.handleSubmit(
                                onProgenitorSubmit,
                            )}
                            className="space-y-4"
                        >
                            <ServerErrorBanner mensagens={serverErrors} />
                            <FormField
                                control={progenitorForm.control}
                                name="nome_completo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Nome completo"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={progenitorForm.control}
                                    name="data_nascimento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nascimento</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={progenitorForm.control}
                                    name="sexo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sexo</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
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
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={progenitorForm.control}
                                name="naturalidade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Naturalidade</FormLabel>
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
                                control={progenitorForm.control}
                                name="profissao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profissão</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Agricultor"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeProgenitorModal}
                                >
                                    Cancelar
                                </Button>
                                <SubmitBtn
                                    label="Cadastrar"
                                    isSubmitting={isSubmitting}
                                />
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════ CONFIRM DELETE ══════════════════════════════════════════ */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(o) => !o && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem a certeza que deseja remover{' '}
                            <span className="font-semibold">
                                {deleteTarget?.nome_completo}
                            </span>
                            ? Todos os dados relacionados serão eliminados
                            permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Remover definitivamente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
