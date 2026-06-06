<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Recrutamento extends Model
{
    protected $table = 'recrutamentos';
 
    protected $fillable = ['id_municipe', 'data_recruta', 'observacoes', 'estado'];
 
    protected $casts = [
        'data_recruta' => 'date',
        'estado'       => 'integer',
    ];
 
    public function municipe(): BelongsTo
    {
        return $this->belongsTo(Municipe::class, 'id_municipe');
    }
 
    public function transferencias()
    {
        return $this->hasMany(Transferencia::class, 'id_recrutamento');
    }
}
 
