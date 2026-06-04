<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DadosComplementar extends Model
{
    use HasFactory;

    protected $table = 'dados_complementares';

    protected $fillable = [
        'id_municipe',
        'caixa_postal',
        'nif',
        'encargo_familiar',
        'habilitacao_literaria',
        'profissao',
        'numero_irmaos',
        'entidade_emissora_bi',
        'numero_carta_conducao',
        'data_emissao_carta',
        'data_validade_carta',
        'atributo',
    ];

    protected $casts = [
        'data_emissao_carta' => 'date',
        'data_validade_carta' => 'date',
    ];

    public function municipe(): BelongsTo
    {
        return $this->belongsTo(Municipe::class, 'id_municipe');
    }
}
