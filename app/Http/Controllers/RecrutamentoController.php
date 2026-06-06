<?php

namespace App\Http\Controllers;

use App\Models\Recrutamento;
use App\Models\Municipe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RecrutamentoController extends Controller
{
    /**
     * Lista recrutamentos com paginação + filtros (estado, data, search por munícipe).
     * Otimizado para o fluxo de Recenseamento Militar / Recrutamento da DMRMAB.
     */
    public function index(Request $request): Response
    {
        $query = Recrutamento::with(['municipe.municipioNaturalidade.provincia', 'transferencias'])
            ->latest('data_recruta');

        // Filtros profissionais
        if ($search = $request->input('search')) {
            $query->whereHas('municipe', function ($q) use ($search) {
                $q->where('nome_completo', 'like', "%{$search}%")
                  ->orWhere('bi_numero', 'like', "%{$search}%");
            });
        }

    if ($request->has('estado')) {
    $query->where('estado', '=', $request->input('estado'));
}

        // Filtro por mês/ano (útil para relatórios de recenseamento)
        if ($mes = $request->input('mes')) {
            $query->whereMonth('data_recruta', $mes);
        }
        if ($ano = $request->input('ano')) {
            $query->whereYear('data_recruta', $ano);
        }

        // // Default: últimos 3 meses se nenhum filtro de data (boa prática UX)
        // if (!$request->hasAny(['mes', 'ano', 'search', 'estado'])) {
        //     $query->where('data_recruta', '>=', now()->subMonths(3));
        // }

        $recrutamentos = $query->paginate(15)->withQueryString();

        return Inertia::render('Recrutamentos/Index', [
            'recrutamentos' => $recrutamentos,
            'municipes' => Municipe::select('id', 'nome_completo', 'bi_numero')->orderBy('nome_completo')->get(),
            'filters' => $request->only(['search', 'estado', 'mes', 'ano']),
            'estatisticas' => [
                'pendentes' => Recrutamento::where('estado', 0)->count(),
                'aprovados' => Recrutamento::where('estado', 1)->count(),
                'total_mes_atual' => Recrutamento::whereMonth('data_recruta', now()->month)
                    ->whereYear('data_recruta', now()->year)
                    ->count(),
            ],
        ]);
    }

    /**
     * Cria um novo recrutamento.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_municipe' => 'required|exists:municipes,id',
            'data_recruta' => 'required|date|before_or_equal:today',
            'observacoes' => 'nullable|string|max:2000',
            'estado' => 'required|integer|in:0,1,2',
        ]);

        $exist = Recrutamento::where('id_municipe', $validated['id_municipe'])
            ->where('estado', '!=', 2) // Ignora recrutamentos cancelados
            ->exists();

        if ($exist) {
            return redirect()
                ->back()
                ->with('error', 'Este munícipe já está registrado como recrutado.');
        }

        Recrutamento::create($validated);

        return redirect()
            ->route('recrutamentos.index')
            ->with('success', 'Recrutamento registado com sucesso!');
    }

    /**
     * Atualiza um recrutamento existente.
     */
    public function update(Request $request, Recrutamento $recrutamento)
    {
        $validated = $request->validate([
            'data_recruta' => 'required|date|before_or_equal:today',
            'observacoes' => 'nullable|string|max:2000',
            'estado' => 'required|integer|in:0,1,2',
        ]);

        $recrutamento->update($validated);

        return back()->with('success', 'Recrutamento atualizado com sucesso!');
    }

    /**
     * Remove um recrutamento.
     */
    public function destroy(Recrutamento $recrutamento)
    {
        $recrutamento->delete();

        return back()->with('success', 'Recrutamento removido com sucesso!');
    }
}
