<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Recrutamento extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_municipe',
        'data_recruta',
        'observacoes',
        'estado',
    ];

    protected $casts = [
        'data_recruta' => 'date',
    ];

    public function municipe(): BelongsTo
    {
        return $this->belongsTo(Municipe::class, 'id_municipe');
    }

    public function transferencia(): HasOne
    {
        return $this->hasOne(Transferencia::class, 'id_recrutamento');
    }
}
