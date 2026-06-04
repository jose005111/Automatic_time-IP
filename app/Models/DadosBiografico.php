<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DadosBiografico extends Model
{
    use HasFactory;

    protected $table = 'dados_biograficos';

    protected $fillable = [
        'id_municipe',
        'nip',
        'assento_numero',
        'registro_civil',
        'registro_numero',
        'cedula_numero',
        'numero_filhos',
        'vencimento',
        'ramo_actividade',
        'ramo',
        'ano_incorporacao',
        'ano_abandono',
        'ano_servico',
        'modo_vida',
    ];

    protected $casts = [
        'vencimento' => 'decimal:2',
    ];

    public function municipe(): BelongsTo
    {
        return $this->belongsTo(Municipe::class, 'id_municipe');
    }
}
