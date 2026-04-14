<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $table = 'cursos';
    
    protected $fillable = [
        'nome',
    ];
    
      //Relacionamentos

    public function turmas(){
        return $this->hasMany(Turma::class);
    }
}
