<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Progenitor extends Model
{
    use HasFactory;
    
    protected $table = 'progenitores';


    protected $fillable = [
        'nome_completo',
        'data_nascimento',
        'naturalidade',
        'profissao',
        'sexo',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
    ];

    public function filhosComoPai(): HasMany
    {
        return $this->hasMany(Municipe::class, 'id_pai');
    }

    public function filhosComoMae(): HasMany
    {
        return $this->hasMany(Municipe::class, 'id_mae');
    }
}
