<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professor extends Model
{
    protected $table = 'professores';
    
    protected $fillable = ['nome', 'email'];

  public function disciplinasQueEnsina()
{
    // O Laravel já sabe que isto retorna uma coleção de objetos 'Disciplina'
    return $this->belongsToMany(Disciplina::class, 'disciplina_professores', 'professor_id', 'disciplina_id')
                ->withTimestamps(); 
}

    public function disponibilidades()
    {
        return $this->hasMany(DisponibilidadeProfessor::class);
    }

    public function alocacoes()
    {
        return $this->hasMany(TPD::class);
    }
}
