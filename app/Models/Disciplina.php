<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Disciplina extends Model
{
    protected $table = 'disciplinas';
    protected $fillable = ['nome'];

    public function professores()
    {
        return $this->belongsToMany(Professor::class, 'disciplina_professores');
    }

    public function alocacoes() // As demandas de aula (TPD)
    {
        return $this->hasMany(TPD::class, 'disciplina_id');
    }

    
}
