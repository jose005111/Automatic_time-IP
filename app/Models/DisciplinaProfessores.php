<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class DisciplinaProfessores extends Pivot
{
    // Define explicitamente o nome da tabela
    protected $table = 'disciplina_professores';

    // Se a sua tabela pivô não tiver as colunas created_at e updated_at, 
    // defina como false para evitar erros de SQL.
    public $timestamps = true;

    // Relacionamentos inversos (Opcional, mas útil)
    public function disciplina()
    {
        return $this->belongsTo(Disciplina::class);
    }

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }
}
