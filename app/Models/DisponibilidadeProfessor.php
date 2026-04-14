<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisponibilidadeProfessor extends Model
{
    protected $table = 'disponibilidade_professores';

    protected $fillable = ['professor_id', 'dia_semana', 'tempo_aula_id'];

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }

    public function tempoAula()
    {
        return $this->belongsTo(TempoAula::class);
    }
}
