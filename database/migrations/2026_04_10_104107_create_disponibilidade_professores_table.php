<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disponibilidade_professores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professor_id')->constrained('professores')->cascadeOnDelete();
            $table->tinyInteger('dia_semana')->comment('1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado');
            $table->foreignId('tempo_aula_id')->constrained('tempos_aula')->cascadeOnDelete();
            $table->timestamps();

            // REGRA: Um professor não pode registar a mesma disponibilidade duas vezes
            $table->unique(['professor_id', 'dia_semana', 'tempo_aula_id'], 'disp_prof_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilidade_professores');
    }
};
