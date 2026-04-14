<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aulas_horario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turma_id')->constrained('turmas')->cascadeOnDelete();
            $table->foreignId('disciplina_id')->constrained('disciplinas')->cascadeOnDelete();
            $table->foreignId('professor_id')->constrained('professores')->cascadeOnDelete();            
            $table->tinyInteger('dia_semana'); 
            $table->foreignId('tempo_aula_id')->constrained('tempos_aula')->cascadeOnDelete();
            
            $table->timestamps();

            // REGRAS DE OURO CONTRA CONFLITOS (Impedem inserts duplicados no mesmo tempo)
            
            // 1. O mesmo professor não pode estar em dois lugares ao mesmo tempo
            $table->unique(['professor_id', 'dia_semana', 'tempo_aula_id'], 'horario_prof_unique');
            
            // 2. A mesma turma não pode ter duas aulas diferentes ao mesmo tempo
            $table->unique(['turma_id', 'dia_semana', 'tempo_aula_id'], 'horario_turma_unique');
    
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aulas_horario');
    }
};
