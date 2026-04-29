<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamentos';
    
    protected $fillable = [
        'nome',
        'sigla',
    ];

    public function cursos()
    {
        return $this->hasMany(Curso::class, 'departamento_id');
    }

    public function professores()
    {
        return $this->hasMany(Professor::class, 'departamento_id');
    }

}
  
