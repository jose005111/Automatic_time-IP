<?php

namespace App\Http\Controllers;

use App\Models\Professor;
use App\Models\Departamento;
use App\Models\Disciplina;
use App\Models\TempoAula; // IMPORTANTE: Adicionar o Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfessorController extends Controller
{
    public function index(Request $request)
    {
        $professores = Professor::with(['disciplinasQueEnsina', 'disponibilidades'])
            ->when($request->search, function ($query, $search) {
                $query->where('nome', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhereHas('disciplinasQueEnsina', function ($q) use ($search) {
                          $q->where('nome', 'like', "%{$search}%");
                      });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Buscar os tempos de aula ordenados
        $temposAulas = TempoAula::orderBy('turno')->orderBy('hora_inicio')->get();

        return Inertia::render('professores/index', [
            'professores' => $professores,
            'departamentos' => Departamento::all(['id', 'nome']),
            'disciplinas' => Disciplina::all(),
            'tempos_aulas' => $temposAulas, // ENVIAR PARA O REACT
            'filters' => $request->only(['search'])
        ]);
    }

    // ... (restante do código: store, update, destroy, syncDisciplinas mantêm-se como corrigimos antes) ...
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:professores,email',  
            'disciplina_ids' => 'nullable|array',
            'disponibilidade' => 'required|array',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $professor = Professor::create([
                'nome' => $validated['nome'],
                'email' => $validated['email']
            ]);

            if (!empty($validated['disciplina_ids'])) {
                $professor->disciplinasQueEnsina()->sync($validated['disciplina_ids']);
            }

            $disponibilidadesData = [];
            foreach ($validated['disponibilidade'] as $disp) {
                [$dia, $tempo_aula] = explode('-', $disp);
                $disponibilidadesData[] = [
                    'professor_id' => $professor->id,
                    'dia_semana' => $dia,
                    'tempo_aula_id' => $tempo_aula,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('disponibilidade_professores')->insert($disponibilidadesData);
        });

        return redirect()->route('professores.index')->with('success', 'Professor e disponibilidade cadastrados!');
    }

    public function update(Request $request, Professor $professore)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:professores,email,' . $professore->id,
            'disciplina_ids' => 'nullable|array',
            'disponibilidade' => 'required|array',
        ]);

        DB::transaction(function () use ($validated, $professore) {
            $professore->update([
                'nome' => $validated['nome'],
                'email' => $validated['email']
            ]);

            if (isset($validated['disciplina_ids'])) {
                $professore->disciplinasQueEnsina()->sync($validated['disciplina_ids']);
            }

            DB::table('disponibilidade_professores')->where('professor_id', $professore->id)->delete();
            
            $disponibilidadesData = [];
            foreach ($validated['disponibilidade'] as $disp) {
                [$dia, $tempo_aula] = explode('-', $disp);
                $disponibilidadesData[] = [
                    'professor_id' => $professore->id,
                    'dia_semana' => $dia,
                    'tempo_aula_id' => $tempo_aula,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('disponibilidade_professores')->insert($disponibilidadesData);
        });

        return redirect()->route('professores.index')->with('success', 'Dados atualizados!');
    }

    public function destroy(Professor $professore)
    {
        $professore->disciplinasQueEnsina()->detach();
        $professore->delete();
        return redirect()->route('professores.index')->with('success', 'Professor removido.');
    }

    public function syncDisciplinas(Request $request, Professor $professor)
    {
        $validated = $request->validate([
            'disciplina_ids' => 'array',
            'disciplina_ids.*' => 'exists:disciplinas,id',
        ]);

        $professor->disciplinasQueEnsina()->sync($request->disciplina_ids);
        return redirect()->route('professores.index')->with('success', 'Disciplinas associadas!');
    }
}
