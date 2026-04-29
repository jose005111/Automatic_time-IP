<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    protected $table = 'Salas';
    protected $fillable = [
      'bloco',
        'numero',
        'capacidade',   
        'tipo',
        'estado'
    ];

    //Relacionamentos

    public function turmas(){
        return $this->hasMany(Turma::class);
    }
}
