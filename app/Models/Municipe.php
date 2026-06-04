<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_user',
        'nome_completo',
        'data_nascimento',
        'sexo',
        'estado_civil',
        'naturalidade',
        'id_municipio_naturalidade',
        'bi_numero',
        'bi_data_emissao',
        'bi_data_validade',
        'telefone',
        'celular',
        'id_pai',
        'id_mae',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'bi_data_emissao' => 'date',
        'bi_data_validade' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function municipioNaturalidade(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'id_municipio_naturalidade');
    }

    public function pai(): BelongsTo
    {
        return $this->belongsTo(Progenitor::class, 'id_pai');
    }

    public function mae(): BelongsTo
    {
        return $this->belongsTo(Progenitor::class, 'id_mae');
    }

    public function dadosBiograficos(): HasOne
    {
        return $this->hasOne(DadosBiografico::class, 'id_municipe');
    }

    public function dadosComplementares(): HasOne
    {
        return $this->hasOne(DadosComplementar::class, 'id_municipe');
    }

    public function endereco(): HasOne
    {
        return $this->hasOne(Endereco::class, 'id_municipe');
    }

    public function recrutamentos(): HasMany
    {
        return $this->hasMany(Recrutamento::class, 'id_municipe');
    }
}
