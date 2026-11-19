import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import generateFichaMunicipePDF from '../../lib/pdf/generateFichaMunicipePDF';

interface Props { municipe: any; }

/**
 * Página intermédia para geração de PDF.
 * Abre automaticamente o diálogo de download ao carregar.
 */
export default function MunicipePdfView({ municipe }: Props) {
    useEffect(() => {
        generateFichaMunicipePDF(municipe)();
    }, []);

    return (
        <>
            <Head title={`PDF — ${municipe.nome_completo}`} />
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-sm text-muted-foreground">A gerar PDF de {municipe.nome_completo}…</p>
                </div>
            </div>
        </>
    );
}
