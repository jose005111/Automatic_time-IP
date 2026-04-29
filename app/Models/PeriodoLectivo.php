<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PeriodoLectivo extends Model
{
    protected $table = 'periodos_lectivos'; // Especifica a tabela se não seguir a convenção
    protected $fillable = [
        'ano',
        'estado',
        'semestre',
        'data_inicio',
        'data_fim',
     ];

     public function turmas()
     {
         return $this->hasMany(Turma::class, 'periodos_lectivo_id');
     }
}
