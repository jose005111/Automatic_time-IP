import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useAppDialog } from '@/components/app-dialog-provider';
import generateFichaMunicipePDF from '../../lib/pdf/generateFichaMunicipePDF';

interface Props {
    municipe: any;
}

/**
 * Página intermédia para geração de PDF.
 * Abre automaticamente o diálogo de download ao carregar.
 */
export default function MunicipePdfView({ municipe }: Props) {
    const { alert } = useAppDialog();

    useEffect(() => {
        generateFichaMunicipePDF(municipe, {
            onError: () => {
                void alert({
                    title: 'Erro ao gerar PDF',
                    description:
                        'Ocorreu um erro ao gerar o PDF da ficha do munícipe. Tente novamente.',
                });
            },
        })();
    }, [municipe, alert]);

    return (
        <>
            <Head title={`PDF — ${municipe.nome_completo}`} />
            <div className="flex min-h-screen items-center justify-center">
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">
                        A gerar PDF de {municipe.nome_completo}…
                    </p>
                </div>
            </div>
        </>
    );
}
