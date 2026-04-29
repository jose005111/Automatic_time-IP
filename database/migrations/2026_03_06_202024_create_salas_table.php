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
        Schema::create('salas', function (Blueprint $table) {
            $table->id();
            $table->integer('bloco');
            $table->integer('capacidade');
            $table->integer('numero')->unique();
            $table->enum('tipo', ['teórica', 'laboratório']);
            $table->integer('estado')->default(1); // 1 para disponível, 0 para indisponível
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salas');
    }
};
