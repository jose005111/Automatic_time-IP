<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turma extends Model
{
    protected $table = 'turmas';

    protected $fillable = [
        'nome',
        'regime',      // antigo 'periodo'
        'turno',
        'periodos_lectivo_id',
        'sala_id',
        'curso_id'
    ];

    // Accessor para manter compatibilidade com código existente
    public function getPeriodoAttribute()
    {
        return $this->regime;
    }

    public function getAnoAttribute()
    {
        // Se você tiver o ano na turma, caso contrário, pode vir do curso
        return $this->curso->duracao ?? '1';
    }

    // Relacionamentos
    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function periodoLectivo()
    {
        return $this->belongsTo(PeriodoLectivo::class, 'periodos_lectivo_id');
    }

    public function alocacoes() // O que a turma tem de ter aula (TPD)
    {
        return $this->hasMany(TPD::class);
    }

    public function aulas() // As aulas efetivas na grelha
    {
        return $this->hasMany(AulaHorario::class);
    }
}
