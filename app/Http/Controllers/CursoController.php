<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Departamento;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class CursoController extends Controller
{
    /**
     * Listagem de cursos com pesquisa em nome e descrição.
     */
    public function index(Request $request)
    {
        return Inertia::render('cursos/index', [
            'cursos' => Curso::query()
                ->with('departamento') 
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('nome', 'like', "%{$search}%")
                          ->orWhere('descricao', 'like', "%{$search}%"); // Pesquisa também na descrição
                })
                ->paginate(10)
                ->withQueryString(),
            
            // Necessário para o Select de departamentos no formulário
            'departamentos' => Departamento::orderBy('nome')->get(['id', 'nome', 'sigla']),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Salva o curso com os novos campos da migration.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome'            => 'required|string|max:255|unique:cursos,nome',
            'descricao'       => 'required|string|max:1000',
            'data_inicio'     => 'required|date',
            'data_fim'        => 'required|date|after_or_equal:data_inicio', // Validação lógica de datas
            'departamento_id' => 'required|exists:departamentos,id',
        ], [
            'nome.unique' => 'Este curso já está registado.',
            'data_fim.after_or_equal' => 'A data de fim não pode ser anterior à data de início.',
        ]);

        Curso::create($validated);

        return Redirect::back()->with('success', 'Curso criado com sucesso.');
    }

    /**
     * Atualiza os dados incluindo descrição e datas.
     */
    public function update(Request $request, Curso $curso)
    {
        $validated = $request->validate([
            'nome'            => 'required|string|max:255|unique:cursos,nome,' . $curso->id,
            'descricao'       => 'required|string|max:1000',
            'data_inicio'     => 'required|date',
            'data_fim'        => 'required|date|after_or_equal:data_inicio',
            'departamento_id' => 'required|exists:departamentos,id',
        ]);

        $curso->update($validated);

        return Redirect::back()->with('success', 'Curso atualizado com sucesso.');
    }

    /**
     * Remove o curso.
     */
    public function destroy(Curso $curso)
    {
        $curso->delete();
        return Redirect::back()->with('success', 'Curso removido com sucesso.');
    }
}
