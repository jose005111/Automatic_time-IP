<?php

namespace App\Http\Controllers;

use App\Models\DadosComplementar;
use App\Models\Municipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DadosComplementaresController extends Controller
{
    /**
     * Lista todos os dados complementares com o munícipe associado.
     */
    public function index(Request $request)
    {
        $query = DadosComplementar::with('municipe:id,nome_completo,sexo')
            ->latest();

        if ($search = $request->input('search')) {
            $query->whereHas('municipe', fn($q) =>
                $q->where('nome_completo', 'like', "%{$search}%")
            )->orWhere('nif', 'like', "%{$search}%")
             ->orWhere('profissao', 'like', "%{$search}%");
        }

        if ($habilitacao = $request->input('habilitacao')) {
            $query->where('habilitacao_literaria', $habilitacao);
        }

        return Inertia::render('DadosComplementares/Index', [
            'registos' => $query->paginate(20)->withQueryString(),
            'filters'  => $request->only(['search', 'habilitacao']),
        ]);
    }

    /**
     * Cria ou actualiza os dados complementares de um munícipe.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_municipe'           => 'required|exists:municipes,id',
            'caixa_postal'          => 'nullable|string|max:20',
            'nif'                   => 'nullable|string|max:30',
            'encargo_familiar'      => 'nullable|integer|min:0',
            'habilitacao_literaria' => 'nullable|string|max:100',
            'profissao'             => 'nullable|string|max:100',
            'numero_irmaos'         => 'nullable|integer|min:0',
            'entidade_emissora_bi'  => 'nullable|string|max:100',
            'numero_carta_conducao' => 'nullable|string|max:50',
            'data_emissao_carta'    => 'nullable|date',
            'data_validade_carta'   => 'nullable|date|after_or_equal:data_emissao_carta',
            'atributo'              => 'nullable|string|max:100',
        ]);

        DadosComplementar::updateOrCreate(
            ['id_municipe' => $validated['id_municipe']],
            $validated
        );

        return back()->with('success', 'Dados complementares guardados com sucesso!');
    }

    /**
     * Mostra os dados complementares de um registo específico.
     */
    public function show(DadosComplementar $dadosComplementar)
    {
        return response()->json(
            $dadosComplementar->load('municipe:id,nome_completo')
        );
    }

    /**
     * Actualiza um registo existente.
     */
    public function update(Request $request, DadosComplementar $dadosComplementar)
    {
        $validated = $request->validate([
            'caixa_postal'          => 'nullable|string|max:20',
            'nif'                   => 'nullable|string|max:30',
            'encargo_familiar'      => 'nullable|integer|min:0',
            'habilitacao_literaria' => 'nullable|string|max:100',
            'profissao'             => 'nullable|string|max:100',
            'numero_irmaos'         => 'nullable|integer|min:0',
            'entidade_emissora_bi'  => 'nullable|string|max:100',
            'numero_carta_conducao' => 'nullable|string|max:50',
            'data_emissao_carta'    => 'nullable|date',
            'data_validade_carta'   => 'nullable|date|after_or_equal:data_emissao_carta',
            'atributo'              => 'nullable|string|max:100',
        ]);

        $dadosComplementar->update($validated);

        return back()->with('success', 'Dados complementares actualizados com sucesso!');
    }

    /**
     * Remove um registo de dados complementares.
     */
    public function destroy(DadosComplementar $dadosComplementar)
    {
        $dadosComplementar->delete();

        return back()->with('success', 'Dados complementares removidos com sucesso!');
    }
}
