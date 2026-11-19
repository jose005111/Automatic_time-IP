import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CartaTransferenciaPdf, {
    type CartaTransferenciaData,
} from './Cartatransferenciapdf';

interface GeneratePDFOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export default function generateCartaTransferenciaPDF(
    transferencia: CartaTransferenciaData,
    options: GeneratePDFOptions = {},
) {
    return async () => {
        try {
            const blob = await pdf(
                <CartaTransferenciaPdf transferencia={transferencia} />,
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const ano = new Date(
                transferencia.data_aprovacao ?? transferencia.data_solicitacao,
            ).getFullYear();
            const nome = transferencia.recrutamento.municipe.nome_completo
                .toLowerCase()
                .replace(/\s+/g, '_')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            link.download = `carta_transferencia_${transferencia.id}_${nome}_${ano}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            options.onSuccess?.();
        } catch (error) {
            console.error(
                'Erro ao gerar PDF da carta de transferência:',
                error,
            );
            options.onError?.(error as Error);
        }
    };
}
