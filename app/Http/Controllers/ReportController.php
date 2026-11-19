<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Municipio;
use App\Models\Provincia;
use App\Models\Recrutamento;
use App\Models\Transferencia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $this->parseDate($request->input('start_date'));
        $endDate = $this->parseDate($request->input('end_date'));
        $endDateInclusive = $endDate?->copy()->endOfDay();

        $municipioId = $this->normalizeId($request->input('municipio_id'));
        $provinciaId = $this->normalizeId($request->input('provincia_id'));
        $estado = $this->normalizeEnum($request->input('estado'), ['0', '1', '2']);
        $sexo = $this->normalizeEnum($request->input('sexo'), ['M', 'F']);
        $periodo = $this->normalizeEnum(
            $request->input('periodo'),
            ['12m', 'year', 'all', 'custom'],
            'all'
        );

        $municipioNome = $municipioId
            ? Municipio::whereKey($municipioId)->value('nome')
            : null;
        $provinciaNome = $provinciaId
            ? Provincia::whereKey($provinciaId)->value('nome')
            : null;

        $applyMunicipeFilters = function ($query) use ($municipioId, $provinciaId, $sexo) {
            if ($municipioId) {
                $query->where('id_municipio_naturalidade', $municipioId);
            }

            if ($provinciaId) {
                $query->whereHas(
                    'municipioNaturalidade.provincia',
                    fn ($q) => $q->where('provincias.id', $provinciaId)
                );
            }

            if ($sexo) {
                $query->where('sexo', $sexo);
            }
        };

        $applyRecrutamentoFilters = function ($query) use (
            $startDate,
            $endDateInclusive,
            $municipioId,
            $provinciaId,
            $sexo,
            $estado
        ) {
            if ($startDate) {
                $query->where('data_recruta', '>=', $startDate->toDateString());
            }

            if ($endDateInclusive) {
                $query->where('data_recruta', '<=', $endDateInclusive->toDateString());
            }

            if ($estado !== null) {
                $query->where('estado', (int) $estado);
            }

            if ($municipioId || $provinciaId || $sexo) {
                $query->whereHas('municipe', function ($q) use ($municipioId, $provinciaId, $sexo) {
                    if ($municipioId) {
                        $q->where('id_municipio_naturalidade', $municipioId);
                    }

                    if ($provinciaId) {
                        $q->whereHas(
                            'municipioNaturalidade.provincia',
                            fn ($sub) => $sub->where('provincias.id', $provinciaId)
                        );
                    }

                    if ($sexo) {
                        $q->where('sexo', $sexo);
                    }
                });
            }
        };

        $municipesQuery = Municipe::query();
        $applyMunicipeFilters($municipesQuery);

        if ($startDate) {
            $municipesQuery->where('created_at', '>=', $startDate);
        }

        if ($endDateInclusive) {
            $municipesQuery->where('created_at', '<=', $endDateInclusive);
        }

        $recrutamentosQuery = Recrutamento::query();
        $applyRecrutamentoFilters($recrutamentosQuery);

        $kpis = [
            'total_municipes' => (clone $municipesQuery)->count(),
            'total_recrutamentos' => (clone $recrutamentosQuery)->count(),
            'recrutamentos_pendentes' => (clone $recrutamentosQuery)
                ->where('estado', 0)
                ->count(),
            'recrutamentos_aprovados' => (clone $recrutamentosQuery)
                ->where('estado', 1)
                ->count(),
            'transferencias_pendentes' => Transferencia::where('estado', 0)
                ->whereHas('recrutamento', $applyRecrutamentoFilters)
                ->count(),
            'municipes_com_bi_valido' => (clone $municipesQuery)
                ->whereNotNull('bi_numero')
                ->where('bi_data_validade', '>=', now())
                ->count(),
        ];

        $recrutamentosPorMes = (clone $recrutamentosQuery)
            ->selectRaw('
                DATE_FORMAT(data_recruta, "%Y-%m") as mes,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN estado = 2 THEN 1 ELSE 0 END) as rejeitados
            ')
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($item) => [
                'mes' => Carbon::parse($item->mes.'-01')->format('m/Y'),
                'total' => (int) $item->total,
                'pendentes' => (int) $item->pendentes,
                'aprovados' => (int) $item->aprovados,
                'rejeitados' => (int) $item->rejeitados,
            ]);

        $sexoCounts = (clone $municipesQuery)
            ->selectRaw('sexo, COUNT(*) as total')
            ->groupBy('sexo')
            ->pluck('total', 'sexo');

        $porSexo = collect(['M' => 'Masculino', 'F' => 'Feminino'])
            ->map(fn ($label, $key) => [
                'name' => $label,
                'value' => (int) ($sexoCounts[$key] ?? 0),
            ])
            ->values();

        $estadoCounts = (clone $recrutamentosQuery)
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $porEstadoRecrutamento = collect([
            0 => 'Pendente',
            1 => 'Aprovado',
            2 => 'Rejeitado',
        ])
            ->map(fn ($label, $key) => [
                'name' => $label,
                'value' => (int) ($estadoCounts[$key] ?? 0),
            ])
            ->values();

        $topMunicipios = (clone $municipesQuery)
            ->selectRaw('id_municipio_naturalidade, COUNT(*) as total')
            ->whereNotNull('id_municipio_naturalidade')
            ->groupBy('id_municipio_naturalidade')
            ->orderByDesc('total')
            ->limit(8)
            ->with('municipioNaturalidade')
            ->get()
            ->map(fn ($item) => [
                'municipio' => $item->municipioNaturalidade->nome ?? 'Desconhecido',
                'total' => (int) $item->total,
            ]);

        $cadastrosPorMes = (clone $municipesQuery)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as mes, COUNT(*) as total')
            ->groupBy('mes')
            ->orderBy('mes')
            ->get()
            ->map(fn ($item) => [
                'mes' => Carbon::parse($item->mes.'-01')->format('m/Y'),
                'cadastros' => (int) $item->total,
            ]);

        $faixasEtarias = collect([
            'Menos de 18' => 0,
            '18 a 25' => 0,
            '26 a 35' => 0,
            '36 a 50' => 0,
            'Mais de 50' => 0,
        ]);

        foreach ((clone $municipesQuery)->get(['data_nascimento']) as $municipe) {
            $idade = (int) $municipe->data_nascimento->diffInYears(now());

            $faixa = match (true) {
                $idade < 18 => 'Menos de 18',
                $idade <= 25 => '18 a 25',
                $idade <= 35 => '26 a 35',
                $idade <= 50 => '36 a 50',
                default => 'Mais de 50',
            };

            $faixasEtarias[$faixa] = $faixasEtarias[$faixa] + 1;
        }

        $faixasEtarias = $faixasEtarias
            ->map(fn ($total, $faixa) => ['name' => $faixa, 'value' => $total])
            ->values();

        $ultimosRecrutamentos = (clone $recrutamentosQuery)
            ->with('municipe.municipioNaturalidade')
            ->latest('data_recruta')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'nome' => $item->municipe?->nome_completo ?? '—',
                'data' => $item->data_recruta?->format('d/m/Y') ?? '—',
                'estado' => match ((int) $item->estado) {
                    0 => 'Pendente',
                    1 => 'Aprovado',
                    2 => 'Rejeitado',
                    default => 'Desconhecido',
                },
                'estado_valor' => (int) $item->estado,
                'municipio' => $item->municipe?->municipioNaturalidade?->nome ?? '—',
            ]);

        return Inertia::render('Reports/Index', [
            'kpis' => $kpis,
            'recrutamentosPorMes' => $recrutamentosPorMes,
            'porSexo' => $porSexo,
            'porEstadoRecrutamento' => $porEstadoRecrutamento,
            'topMunicipios' => $topMunicipios,
            'cadastrosPorMes' => $cadastrosPorMes,
            'faixasEtarias' => $faixasEtarias,
            'ultimosRecrutamentos' => $ultimosRecrutamentos,
            'Municipios' => Municipio::orderBy('nome')->get(['id', 'nome', 'id_provincia']),
            'Provincias' => Provincia::orderBy('nome')->get(['id', 'nome']),
            'filters' => [
                'start_date' => $startDate?->format('Y-m-d'),
                'end_date' => $endDate?->format('Y-m-d'),
                'municipio_id' => $municipioId,
                'provincia_id' => $provinciaId,
                'estado' => $estado,
                'sexo' => $sexo,
                'periodo' => $periodo,
                'municipio_nome' => $municipioNome,
                'provincia_nome' => $provinciaNome,
            ],
        ]);
    }

    private function parseDate(mixed $value): ?Carbon
    {
        if (! filled($value)) {
            return null;
        }

        try {
            return Carbon::parse($value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizeId(mixed $value): ?int
    {
        if ($value === null || $value === '' || $value === 'all') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function normalizeEnum(mixed $value, array $allowed, ?string $default = null): ?string
    {
        if ($value === null || $value === '' || $value === 'all') {
            return $default;
        }

        $value = (string) $value;

        return in_array($value, $allowed, true) ? $value : $default;
    }
}
