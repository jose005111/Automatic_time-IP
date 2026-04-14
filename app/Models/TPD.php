<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class TPD extends Model
{
    protected $table = 'turmas_professores_disciplinas';
    
    protected $fillable = [
        'turma_id',
        'professor_id',
        'disciplina_id',
        'tempos_semanais'
    ];

    public function turma(): BelongsTo {
        return $this->belongsTo(Turma::class);
    }

    public function professor(): BelongsTo {
        return $this->belongsTo(Professor::class);
    }

    public function disciplina(): BelongsTo {
        return $this->belongsTo(Disciplina::class);
    }

    public function aulasAgendadas()
    {
        return $this->hasMany(AulaHorario::class, 'turmas_professores_disciplinas_id');
    }
}
