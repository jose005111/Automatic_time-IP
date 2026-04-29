<?php

namespace App\Http\Controllers;

use App\Models\Professor;
use App\Models\Departamento;
use App\Models\Disciplina;
use App\Models\TempoAula; // IMPORTANTE: Adicionar o Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

// ... imports anteriores

class ProfessorController extends Controller
{
    public function index(Request $request)
    {
        $professores = Professor::with(['disciplinasQueEnsina', 'disponibilidades'])
            ->when($request->search, function ($query, $search) {
                $query->where('nome', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('professores/index', [
            'professores' => $professores,
            'departamentos' => Departamento::all(['id', 'nome']), // Para o Select
            'disciplinas' => Disciplina::all(['id', 'nome']),
            'tempos_aulas' => TempoAula::orderBy('turno')->orderBy('hora_inicio')->get(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:professores,email',
            'categoria' => 'required|string',
            'especialidade' => 'required|string',
            'carga_horaria_max' => 'required|integer|min:1',
            'departamento_id' => 'required|exists:departamentos,id',
            'disciplina_ids' => 'nullable|array',
            'disponibilidade' => 'required|array',
        ]);

        DB::transaction(function () use ($validated) {
            $professor = Professor::create([
                'nome' => $validated['nome'],
                'email' => $validated['email'],
                'categoria' => $validated['categoria'],
                'especialidade' => $validated['especialidade'],
                'carga_horaria_max' => $validated['carga_horaria_max'],
                'departamento_id' => $validated['departamento_id'],
            ]);

            if (!empty($validated['disciplina_ids'])) {
                $professor->disciplinasQueEnsina()->sync($validated['disciplina_ids']);
            }

            $disponibilidadesData = array_map(function ($disp) use ($professor) {
                [$dia, $tempo_id] = explode('-', $disp);
                return [
                    'professor_id' => $professor->id,
                    'dia_semana' => $dia,
                    'tempo_aula_id' => $tempo_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $validated['disponibilidade']);

            DB::table('disponibilidade_professores')->insert($disponibilidadesData);
        });

        return redirect()->route('professores.index')->with('success', 'Professor cadastrado!');
    }

    public function update(Request $request, Professor $professore)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|email|unique:professores,email,' . $professore->id,
            'categoria' => 'required|string',
            'especialidade' => 'required|string',
            'carga_horaria_max' => 'required|integer|min:1',
            'departamento_id' => 'required|exists:departamentos,id',
            'disciplina_ids' => 'nullable|array',
            'disponibilidade' => 'required|array',
        ]);

        DB::transaction(function () use ($validated, $professore) {
            $professore->update($validated);

            if (isset($validated['disciplina_ids'])) {
                $professore->disciplinasQueEnsina()->sync($validated['disciplina_ids']);
            }

            DB::table('disponibilidade_professores')->where('professor_id', $professore->id)->delete();
            
            $disponibilidadesData = array_map(function ($disp) use ($professore) {
                [$dia, $tempo_id] = explode('-', $disp);
                return [
                    'professor_id' => $professore->id,
                    'dia_semana' => $dia,
                    'tempo_aula_id' => $tempo_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }, $validated['disponibilidade']);

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
