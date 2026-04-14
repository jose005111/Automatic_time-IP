<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('turmas_professores_disciplinas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('turma_id')->constrained()->onDelete('cascade');
            $table->foreignId('professor_id')->constrained('professores')->onDelete('cascade');
            $table->foreignId('disciplina_id')->constrained()->onDelete('cascade');
            $table->integer('tempos_semanais')->unsigned();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turmas_professores_disciplinas');
    }
};
