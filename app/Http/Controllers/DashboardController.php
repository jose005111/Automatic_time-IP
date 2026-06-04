<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Recrutamento;
use App\Models\Transferencia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Estatísticas principais
        $estatisticas = [
            'totalMunicipes' => Municipe::count(),
            'recrutamentosPendentes' => Recrutamento::where('estado', 0)->count(),
            'recrutamentosAprovados' => Recrutamento::where('estado', 1)->count(),
            'totalTransferencias' => Transferencia::count(),
            'munícipesComBIValido' => Municipe::whereNotNull('bi_numero')
                ->where('bi_data_validade', '>=', now())
                ->count(),
        ];

        // Últimos 8 recrutamentos com nome do munícipe
        $recentRecrutamentos = Recrutamento::with('municipe')
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($rec) {
                return [
                    'id' => $rec->id,
                    'municipe_nome' => $rec->municipe->nome_completo ?? 'Desconhecido',
                    'data_recruta' => $rec->data_recruta,
                    'estado' => $rec->estado,
                    'municipio' => $rec->municipe->municipioNaturalidade->nome ?? null,
                ];
            });

        return Inertia::render('Dashboard', [
            'estatisticas' => $estatisticas,
            'recentRecrutamentos' => $recentRecrutamentos,
        ]);
    }
}