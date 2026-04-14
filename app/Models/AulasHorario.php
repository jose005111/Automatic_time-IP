<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AulaHorario extends Model
{
    protected $table = 'aulas_horario';

    // Nota que NÃO colocámos 'turma_id' nem 'professor_id' no fillable.
    // O programador só precisa de enviar o 'turmas_professores_disciplinas_id'.
    // O Model tratará do resto sozinho.
    protected $fillable = [
        'turmas_professores_disciplinas_id',
        'sala_id',
        'dia_semana',
        'tempo_aula_id'
    ];

    /**
     * A Magia acontece aqui: Eventos do Ciclo de Vida do Eloquent
     */
    protected static function booted()
    {
        static::saving(function ($aula) {
            // Antes de gravar na base de dados, vamos buscar a Alocação (a pivot)
            $alocacao = TPD::find($aula->turmas_professores_disciplinas_id);
            
            if ($alocacao) {
                // Copiamos os IDs para as colunas de validação (Desnormalização)
                $aula->turma_id = $alocacao->turma_id;
                $aula->professor_id = $alocacao->professor_id;
            }
        });
    }

    // --- Relacionamentos ---

    public function demanda()
    {
        return $this->belongsTo(TPD::class, 'turmas_professores_disciplinas_id');
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class);
    }

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function tempoAula()
    {
        return $this->belongsTo(TempoAula::class);
    }
}
