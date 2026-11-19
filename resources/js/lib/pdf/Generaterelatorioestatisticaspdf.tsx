import React from 'react';
import { pdf } from '@react-pdf/renderer';
import RelatorioEstatisticasPDF, {
    type RelatorioEstatisticasData,
} from './Relatorioestatisticaspdf';

interface GenerateOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Gera e faz download do Relatório de Estatísticas em PDF,
 * respeitando todos os filtros activos.
 *
 * Uso directo (sem retorno de handler):
 *   await generateRelatorioEstatisticasPDF(data);
 *
 * Uso com opções de callback:
 *   await generateRelatorioEstatisticasPDF(data, {
 *     onSuccess: () => toast.success('PDF gerado!'),
 *     onError: (err) => toast.error('Erro ao gerar PDF'),
 *   });
 */
export default async function generateRelatorioEstatisticasPDF(
    data: RelatorioEstatisticasData,
    options: GenerateOptions = {},
): Promise<void> {
    try {
        const blob = await pdf(
            <RelatorioEstatisticasPDF data={data} />,
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Nome do ficheiro reflecte os filtros activos
        const periodo = buildPeriodoSlug(data.filters);
        const provincia = data.filters.provincia_nome
            ? `_${slugify(data.filters.provincia_nome)}`
            : '';
        const municipio = data.filters.municipio_nome
            ? `_${slugify(data.filters.municipio_nome)}`
            : '';
        link.download = `relatorio_municipes${provincia}${municipio}${periodo}_${todaySlug()}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        options.onSuccess?.();
    } catch (error) {
        console.error('Erro ao gerar PDF do relatório:', error);
        options.onError?.(error as Error);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todaySlug(): string {
    return new Date().toISOString().slice(0, 10);
}

function slugify(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
}

function buildPeriodoSlug(
    filters: RelatorioEstatisticasData['filters'],
): string {
    if (!filters.start_date && !filters.end_date) return '';
    const from = filters.start_date ? `_de_${filters.start_date}` : '';
    const to = filters.end_date ? `_ate_${filters.end_date}` : '';
    return `${from}${to}`;
}
