<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * A geração de PDF é feita no frontend via @react-pdf/renderer.
 * Este controller serve apenas para expor os dados do munícipe
 * de forma autenticada para a página de impressão.
 */
class MunicipePdfController extends Controller
{
    /**
     * Devolve a página de impressão do munícipe.
     * A geração do PDF acontece via generateFichaMunicipePDF() no React.
     * Rota: GET /municipes/{municipe}/pdf  (protegida por auth)
     */
    public function download(Municipe $municipe)
    {
        $municipe->load([
            'municipioNaturalidade.provincia',
            'dadosBiograficos',
            'dadosComplementares',
            'endereco.provincia',
            'endereco.municipio',
            'pai',
            'mae',
            'recrutamentos.transferencias.municipioDestino',
        ]);

        $municipe->foto_url = $municipe->foto
            ? Storage::disk('public')->url($municipe->foto)
            : null;

        return Inertia::render('Municipes/PdfView', [
            'municipe' => $municipe,
        ]);
    }
}
