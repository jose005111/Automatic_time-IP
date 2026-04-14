<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ano extends Model
{
    protected $table = 'anos'; // Especifica a tabela se não seguir a convenção
    protected $fillable = ['ano', 'estado'];

}
