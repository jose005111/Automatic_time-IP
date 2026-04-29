<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Sala;
use App\Models\Turma;
use App\Models\Disciplina;
use App\Models\Professor;
use App\Models\TPD;
use App\Models\PeriodoLectivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TurmaController extends Controller
{
    public function index(Request $request)
    {
        $turmas = Turma::with(['curso', 'sala', 'periodoLectivo', 'alocacoes.disciplina', 'alocacoes.professor'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return Inertia::render('turmas/index', [
            'turmas' => $turmas,
            'salas' => Sala::all(),
            'cursos' => Curso::all(),
            'periodosLectivos' => PeriodoLectivo::where('estado', 'activo')
                ->orWhere('estado', 'inactivo')
                ->orderBy('ano', 'desc')
                ->orderBy('semestre', 'desc')
                ->get(),
            'disciplinas' => Disciplina::all(),
            'professores' => Professor::with('disciplinasQueEnsina')->get(),
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'regime' => 'required|in:0,1', // 0=Regular, 1=Pós-Laboral
            'turno' => 'required|in:0,1,2', // 0=Manhã, 1=Tarde, 2=Noite
            'periodos_lectivo_id' => 'required|exists:periodos_lectivos,id',
            'sala_id' => 'required|exists:salas,id',
            'curso_id' => 'required|exists:cursos,id',
            // Validação das atribuições dinâmicas
            'alocacoes' => 'required|array|min:1',
            'alocacoes.*.disciplina_id' => 'required|exists:disciplinas,id',
            'alocacoes.*.professor_id' => 'required|exists:professores,id',
            'alocacoes.*.tempos_semanais' => 'required|integer|min:1|max:10',
        ]);

        // Verificar se a sala está disponível no período
        $salaOcupada = $this->verificarDisponibilidadeSala(
            $validated['sala_id'],
            $validated['periodos_lectivo_id'],
            null
        );

        if ($salaOcupada) {
            return redirect()->back()->withErrors([
                'sala_id' => 'Esta sala já está sendo utilizada por outra turma neste período lectivo.'
            ]);
        }

        DB::transaction(function () use ($validated) {
            // 1. Criar a Turma
            $turma = Turma::create([
                'nome' => $validated['nome'],
                'regime' => $validated['regime'],
                'turno' => $validated['turno'],
                'periodos_lectivo_id' => $validated['periodos_lectivo_id'],
                'sala_id' => $validated['sala_id'],
                'curso_id' => $validated['curso_id'],
            ]);

            // 2. Criar as associações na tabela TPD (Turma-Professor-Disciplina)
            foreach ($validated['alocacoes'] as $atribuicao) {
                // Verificar se o professor já não está muito ocupado neste período
                $cargaHorariaProfessor = $this->calcularCargaHorariaProfessor(
                    $atribuicao['professor_id'],
                    $validated['periodos_lectivo_id']
                );
                
                $novaCarga = $cargaHorariaProfessor + $atribuicao['tempos_semanais'];
                
                if ($novaCarga > 40) { // Limite de 40 horas semanais
                    throw new \Exception("Professor tem carga horária excedente (máximo 40 horas semanais)");
                }

                TPD::create([
                    'turma_id' => $turma->id,
                    'disciplina_id' => $atribuicao['disciplina_id'],
                    'professor_id' => $atribuicao['professor_id'],
                    'tempos_semanais' => $atribuicao['tempos_semanais'],
                ]);
            }
        });

        return redirect()->back()->with('success', 'Turma criada e docentes atribuídos com sucesso!');
    }

    public function update(Request $request, Turma $turma)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'regime' => 'required|in:0,1',
            'turno' => 'required|in:0,1,2',
            'periodos_lectivo_id' => 'required|exists:periodos_lectivos,id',
            'sala_id' => 'required|exists:salas,id',
            'curso_id' => 'required|exists:cursos,id',
            'alocacoes' => 'required|array|min:1',
            'alocacoes.*.disciplina_id' => 'required|exists:disciplinas,id',
            'alocacoes.*.professor_id' => 'required|exists:professores,id',
            'alocacoes.*.tempos_semanais' => 'required|integer|min:1|max:10',
        ]);

        // Verificar disponibilidade da sala (excluindo a turma atual)
        $salaOcupada = $this->verificarDisponibilidadeSala(
            $validated['sala_id'],
            $validated['periodos_lectivo_id'],
            $turma->id
        );

        if ($salaOcupada) {
            return redirect()->back()->withErrors([
                'sala_id' => 'Esta sala já está sendo utilizada por outra turma neste período lectivo.'
            ]);
        }

        try {
            DB::transaction(function () use ($validated, $turma) {
                // 1. Atualizar os dados principais da Turma
                $turma->update([
                    'nome' => $validated['nome'],
                    'regime' => $validated['regime'],
                    'turno' => $validated['turno'],
                    'periodos_lectivo_id' => $validated['periodos_lectivo_id'],
                    'sala_id' => $validated['sala_id'],
                    'curso_id' => $validated['curso_id'],
                ]);

                // 2. Verificar carga horária dos professores antes de atualizar
                foreach ($validated['alocacoes'] as $atribuicao) {
                    $cargaHorariaProfessor = $this->calcularCargaHorariaProfessor(
                        $atribuicao['professor_id'],
                        $validated['periodos_lectivo_id'],
                        $turma->id
                    );
                    
                    $novaCarga = $cargaHorariaProfessor + $atribuicao['tempos_semanais'];
                    
                    if ($novaCarga > 40) {
                        $professor = Professor::find($atribuicao['professor_id']);
                        throw new \Exception("Professor {$professor->nome} excederia o limite de 40 horas semanais");
                    }
                }

                // 3. Remover atribuições antigas
                TPD::where('turma_id', $turma->id)->delete();

                // 4. Criar novas atribuições
                foreach ($validated['alocacoes'] as $atribuicao) {
                    TPD::create([
                        'turma_id' => $turma->id,
                        'disciplina_id' => $atribuicao['disciplina_id'],
                        'professor_id' => $atribuicao['professor_id'],
                        'tempos_semanais' => $atribuicao['tempos_semanais'],
                    ]);
                }
            });

            return redirect()->back()->with('success', 'Turma atualizada com sucesso!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(Turma $turma)
    {
        try {
            DB::transaction(function () use ($turma) {
                // Verificar se existem aulas marcadas
                if ($turma->aulas()->exists()) {
                    throw new \Exception('Não é possível excluir a turma porque existem aulas já agendadas.');
                }

                // 1. Apagar as relações na tabela TPD
                TPD::where('turma_id', $turma->id)->delete();

                // 2. Apagar a turma
                $turma->delete();
            });

            return redirect()->back()->with('success', 'Turma excluída com sucesso!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Verifica se uma sala já está ocupada por outra turma no mesmo período lectivo
     */
    private function verificarDisponibilidadeSala($salaId, $periodoLectivoId, $turmaIdExcluir = null)
    {
        $query = Turma::where('sala_id', $salaId)
            ->where('periodos_lectivo_id', $periodoLectivoId);
        
        if ($turmaIdExcluir) {
            $query->where('id', '!=', $turmaIdExcluir);
        }
        
        return $query->exists();
    }

    /**
     * Calcula a carga horária total de um professor em um período lectivo
     */
    private function calcularCargaHorariaProfessor($professorId, $periodoLectivoId, $turmaIdExcluir = null)
    {
        $query = TPD::where('professor_id', $professorId)
            ->whereHas('turma', function($q) use ($periodoLectivoId) {
                $q->where('periodos_lectivo_id', $periodoLectivoId);
            });
        
        if ($turmaIdExcluir) {
            $query->where('turma_id', '!=', $turmaIdExcluir);
        }
        
        return $query->sum('tempos_semanais');
    }
}
