<?php

namespace App\Services;

use App\Models\TempoAula;
use App\Models\AulaHorario;
use App\Models\DisponibilidadeProfessor;
use App\Models\TPD; 
use Illuminate\Support\Facades\DB;

class GeradorHorarioService
{
    public function gerar()
    {
        // 1. LIMPEZA SEGURA
        DB::table('aulas_horario')->delete(); 

        // 2. CARGA DE DADOS
        // Ordenamos os tempos para garantir que o índice 0,1,2 seja o 1º bloco e 3,4,5 o 2º
        $temposAula = TempoAula::orderBy('hora_inicio')->get()->groupBy('turno'); 
        $disponibilidades = $this->carregarDisponibilidades();
        
        $matrizCurricular = TPD::with(['turma', 'professor', 'disciplina'])
            ->orderBy('tempos_semanais', 'desc')
            ->get();

        $horarioTurma = []; 
        $horarioProf = [];  
        $aulasParaSalvar = [];
        $aulasNaoAlocadas = [];
        
        $diasSemana = [1, 2, 3, 4, 5];

        foreach ($matrizCurricular as $alocacao) {
            $turmaId = $alocacao->turma_id;
            $profId = $alocacao->professor_id;
            $discId = $alocacao->disciplina_id;
            $temposRestantes = $alocacao->tempos_semanais;
            $turnoTurma = $alocacao->turma->turno;

            $temposDoTurno = $temposAula->get($turnoTurma);
            if (!$temposDoTurno || $temposDoTurno->count() < 6) continue;

            // Definimos os blocos (Índices 0-2 e 3-5 da lista de tempos ordenados)
            $blocosDefinidos = [
                'bloco1' => [$temposDoTurno[0], $temposDoTurno[1], $temposDoTurno[2]],
                'bloco2' => [$temposDoTurno[3], $temposDoTurno[4], $temposDoTurno[5]],
            ];

            // Tentamos alocar em pedaços de 3 tempos (Blocos Inteiros)
            while ($temposRestantes > 0) {
                $alocado = false;
                $tamanhoDoBloco = $temposRestantes >= 3 ? 3 : $temposRestantes;

                $diasTeste = $diasSemana;
                shuffle($diasTeste);

                foreach ($diasTeste as $dia) {
                    $nomesBlocos = ['bloco1', 'bloco2'];
                    shuffle($nomesBlocos);

                    foreach ($nomesBlocos as $nomeBloco) {
                        $objetosTempo = $blocosDefinidos[$nomeBloco];
                        
                        // Verificar se o bloco tem espaço suficiente para o que precisamos
                        if ($this->podeAlocarNoBloco($dia, $objetosTempo, $turmaId, $profId, $disponibilidades, $horarioTurma, $horarioProf, $tamanhoDoBloco)) {
                            
                            // Realizar a alocação dos tempos
                            for ($k = 0; $k < $tamanhoDoBloco; $k++) {
                                $t = $objetosTempo[$k];
                                
                                $horarioTurma[$turmaId][$dia][$t->id] = true;
                                $horarioProf[$profId][$dia][$t->id] = true;

                                $aulasParaSalvar[] = [
                                    'turma_id' => $turmaId,
                                    'disciplina_id' => $discId,
                                    'professor_id' => $profId,
                                    'dia_semana' => $dia,
                                    'tempo_aula_id' => $t->id,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                            }

                            $temposRestantes -= $tamanhoDoBloco;
                            $alocado = true;
                            break 2; // Sai do loop de blocos e dias, volta para o while
                        }
                    }
                }

                if (!$alocado) {
                    $aulasNaoAlocadas[] = [
                        'turma' => $alocacao->turma->nome,
                        'professor' => $alocacao->professor->nome ?? 'N/A',
                        'disciplina' => $alocacao->disciplina->nome ?? 'N/A',
                        'motivo' => "Não foi possível encontrar um bloco de {$tamanhoDoBloco} tempos livre."
                    ];
                    break; // Evita loop infinito se não conseguir alocar
                }
            }
        }

        foreach (array_chunk($aulasParaSalvar, 500) as $chunk) {
            AulaHorario::insert($chunk);
        }

        return [
            'status' => 'success',
            'geradas' => count($aulasParaSalvar),
            'falhas' => $aulasNaoAlocadas
        ];
    }

    /**
     * Verifica se um bloco (3 tempos seguidos) está totalmente disponível
     */
    private function podeAlocarNoBloco($dia, $tempos, $turmaId, $profId, $disponibilidades, $horarioTurma, $horarioProf, $tamanho)
    {
        for ($i = 0; $i < $tamanho; $i++) {
            $tId = $tempos[$i]->id;

            // 1. Disponibilidade do Professor
            if (!isset($disponibilidades[$profId][$dia][$tId])) return false;

            // 2. Turma ocupada neste tempo?
            if (isset($horarioTurma[$turmaId][$dia][$tId])) return false;

            // 3. Professor ocupado noutra turma?
            if (isset($horarioProf[$profId][$dia][$tId])) return false;
        }

        return true;
    }

    private function carregarDisponibilidades(): array
    {
        $disponibilidades = DisponibilidadeProfessor::all();
        $mapa = [];
        foreach ($disponibilidades as $disp) {
            $mapa[$disp->professor_id][$disp->dia_semana][$disp->tempo_aula_id] = true;
        }
        return $mapa;
    }
}
