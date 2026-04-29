<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Turma;
use App\Models\Professor;
use App\Models\Curso;
use App\Models\AulaHorario;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Contagens Básicas
        $totalTurmas = Turma::count();
        $totalProfessores = Professor::count();
        $totalCursos = Curso::count();
        $aulasAgendadas = AulaHorario::count();

        // 2. Saúde dos Horários
        // Vamos calcular a percentagem de turmas que já têm pelo menos uma aula no horário
        $turmasComHorario = Turma::has('aulas')->count();
        $saudePercentagem = $totalTurmas > 0 ? round(($turmasComHorario / $totalTurmas) * 100) : 0;

        // 3. Últimos Horários (Busca as últimas 5 turmas e conta quantas aulas cada uma tem)
        $recentSchedules = Turma::with('curso')
            ->withCount('aulas')
            ->orderByDesc('updated_at') // Ordena pelas turmas modificadas mais recentemente
            ->take(5)
            ->get()
            ->map(function ($turma) {
                return [
                    'id' => $turma->id,
                    // Concatena o nome da turma com o curso
                    'name' => $turma->nome . ' - ' . ($turma->curso->nome ?? 'Geral'), 
                    'date' => $turma->updated_at ? $turma->updated_at->format('d/m/Y') : 'N/A',
                    'status' => $turma->aulas_count > 0 ? 'Concluído' : 'Rascunho',
                    'classes' => $turma->aulas_count,
                ];
            });

        // 4. Envia para o React via Inertia
        return Inertia::render('dashboard', [
            'estatisticas' => [
                'totalTurmas' => $totalTurmas,
                'totalProfessores' => $totalProfessores,
                'totalCursos' => $totalCursos,
                'saude' => $saudePercentagem,
                'aulasAgendadas' => $aulasAgendadas
            ],
            'recentSchedules' => $recentSchedules
        ]);
    }
}
