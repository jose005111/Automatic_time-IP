import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useAppDialog } from '@/components/app-dialog-provider';
import AppLayout from '@/layouts/app-layout';
import { NOME_SISTEMA } from '@/lib/sistema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
    User,
    FileText,
    Briefcase,
    Home,
    Users,
    Heart,
    Calendar,
    MapPin,
    FileDown,
    ArrowRightLeft,
    CheckCircle,
    AlertCircle,
    Clock,
    Shield,
    Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import generateFichaMunicipePDF from '../../lib/pdf/generateFichaMunicipePDF';
import generateCartaTransferenciaPDF from '../../lib/pdf/Generatecartatransferenciapdf';

const formatDate = (d?: string) =>
    d ? format(new Date(d), 'dd/MM/yyyy') : '—';

const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nasc = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (
        hoje.getMonth() - nasc.getMonth() < 0 ||
        (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
    )
        idade--;
    return idade;
};

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

interface Props {
    municipe: any;
}

export default function MunicipePainel({ municipe }: Props) {
    const { alert } = useAppDialog();

    const [activeTab, setActiveTab] = useState('pessoal');
    const [printingTransfId, setPrintingTransfId] = useState<number | null>(
        null,
    );
    const [confirmTransf, setConfirmTransf] = useState<any | null>(null);

    const downloadPdf = () => {
        generateFichaMunicipePDF(municipe, {
            onError: () => {
                void alert({
                    title: 'Erro ao gerar PDF',
                    description:
                        'Ocorreu um erro ao gerar o PDF da ficha do munícipe. Tente novamente.',
                });
            },
        })();
    };

    const handleImprimirCarta = async (transferencia: any) => {
        setPrintingTransfId(transferencia.id);
        setConfirmTransf(null);

        // Adapta os dados do painel para o formato CartaTransferenciaData
        const cartaData = {
            id: transferencia.id,
            data_solicitacao: transferencia.data_solicitacao,
            data_aprovacao: transferencia.data_aprovacao,
            local_destino: transferencia.local_destino,
            recrutamento: {
                id: transferencia.id_recrutamento ?? 0,
                municipe: {
                    nome_completo: municipe.nome_completo,
                    bi: municipe.bi_numero,
                    data_nascimento: municipe.data_nascimento,
                    telefone: municipe.telefone ?? municipe.celular,
                },
            },
            municipioDestino: transferencia.municipio_destino
                ? {
                      nome: transferencia.municipio_destino.nome,
                      provincia: transferencia.municipio_destino.provincia,
                  }
                : undefined,
            user_aprovou: transferencia.user_aprovou,
        };

        try {
            await generateCartaTransferenciaPDF(cartaData, {
                onSuccess: () => {
                    setPrintingTransfId(null);
                    toast.success(
                        'Carta de transferência gerada com sucesso!',
                        {
                            duration: 3000,
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
                            iconTheme: {
                                primary: '#22c55e',
                                secondary: '#f0fdf4',
                            },
                        },
                    );
                },
                onError: () => {
                    setPrintingTransfId(null);
                    toast.error('Erro ao gerar o PDF. Tente novamente.', {
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
                },
            })();
        } catch {
            setPrintingTransfId(null);
        }
    };

    return (
        <AppLayout>
            <Head title={`Meu Painel — ${NOME_SISTEMA}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Foto do munícipe */}
                        {municipe.foto_url ? (
                            <img
                                src={municipe.foto_url}
                                alt={municipe.nome_completo}
                                className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                            />
                        ) : (
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${
                                    municipe.sexo === 'M'
                                        ? 'bg-blue-500'
                                        : 'bg-pink-500'
                                }`}
                            >
                                {municipe.nome_completo.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {municipe.nome_completo}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Código #{municipe.id} ·{' '}
                                {calcularIdade(municipe.data_nascimento)} anos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Link para área de recruta se tiver recrutamentos */}
                        {municipe.recrutamentos &&
                            municipe.recrutamentos.length > 0 && (
                                <Link href="/meu-recrutamento">
                                    <Button variant="outline" className="gap-2">
                                        <Shield className="h-4 w-4" />
                                        Área de Recruta
                                    </Button>
                                </Link>
                            )}
                        <Button
                            onClick={downloadPdf}
                            className="gap-2 shadow-sm"
                        >
                            <FileDown className="h-4 w-4" />
                            Exportar PDF
                        </Button>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid h-auto w-full grid-cols-5">
                        {[
                            { val: 'pessoal', label: 'Pessoais', icon: User },
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
                            { val: 'endereco', label: 'Endereço', icon: Home },
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
                    <TabsContent value="pessoal" className="space-y-4 pt-4">
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
                                                municipe.data_nascimento,
                                            ),
                                        ],
                                        [
                                            'Idade',
                                            `${calcularIdade(municipe.data_nascimento)} anos`,
                                        ],
                                        [
                                            'Sexo',
                                            municipe.sexo === 'M'
                                                ? 'Masculino'
                                                : 'Feminino',
                                        ],
                                        [
                                            'Estado Civil',
                                            municipe.estado_civil || '—',
                                        ],
                                        [
                                            'Naturalidade',
                                            municipe.naturalidade || '—',
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
                                        ['Nº BI', municipe.bi_numero || '—'],
                                        [
                                            'Emissão',
                                            formatDate(
                                                municipe.bi_data_emissao,
                                            ),
                                        ],
                                        [
                                            'Validade',
                                            formatDate(
                                                municipe.bi_data_validade,
                                            ),
                                        ],
                                        [
                                            'Município',
                                            municipe.municipio_naturalidade
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
                                        ['Telefone', municipe.telefone || '—'],
                                        ['Celular', municipe.celular || '—'],
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
                                                    {municipe.pai
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
                                                    {municipe.mae
                                                        ?.nome_completo ||
                                                        'Não informado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* BIOGRÁFICOS */}
                    <TabsContent value="biografico" className="pt-4">
                        {municipe.dados_biograficos ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    ['NIP', municipe.dados_biograficos.nip],
                                    [
                                        'Assento Nº',
                                        municipe.dados_biograficos
                                            .assento_numero,
                                    ],
                                    [
                                        'Registo Civil',
                                        municipe.dados_biograficos
                                            .registro_civil,
                                    ],
                                    [
                                        'Nº Registo',
                                        municipe.dados_biograficos
                                            .registro_numero,
                                    ],
                                    [
                                        'Nº Cédula',
                                        municipe.dados_biograficos
                                            .cedula_numero,
                                    ],
                                    [
                                        'Nº Filhos',
                                        municipe.dados_biograficos
                                            .numero_filhos ?? 0,
                                    ],
                                    [
                                        'Vencimento',
                                        municipe.dados_biograficos.vencimento
                                            ? `${Number(municipe.dados_biograficos.vencimento).toLocaleString('pt-AO')} Kz`
                                            : null,
                                    ],
                                    [
                                        'Ramo Actividade',
                                        municipe.dados_biograficos
                                            .ramo_actividade,
                                    ],
                                    ['Ramo', municipe.dados_biograficos.ramo],
                                    [
                                        'Ano Incorporação',
                                        municipe.dados_biograficos
                                            .ano_incorporacao,
                                    ],
                                    [
                                        'Ano Abandono',
                                        municipe.dados_biograficos.ano_abandono,
                                    ],
                                    [
                                        'Anos Serviço',
                                        municipe.dados_biograficos.ano_servico,
                                    ],
                                    [
                                        'Modo de Vida',
                                        municipe.dados_biograficos.modo_vida,
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
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
                                <FileText className="h-12 w-12 opacity-30" />
                                <p className="font-medium">
                                    Nenhum dado biográfico registado
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* COMPLEMENTARES */}
                    <TabsContent value="complementar" className="pt-4">
                        {municipe.dados_complementares ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    [
                                        'Caixa Postal',
                                        municipe.dados_complementares
                                            .caixa_postal,
                                    ],
                                    ['NIF', municipe.dados_complementares.nif],
                                    [
                                        'Encargos Familiares',
                                        municipe.dados_complementares
                                            .encargo_familiar ?? 0,
                                    ],
                                    [
                                        'Habilitação',
                                        municipe.dados_complementares
                                            .habilitacao_literaria,
                                    ],
                                    [
                                        'Profissão',
                                        municipe.dados_complementares.profissao,
                                    ],
                                    [
                                        'Nº Irmãos',
                                        municipe.dados_complementares
                                            .numero_irmaos ?? 0,
                                    ],
                                    [
                                        'Entidade Emissora BI',
                                        municipe.dados_complementares
                                            .entidade_emissora_bi,
                                    ],
                                    [
                                        'Nº Carta Condução',
                                        municipe.dados_complementares
                                            .numero_carta_conducao,
                                    ],
                                    [
                                        'Emissão Carta',
                                        formatDate(
                                            municipe.dados_complementares
                                                .data_emissao_carta,
                                        ),
                                    ],
                                    [
                                        'Validade Carta',
                                        formatDate(
                                            municipe.dados_complementares
                                                .data_validade_carta,
                                        ),
                                    ],
                                    [
                                        'Atributo',
                                        municipe.dados_complementares.atributo,
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
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
                                <Briefcase className="h-12 w-12 opacity-30" />
                                <p className="font-medium">
                                    Nenhum dado complementar registado
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ENDEREÇO */}
                    <TabsContent value="endereco" className="pt-4">
                        {municipe.endereco ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    ['Morada', municipe.endereco.morada],
                                    [
                                        'Localidade',
                                        municipe.endereco.localidade,
                                    ],
                                    ['Comuna', municipe.endereco.comuna],
                                    [
                                        'Província',
                                        municipe.endereco.provincia?.nome,
                                    ],
                                    [
                                        'Município',
                                        municipe.endereco.municipio?.nome,
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
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
                                <MapPin className="h-12 w-12 opacity-30" />
                                <p className="font-medium">
                                    Nenhum endereço registado
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* RECRUTAMENTO */}
                    <TabsContent value="recrutamento" className="pt-4">
                        {municipe.recrutamentos &&
                        municipe.recrutamentos.length > 0 ? (
                            <div className="space-y-3">
                                {municipe.recrutamentos.map((rec: any) => (
                                    <Card key={rec.id} className="border">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        Recrutamento de{' '}
                                                        {formatDate(
                                                            rec.data_recruta,
                                                        )}
                                                    </div>
                                                    {rec.observacoes && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {rec.observacoes}
                                                        </p>
                                                    )}

                                                    {/* Transferências */}
                                                    {rec.transferencias
                                                        ?.length > 0 && (
                                                        <div className="mt-3 space-y-2">
                                                            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                                Transferências
                                                            </p>
                                                            {rec.transferencias.map(
                                                                (t: any) => (
                                                                    <div
                                                                        key={
                                                                            t.id
                                                                        }
                                                                        className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs"
                                                                    >
                                                                        <ArrowRightLeft className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                                        <span className="font-medium">
                                                                            {formatDate(
                                                                                t.data_solicitacao,
                                                                            )}
                                                                        </span>
                                                                        {t.municipio_destino ? (
                                                                            <span className="text-muted-foreground">
                                                                                →{' '}
                                                                                {
                                                                                    t
                                                                                        .municipio_destino
                                                                                        .nome
                                                                                }
                                                                                {t
                                                                                    .municipio_destino
                                                                                    .provincia &&
                                                                                    `, ${t.municipio_destino.provincia.nome}`}
                                                                            </span>
                                                                        ) : t.local_destino ? (
                                                                            <span className="text-muted-foreground">
                                                                                →{' '}
                                                                                {
                                                                                    t.local_destino
                                                                                }
                                                                            </span>
                                                                        ) : null}
                                                                        <EstadoBadge
                                                                            estado={
                                                                                t.estado
                                                                            }
                                                                        />

                                                                        {/* Botão de carta — só para aprovadas */}
                                                                        {t.estado ===
                                                                            1 && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="ml-auto h-6 gap-1 border-blue-500 px-2 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                                                                                disabled={
                                                                                    printingTransfId ===
                                                                                    t.id
                                                                                }
                                                                                onClick={() =>
                                                                                    setConfirmTransf(
                                                                                        {
                                                                                            ...t,
                                                                                            id_recrutamento:
                                                                                                rec.id,
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Printer className="h-3 w-3" />
                                                                                {printingTransfId ===
                                                                                t.id
                                                                                    ? 'A gerar…'
                                                                                    : 'Carta'}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <EstadoBadge
                                                    estado={rec.estado}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
                                <Users className="h-12 w-12 opacity-30" />
                                <p className="font-medium">
                                    Nenhum recrutamento registado
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Confirmação de Download da Carta ── */}
            <AlertDialog
                open={!!confirmTransf}
                onOpenChange={(o) => {
                    if (!o) setConfirmTransf(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Printer className="h-5 w-5 text-blue-500" />
                            Baixar Carta de Transferência
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                Vai ser gerado o documento oficial de
                                transferência aprovada para{' '}
                                <strong>
                                    {confirmTransf?.municipio_destino?.nome ??
                                        confirmTransf?.local_destino ??
                                        'destino indicado'}
                                </strong>
                                .
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Solicitação de{' '}
                                {formatDate(confirmTransf?.data_solicitacao)} ·
                                Aprovada em{' '}
                                {formatDate(confirmTransf?.data_aprovacao)}
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                                if (confirmTransf)
                                    handleImprimirCarta(confirmTransf);
                            }}
                        >
                            <FileDown className="h-4 w-4" />
                            Baixar PDF
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
