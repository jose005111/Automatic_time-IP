<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'cursos';
    
    protected $fillable = [
        'nome',
        'descricao',
        'data_inicio',
        'data_fim',
        'departamento_id',
    ];
    
      //Relacionamentos

    public function turmas(){
        return $this->hasMany(Turma::class);
    }

    public function departamento(){
        return $this->belongsTo(Departamento::class);
    }
}
