<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipio extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'id_provincia',
    ];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class, 'id_provincia');
    }

    public function municipesNaturalidade(): HasMany
    {
        return $this->hasMany(Municipe::class, 'id_municipio_naturalidade');
    }

    public function enderecos(): HasMany
    {
        return $this->hasMany(Endereco::class, 'id_municipio');
    }
}
