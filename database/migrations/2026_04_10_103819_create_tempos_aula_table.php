<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tempos_aula', function (Blueprint $table) {
            $table->id();
            $table->time('hora_inicio'); // Ex: 08:00
            $table->time('hora_fim');    // Ex: 08:45
            $table->integer('turno');    // 1=Manhã, 2=Tarde, 3=Noite (Para facilitar filtros no gerador)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tempos_aula');
    }
};
