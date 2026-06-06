<?php
 
namespace App\Http\Controllers;
 
use App\Models\Municipe;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
 
class MunicipePdfController extends Controller
{
    /**
     * Gera e devolve o PDF completo de um munícipe.
     * Chama um script Python (reportlab) que recebe os dados via JSON stdin.
     */
    public function download(Municipe $municipe)
    {
        // Carrega todas as relações necessárias
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
 
        $payload = json_encode($municipe->toArray(), JSON_UNESCAPED_UNICODE);
 
        // Caminho do script Python (coloca em storage/app ou app/Services)
        $scriptPath = base_path('app/Services/gerar_pdf_municipe.py');
 
        dd($payload); // Debug: ver o JSON que será enviado para o Python
        $process = new Process(['python', $scriptPath]);
        $process->setInput($payload);
        $process->setTimeout(30);
        $process->run();
 
        if (!$process->isSuccessful()) {
            abort(500, 'Erro ao gerar PDF: ' . $process->getErrorOutput());
        }
 
        $pdfContent = $process->getOutput();
        $filename   = 'municipe_' . $municipe->id . '_' . now()->format('Ymd_His') . '.pdf';
 
        return response($pdfContent, 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length'      => strlen($pdfContent),
        ]);
    }
}
 
