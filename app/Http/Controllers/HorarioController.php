<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Turma;
use App\Services\GeradorHorarioService;
use Inertia\Inertia;
use Barryvdh\Snappy\Facades\SnappyPdf as PDF; // O teu import do Snappy

class HorarioController extends Controller
{
   public function index()
    {
        // Buscamos todas as turmas e anexamos o horário já gerado
        $turmas = Turma::with([
            'curso', 
            'sala',
            'aulas.disciplina', // Faz o "salto" pelo TPD para chegar à disciplina
            'aulas.professor',          // Isto funciona direto graças ao teu evento 'saving' no Model!
            'aulas.tempoAula'
        ])->get();

        return Inertia::render('horarios/index', [
            'turmas' => $turmas,
        ]);
    }
    public function gerarAutomaticamente(GeradorHorarioService $gerador)
    {
        // Usa o service que criámos na mensagem anterior
        $resultado = $gerador->gerar();

        if (count($resultado['falhas']) > 0) {
            return redirect()->back()->with('warning', count($resultado['falhas']) . ' aulas não puderam ser encaixadas devido a conflitos.');
        }

        return redirect()->back()->with('success', 'Horários gerados com sucesso! ' . $resultado['geradas'] . ' aulas agendadas.');
    }

    public function exportarPdf(Turma $turma)
    {
        // Carrega a turma com as relações necessárias para a View Blade do PDF
        $turma->load(['curso', 'sala', 'aulas.disciplina', 'aulas.professor', 'aulas.tempoAula']);
        
        // Retorna uma view Blade (resources/views/pdf/horario.blade.php) convertida em PDF
        $pdf = PDF::loadView('pdf.horario', compact('turma'));
        
        // return $pdf->download('horario_'.$turma->nome.'.pdf'); // Fazer download direto
        return $pdf->inline('horario_'.$turma->nome.'.pdf'); // Abrir no navegador
    }
}
