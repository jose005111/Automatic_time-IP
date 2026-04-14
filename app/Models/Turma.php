<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $table = 'turmas';

    protected $fillable = [
        'nome',
        'periodo',
        'turno',
        'ano',
        'sala_id',
        'curso_id'
    ];

    //Relacionamentos

    public function sala(){
        return $this->belongsTo(Sala::class);
    }
    public function curso(){
        return $this->belongsTo(Curso::class);
    }

    public function alocacoes() // O que a turma tem de ter aula
    {
        return $this->hasMany(TPD::class);
    }

    public function horarioGerado() // As aulas efetivas na grelha
    {
        return $this->hasMany(AulaHorario::class);
    }
}
