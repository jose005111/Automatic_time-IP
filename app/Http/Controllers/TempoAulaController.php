<?php

namespace App\Http\Controllers;

use App\Models\TempoAula;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TempoAulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tempos = TempoAula::query()
            ->when($request->search, function ($query, $search) {
                // Permite pesquisar pela hora exata
                $query->where('hora_inicio', 'like', "%{$search}%")
                      ->orWhere('hora_fim', 'like', "%{$search}%");
            })
            // Ordenamos por turno e depois por hora para a grelha ficar visualmente correta
            ->orderBy('turno')
            ->orderBy('hora_inicio')
            ->paginate(15) // Mantém a paginação da tua estrutura base
            ->withQueryString();

        return Inertia::render('tempos_aulas/index', [
            'tempos_aulas' => $tempos,
            'search' => $request->search ?? '',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hora_inicio' => 'required',
            'hora_fim' => 'required|after:hora_inicio',
            'turno' => 'required',
        ]);

        TempoAula::create($validated);

        return redirect()->route('tempos_aula.index')->with('success', 'Tempo de aula criado com sucesso!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TempoAula $tempos_aula)
    {
        $validated = $request->validate([
            'hora_inicio' => 'required',
            'hora_fim' => 'required|after:hora_inicio',
            'turno' => 'required',
        ]);

        $tempos_aula->update($validated);

        return redirect()->route('tempos_aula.index')->with('success', 'Tempo de aula atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TempoAula $tempos_aula)
    {
        $tempos_aula->delete();

        return redirect()->route('tempos_aula.index')->with('success', 'Tempo de aula removido.');
    }
}
