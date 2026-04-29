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
        Schema::create('turmas', function (Blueprint $table) {
            $table->id();
            $table->string('nome')->default('Unica');
            $table->integer('regime');
            $table->integer('turno');
            $table->foreignId('periodos_lectivo_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('sala_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignId('curso_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turmas');
    }
};
