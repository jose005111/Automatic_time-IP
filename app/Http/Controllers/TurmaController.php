<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Sala;
use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Professor;
use App\Models\TPD;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TurmaController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('turmas/index', [
            'turmas' => Turma::with(['curso', 'sala'])->paginate(10),
            'salas' => Sala::all(),
            'cursos' => Curso::all(),
            // Enviamos disciplinas e professores para alimentar o formulário dinâmico
            'disciplinas' => Disciplina::all(),
            'professores' => Professor::all(), 
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'periodo' => 'required',
            'turno' => 'required',
            'ano' => 'required',
            'sala_id' => 'required|exists:salas,id',
            'curso_id' => 'required|exists:cursos,id',
            // Validação das atribuições dinâmicas
            'atribuicoes' => 'required|array|min:1',
            'atribuicoes.*.disciplina_id' => 'required|exists:disciplinas,id',
            'atribuicoes.*.professor_id' => 'required|exists:professores,id',
            'atribuicoes.*.tempos_semanais' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Criar a Turma
            $turma = Turma::create([
                'nome' => $validated['nome'],
                'periodo' => $validated['periodo'],
                'turno' => $validated['turno'],
                'ano' => $validated['ano'],
                'sala_id' => $validated['sala_id'],
                'curso_id' => $validated['curso_id'],
            ]);

            // 2. Criar as associações na tabela pivô (Gene do Horário)
            foreach ($validated['atribuicoes'] as $atribuicao) {
                TPD::create([
                    'turma_id' => $turma->id,
                    'disciplina_id' => $atribuicao['disciplina_id'],
                    'professor_id' => $atribuicao['professor_id'],
                    'tempos_semanais' => $atribuicao['tempos_semanais'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Turma e atribuições configuradas!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Turma $turma)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Turma $turma)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Turma $turma)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Turma $turma)
    {
        //
    }
}
