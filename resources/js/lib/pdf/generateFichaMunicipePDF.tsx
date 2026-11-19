import { pdf } from '@react-pdf/renderer';
import type { Municipe } from '@/types/municipe';
import FichaMunicipePDF from './FichaMunicipePdf';

interface GeneratePDFOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Gera e faz download da Ficha do Munícipe em PDF
 * Uso: onClick={generateFichaMunicipePDF(municipe)}
 */
export default function generateFichaMunicipePDF(
    municipe: Municipe,
    options: GeneratePDFOptions = {},
) {
    console.log('Gerando PDF para munícipe:');
    return async () => {
        try {
            // ✅ Geração ASSÍNCRONA (correto)
            const blob = await pdf(
                <FichaMunicipePDF municipe={municipe} />,
            ).toBlob();

            // Cria link temporário para download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ficha_municipe_${municipe.id}_${new Date().toISOString().slice(0, 10)}.pdf`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF gerado e descarregado com sucesso');

            options.onSuccess?.();
        } catch (error) {
            console.error('Erro ao gerar PDF da ficha do munícipe:', error);

            options.onError?.(error as Error);
        }
    };
}
