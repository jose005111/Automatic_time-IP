<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Municipio;
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
        $startDate   = $request->input('start_date', now()->subYear()->format('Y-m-d'));
        $endDate     = $request->input('end_date', now()->format('Y-m-d'));
        $municipioId = $request->input('municipio_id'); // null ou ID numérico

        // Normaliza "all" vindo do frontend para null
        if ($municipioId === 'all' || $municipioId === '') {
            $municipioId = null;
        }

        // ==================== KPIs ====================
        $kpis = [
            'total_municipes'           => Municipe::count(),
            'recrutamentos_pendentes'   => Recrutamento::where('estado', 0)->count(),
            'recrutamentos_aprovados'   => Recrutamento::where('estado', 1)->count(),
            'transferencias_pendentes'  => Transferencia::where('estado', 0)->count(),
            'municipes_com_bi_valido'   => Municipe::whereNotNull('bi_numero')
                                            ->where('bi_data_validade', '>=', now())
                                            ->count(),
        ];

        // ==================== RECRUTAMENTOS POR MÊS ====================
        $recrutamentosPorMes = Recrutamento::selectRaw('DATE_FORMAT(data_recruta, "%Y-%m") as mes, COUNT(*) as total')
            ->whereBetween('data_recruta', [$startDate, $endDate])
            ->when($municipioId, function ($query) use ($municipioId) {
                // Ajuste 'municipe' para o nome real da relação no modelo Recrutamento
                $query->whereHas('municipe', function ($q) use ($municipioId) {
                    $q->where('id_municipio_naturalidade', $municipioId);
                });
            })
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn($item) => [
                'mes'   => Carbon::parse($item->mes . '-01')->format('M/Y'),
                'total' => $item->total,
            ]);

        // ==================== DISTRIBUIÇÃO POR SEXO ====================
        $porSexo = Municipe::selectRaw('sexo, COUNT(*) as total')
            ->when($municipioId, fn($q) => $q->where('id_municipio_naturalidade', $municipioId))
            ->groupBy('sexo')
            ->get()
            ->map(fn($item) => [
                'name'  => $item->sexo === 'M' ? 'Masculino' : 'Feminino',
                'value' => $item->total,
            ]);

        // ==================== ESTADO DOS RECRUTAMENTOS ====================
        $porEstadoRecrutamento = Recrutamento::selectRaw('estado, COUNT(*) as total')
            ->whereBetween('data_recruta', [$startDate, $endDate])
            ->when($municipioId, function ($query) use ($municipioId) {
                $query->whereHas('municipe', function ($q) use ($municipioId) {
                    $q->where('id_municipio_naturalidade', $municipioId);
                });
            })
            ->groupBy('estado')
            ->get()
            ->map(fn($item) => [
                'name'  => match((int) $item->estado) {
                    0       => 'Pendente',
                    1       => 'Aprovado',
                    2       => 'Rejeitado',
                    default => 'Desconhecido',
                },
                'value' => $item->total,
            ]);

        // ==================== TOP 8 MUNICÍPIOS (apenas Benguela) ====================
        // Busca os IDs dos municípios de Benguela (id_provincia = 1 assumindo Benguela)
        $municipiosBenguelaIds = Municipio::where('id_provincia', 1)->pluck('id');

        $topMunicipios = Municipe::selectRaw('id_municipio_naturalidade, COUNT(*) as total')
            ->whereNotNull('id_municipio_naturalidade')
            ->whereIn('id_municipio_naturalidade', $municipiosBenguelaIds)
            ->when($municipioId, fn($q) => $q->where('id_municipio_naturalidade', $municipioId))
            ->groupBy('id_municipio_naturalidade')
            ->orderByDesc('total')
            ->limit(8)
            ->with('municipioNaturalidade')
            ->get()
            ->map(fn($item) => [
                'municipio' => $item->municipioNaturalidade->nome ?? 'Desconhecido',
                'total'     => $item->total,
            ]);

        // ==================== EVOLUÇÃO DE CADASTROS (últimos 12 meses) ====================
        $cadastrosPorMes = Municipe::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as mes, COUNT(*) as total')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($municipioId, fn($q) => $q->where('id_municipio_naturalidade', $municipioId))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn($item) => [
                'mes'      => Carbon::parse($item->mes . '-01')->format('M/Y'),
                'cadastros' => $item->total,
            ]);

        return Inertia::render('Reports/Index', [
            'kpis'                  => $kpis,
            'recrutamentosPorMes'   => $recrutamentosPorMes,
            'porSexo'               => $porSexo,
            'porEstadoRecrutamento' => $porEstadoRecrutamento,
            'topMunicipios'         => $topMunicipios,
            'cadastrosPorMes'       => $cadastrosPorMes,
            'Municipios'            => Municipio::where('id_provincia', 1)->get(),
            'filters'               => $request->only(['start_date', 'end_date', 'municipio_id']),
        ]);
    }
}
