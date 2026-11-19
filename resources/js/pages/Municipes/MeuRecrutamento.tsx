import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    User, Shield, Calendar, ArrowRightLeft, FileDown,
    CheckCircle, AlertCircle, Clock, MapPin, XCircle, Plus,
    FileText, Briefcase, Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import generateFichaMunicipePDF from '../../lib/pdf/generateFichaMunicipePDF';
import generateCartaTransferenciaPDF from '../../lib/pdf/Generatecartatransferenciapdf';

const fmt = (d?: string | null) => (d ? format(new Date(d), 'dd/MM/yyyy') : '—');

const EstadoBadge = ({ estado }: { estado: number }) => {
    if (estado === 1)
        return (
            <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-600">
                <CheckCircle className="h-3 w-3" /> Aprovado
            </Badge>
        );
    if (estado === 2)
        return (
            <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" /> Rejeitado
            </Badge>
        );
    return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3" /> Pendente
        </Badge>
    );
};

/* ------------------------------------------------------------------ */
interface Municipio { id: number; nome: string; id_provincia: number; provincia?: { nome: string }; }
interface Transferencia {
    id: number; data_solicitacao: string; local_destino?: string;
    estado: number; data_aprovacao?: string;
    municipio_destino?: { id: number; nome: string };
}
interface Recrutamento {
    id: number; data_recruta: string; observacoes?: string;
    estado: number; transferencias: Transferencia[];
}
interface Municipe {
    id: number; nome_completo: string; sexo: 'M' | 'F'; data_nascimento: string;
    bi_numero?: string; telefone?: string; celular?: string; foto_url?: string;
    dados_biograficos?: { nip?: string; ramo?: string; ramo_actividade?: string; ano_incorporacao?: number; vencimento?: number; };
    recrutamentos: Recrutamento[];
}
interface Props {
    municipe: Municipe;
    municipios: Municipio[];
    temRecrutamento: boolean;
    recrutamentoAtivo?: Recrutamento;
}

