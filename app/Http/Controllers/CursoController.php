<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class CursoController extends Controller
{
    /**
     * Exibe a listagem de cursos com suporte a pesquisa e paginação.
     */
    public function index(Request $request)
    {
        return Inertia::render('cursos/index', [
            'cursos' => Curso::query()
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('nome', 'like', "%{$search}%")
                          ->orWhere('sigla', 'like', "%{$search}%");
                })
                ->paginate(10)
                ->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Armazena um novo curso no catálogo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:cursos,nome',
        ], [
            'nome.unique' => 'Este curso já está registado no sistema.',
        ]);

        Curso::create($validated);

        return Redirect::back()->with('success', 'Curso criado com sucesso.');
    }

    /**
     * Atualiza os dados de um curso específico.
     */
    public function update(Request $request, Curso $curso)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255|unique:cursos,nome,' . $curso->id,
        ]);

        $curso->update($validated);

        return Redirect::back()->with('success', 'Curso atualizado com sucesso.');
    }

    /**
     * Remove um curso do sistema.
     */
    public function destroy(Curso $curso)
    {
        // Nota: Futuramente, podes querer verificar se existem turmas 
        // ou disciplinas associadas antes de permitir a exclusão.
        $curso->delete();

        return Redirect::back()->with('success', 'Curso removido com sucesso.');
    }
}
