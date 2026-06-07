<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transferencia extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_recrutamento',
        'data_solicitacao',
        'id_municipio_destino',
        'local_destino',
        'estado',
        'data_aprovacao',
        'id_user_aprovou',
    ];

    protected $casts = [
        'data_solicitacao' => 'date',
        'data_aprovacao' => 'date',
    ];

    public function recrutamento(): BelongsTo
    {
        return $this->belongsTo(Recrutamento::class, 'id_recrutamento');
    }

    public function municipioDestino(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'id_municipio_destino');
    }

    public function userAprovou(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user_aprovou');
    }    
}
