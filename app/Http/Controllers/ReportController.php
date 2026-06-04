<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Recrutamento;
use App\Models\Transferencia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->input('start_date', now()->subYear()->format('Y-m-d'));
        $endDate   = $request->input('end_date', now()->format('Y-m-d'));
        $provinciaId = $request->input('provincia_id');

        // ==================== KPIs ====================
        $kpis = [
            'total_municipes' => Municipe::count(),
            'recrutamentos_pendentes' => Recrutamento::where('estado', 0)->count(),
            'recrutamentos_aprovados' => Recrutamento::where('estado', 1)->count(),
            'transferencias_pendentes' => Transferencia::where('estado', 0)->count(),
            'municipes_com_bi_valido' => Municipe::whereNotNull('bi_numero')
                ->where('bi_data_validade', '>=', now())
                ->count(),
        ];

        // ==================== RECRUTAMENTOS POR MÊS (últimos 12 meses) ====================
        $recrutamentosPorMes = Recrutamento::selectRaw('DATE_FORMAT(data_recruta, "%Y-%m") as mes, COUNT(*) as total')
            ->whereBetween('data_recruta', [$startDate, $endDate])
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'mes' => Carbon::parse($item->mes . '-01')->format('M/Y'),
                    'total' => $item->total,
                ];
            });

        // ==================== DISTRIBUIÇÃO POR SEXO ====================
        $porSexo = Municipe::selectRaw('sexo, COUNT(*) as total')
            ->groupBy('sexo')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->sexo === 'M' ? 'Masculino' : 'Feminino',
                    'value' => $item->total,
                ];
            });

        // ==================== ESTADO DOS RECRUTAMENTOS ====================
        $porEstadoRecrutamento = Recrutamento::selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->get()
            ->map(function ($item) {
                $label = match($item->estado) {
                    0 => 'Pendente',
                    1 => 'Aprovado',
                    2 => 'Rejeitado',
                    default => 'Desconhecido'
                };
                return [
                    'name' => $label,
                    'value' => $item->total,
                ];
            });

        // ==================== TOP 8 MUNICÍPIOS COM MAIS MUNÍCIPES ====================
        $topMunicipios = Municipe::selectRaw('id_municipio_naturalidade, COUNT(*) as total')
            ->whereNotNull('id_municipio_naturalidade')
            ->groupBy('id_municipio_naturalidade')
            ->orderByDesc('total')
            ->limit(8)
            ->with('municipioNaturalidade')
            ->get()
            ->map(function ($item) {
                return [
                    'municipio' => $item->municipioNaturalidade->nome ?? 'Desconhecido',
                    'total' => $item->total,
                ];
            });

        // ==================== EVOLUÇÃO DE CADASTROS (últimos 12 meses) ====================
        $cadastrosPorMes = Municipe::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as mes, COUNT(*) as total')
            ->whereBetween('created_at', [now()->subYear(), now()])
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'mes' => Carbon::parse($item->mes . '-01')->format('M/Y'),
                    'cadastros' => $item->total,
                ];
            });

        return Inertia::render('Reports/Index', [
            'kpis' => $kpis,
            'recrutamentosPorMes' => $recrutamentosPorMes,
            'porSexo' => $porSexo,
            'porEstadoRecrutamento' => $porEstadoRecrutamento,
            'topMunicipios' => $topMunicipios,
            'cadastrosPorMes' => $cadastrosPorMes,
            'provincias' => \App\Models\Provincia::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['start_date', 'end_date', 'provincia_id']),
        ]);
    }
}
