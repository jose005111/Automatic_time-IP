<?php

namespace App\Http\Controllers;

use App\Models\Disciplina;
use App\Models\Professor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DisciplinaController extends Controller
{
    /**
     * Lista as disciplinas com paginação e busca.
     */
    public function index(Request $request)
    {
        $disciplinas = Disciplina::with(['professores'])
            ->when($request->search, function ($query, $search) {
                $query->where('nome', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('disciplinas/index', [
            'disciplinas' => $disciplinas,
            'professores' => Professor::all(['id', 'nome']), // Para vincular no form
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * Salva uma nova disciplina e sincroniza os professores.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'professor_ids' => 'array', // Array de IDs de professores selecionados no front
            'professor_ids.*' => 'exists:professores,id'
        ]);

        $disciplina = Disciplina::create($validated);

        // Sincroniza os professores na tabela pivô 'disciplina_professores'
        if ($request->has('professor_ids')) {
            $disciplina->professores()->sync($validated['professor_ids']);
        }

        return redirect()->back()->with('success', 'Disciplina criada com sucesso!');
    }

    /**
     * Atualiza os dados da disciplina e sincroniza os professores.
     */
    public function update(Request $request, Disciplina $disciplina)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'professor_ids' => 'array',
            'professor_ids.*' => 'exists:professores,id'
        ]);

        $disciplina->update($validated);

        // O sync remove os antigos e adiciona os novos IDs enviados
        if ($request->has('professor_ids')) {
            $disciplina->professores()->sync($validated['professor_ids']);
        }

        return redirect()->back()->with('success', 'Disciplina atualizada com sucesso!');
    }

    /**
     * Remove a disciplina (o Laravel cuidará da tabela pivô se houver onDelete cascade).
     */
    public function destroy(Disciplina $disciplina)
    {
        // Remove os vínculos na tabela pivô primeiro (segurança manual)
        $disciplina->professores()->detach();
        
        $disciplina->delete();

        return redirect()->back()->with('success', 'Disciplina removida com sucesso!');
    }
}
