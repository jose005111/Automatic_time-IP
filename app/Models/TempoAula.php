<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TempoAula extends Model
{
    protected $table = 'tempos_aula';
    
    protected $fillable = ['hora_inicio', 'hora_fim', 'turno'];

    public function disponibilidades()
    {
        return $this->hasMany(DisponibilidadeProfessor::class);
    }

    public function aulas()
    {
        return $this->hasMany(AulaHorario::class);
    }
}