/* ================================================================== */
export default function MeuRecrutamento({ municipe, municipios, temRecrutamento, recrutamentoAtivo }: Props) {
    const [modalTransferencia, setModalTransferencia] = useState(false);
    const [recrutamentoSelecionado, setRecrutamentoSelecionado] = useState<Recrutamento | null>(null);
    const [printingTransfId, setPrintingTransfId] = useState<number | null>(null);
    const [confirmCarta, setConfirmCarta] = useState<{ transferencia: Transferencia; recrutamento: Recrutamento } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        data_solicitacao: new Date().toISOString().split('T')[0],
        id_municipio_destino: '',
        local_destino: '',
        motivo: '',
    });

    const abrirModal = (rec: Recrutamento) => {
        setRecrutamentoSelecionado(rec);
        setModalTransferencia(true);
        reset();
    };

    const submeterTransferencia = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recrutamentoSelecionado) return;
        post(`/meu-recrutamento/${recrutamentoSelecionado.id}/transferencia`, {
            onSuccess: () => { setModalTransferencia(false); reset(); },
        });
    };

    const cancelarTransferencia = (transferenciaId: number) => {
        if (!confirm('Tem a certeza que quer cancelar esta solicitação de transferência?')) return;
        router.delete(`/meu-recrutamento/transferencia/${transferenciaId}`);
    };

    const downloadPdf = () => {
        generateFichaMunicipePDF(municipe as any)();
    };

    const handleImprimirCarta = async (transferencia: Transferencia, recrutamento: Recrutamento) => {
        setPrintingTransfId(transferencia.id);
        setConfirmCarta(null);

        const cartaData = {
            id: transferencia.id,
            data_solicitacao: transferencia.data_solicitacao,
            data_aprovacao: transferencia.data_aprovacao,
            local_destino: transferencia.local_destino,
            recrutamento: {
                id: recrutamento.id,
                municipe: {
                    nome_completo: municipe.nome_completo,
                    bi: municipe.bi_numero,
                    data_nascimento: municipe.data_nascimento,
                    telefone: municipe.telefone ?? municipe.celular,
                },
            },
            municipioDestino: transferencia.municipio_destino
                ? { nome: transferencia.municipio_destino.nome }
                : undefined,
        };

        try {
            await generateCartaTransferenciaPDF(cartaData, {
                onSuccess: () => {
                    setPrintingTransfId(null);
                    toast.success('Carta de transferência gerada!', {
                        duration: 3500,
                        style: {
                            borderRadius: '10px',
                            background: '#f0fdf4',
                            color: '#14532d',
                            border: '1px solid #bbf7d0',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        },
                        iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
                    });
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

    const calcIdade = (d: string) => {
        const hoje = new Date();
        const nasc = new Date(d);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        if (hoje.getMonth() - nasc.getMonth() < 0 ||
            (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate()))
            idade--;
        return idade;
    };

    return (
        <AppLayout>
            <Head title="Meu Recrutamento — SIGID" />

            <div className="flex flex-col gap-6 p-6">

                {/* ── CABEÇALHO ─────────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {municipe.foto_url ? (
                            <img
                                src={municipe.foto_url}
                                alt={municipe.nome_completo}
                                className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20"
                            />
                        ) : (
                            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${municipe.sexo === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                {municipe.nome_completo.charAt(0)}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-primary uppercase tracking-wide">Área de Recruta</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{municipe.nome_completo}</h1>
                            <p className="text-sm text-muted-foreground">
                                Código #{municipe.id} · {calcIdade(municipe.data_nascimento)} anos
                            </p>
                        </div>
                    </div>
                    <Button onClick={downloadPdf} variant="outline" className="gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar Ficha PDF
                    </Button>
                </div>

                {/* ── SEM RECRUTAMENTO ──────────────────────────────────── */}
                {!temRecrutamento && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center text-muted-foreground">
                            <Shield className="h-12 w-12 opacity-30" />
                            <p className="font-medium">Ainda não tem nenhum registo de recrutamento associado.</p>
                            <p className="text-sm">Contacte o seu administrador para registar o seu recrutamento.</p>
                        </CardContent>
                    </Card>
                )}

                {/* ── RESUMO DADOS MILITARES ────────────────────────────── */}
                {municipe.dados_biograficos && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { label: 'NIP', value: municipe.dados_biograficos.nip },
                            { label: 'Ramo', value: municipe.dados_biograficos.ramo },
                            { label: 'Ramo de Actividade', value: municipe.dados_biograficos.ramo_actividade },
                            { label: 'Ano Incorporação', value: municipe.dados_biograficos.ano_incorporacao },
                        ].map(({ label, value }) => (
                            <Card key={label}>
                                <CardContent className="pt-4 pb-4">
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-1 font-semibold">{value ?? '—'}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── LISTA DE RECRUTAMENTOS ────────────────────────────── */}
                {temRecrutamento && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Registos de Recrutamento
                        </h2>

                        {municipe.recrutamentos.map((rec) => (
                            <Card key={rec.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            Recrutamento de {fmt(rec.data_recruta)}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <EstadoBadge estado={rec.estado} />
                                            {/* Botão de solicitar transferência — só para recrutamentos aprovados */}
                                            {rec.estado === 1 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1 text-xs"
                                                    onClick={() => abrirModal(rec)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Solicitar Transferência
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {rec.observacoes && (
                                        <p className="text-sm text-muted-foreground">{rec.observacoes}</p>
                                    )}
                                </CardHeader>

                                {/* Transferências do recrutamento */}
                                {rec.transferencias.length > 0 && (
                                    <CardContent className="pt-0">
                                        <Separator className="mb-3" />
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                                            <ArrowRightLeft className="h-3 w-3" />
                                            Transferências
                                        </p>
                                        <div className="space-y-2">
                                            {rec.transferencias.map((t) => (
                                                <div
                                                    key={t.id}
                                                    className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"
                                                >
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span className="text-muted-foreground text-xs">{fmt(t.data_solicitacao)}</span>
                                                        {t.municipio_destino && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                {t.municipio_destino.nome}
                                                            </span>
                                                        )}
                                                        {t.local_destino && !t.municipio_destino && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                                {t.local_destino}
                                                            </span>
                                                        )}
                                                        {t.data_aprovacao && (
                                                            <span className="text-xs text-muted-foreground">
                                                                aprovado em {fmt(t.data_aprovacao)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <EstadoBadge estado={t.estado} />
                                                        {/* Carta — só para aprovadas */}
                                                        {t.estado === 1 && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-7 gap-1 border-blue-500 px-2 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-60"
                                                                disabled={printingTransfId === t.id}
                                                                title="Baixar carta de transferência"
                                                                onClick={() => setConfirmCarta({ transferencia: t, recrutamento: rec })}
                                                            >
                                                                <Printer className="h-3 w-3" />
                                                                {printingTransfId === t.id ? 'A gerar…' : 'Carta'}
                                                            </Button>
                                                        )}
                                                        {/* Cancelar só se pendente */}
                                                        {t.estado === 0 && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                title="Cancelar solicitação"
                                                                onClick={() => cancelarTransferencia(t.id)}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* ── MODAL: SOLICITAR TRANSFERÊNCIA ────────────────────────── */}
            <Dialog open={modalTransferencia} onOpenChange={setModalTransferencia}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5" />
                            Solicitar Transferência
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submeterTransferencia} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="data_solicitacao">Data de Solicitação *</Label>
                            <Input
                                id="data_solicitacao"
                                type="date"
                                value={data.data_solicitacao}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={e => setData('data_solicitacao', e.target.value)}
                            />
                            {errors.data_solicitacao && <p className="text-xs text-destructive">{errors.data_solicitacao}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="id_municipio_destino">Município de Destino</Label>
                            <Select
                                value={data.id_municipio_destino}
                                onValueChange={v => setData('id_municipio_destino', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione um município..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {municipios.map(m => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.nome} {m.provincia ? `(${m.provincia.nome})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.id_municipio_destino && <p className="text-xs text-destructive">{errors.id_municipio_destino}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="local_destino">Local de Destino (opcional)</Label>
                            <Input
                                id="local_destino"
                                placeholder="Ex: Base Militar de Luanda"
                                value={data.local_destino}
                                onChange={e => setData('local_destino', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="motivo">Motivo / Justificação</Label>
                            <Textarea
                                id="motivo"
                                rows={3}
                                placeholder="Descreva o motivo da transferência..."
                                value={data.motivo}
                                onChange={e => setData('motivo', e.target.value)}
                            />
                        </div>

                        <p className="text-xs text-muted-foreground rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                            A solicitação ficará pendente até ser aprovada por um administrador.
                        </p>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setModalTransferencia(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'A enviar...' : 'Submeter Solicitação'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── CONFIRM: Baixar Carta de Transferência ─────────────────── */}
            <AlertDialog
                open={!!confirmCarta}
                onOpenChange={(o) => { if (!o) setConfirmCarta(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Printer className="h-5 w-5 text-blue-500" />
                            Baixar Carta de Transferência
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-1">
                            <p>
                                Vai ser gerado o comprovativo oficial de transferência aprovada para{' '}
                                <strong>
                                    {confirmCarta?.transferencia.municipio_destino?.nome
                                        ?? confirmCarta?.transferencia.local_destino
                                        ?? 'destino indicado'}
                                </strong>.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Solicitada em {fmt(confirmCarta?.transferencia.data_solicitacao)}
                                {confirmCarta?.transferencia.data_aprovacao && (
                                    <> · Aprovada em {fmt(confirmCarta.transferencia.data_aprovacao)}</>
                                )}
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                                if (confirmCarta) {
                                    handleImprimirCarta(confirmCarta.transferencia, confirmCarta.recrutamento);
                                }
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
