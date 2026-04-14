<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    protected $table = 'Salas';
    protected $fillable = [
        'designacao',
          'estado',
          'numero',
          'capacidade',
    ];

    //Relacionamentos

    public function turmas(){
        return $this->hasMany(Turma::class);
    }
}
