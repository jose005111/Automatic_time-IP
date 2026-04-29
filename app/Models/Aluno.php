<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Aluno extends Model
{
    protected $fillable = ['nome', 'matricula', 'curso_id', 'turma_id'];

    // Gera a matrícula automaticamente antes de criar o aluno
    protected static function booted()
    {
        static::creating(function ($aluno) {
            if (empty($aluno->matricula)) {
                // Gera uma string aleatória de 8 caracteres em maiúsculas (ex: AB83F9X1)
                $aluno->matricula = strtoupper(Str::random(8));
            }
        });
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function turma()
    {
        return $this->belongsTo(Turma::class);
    }
}
