<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dados_biograficos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_municipe')->unique()->constrained('municipes')->onDelete('cascade');
            $table->string('nip', 50)->nullable();
            $table->string('assento_numero', 50)->nullable();
            $table->string('registro_civil', 50)->nullable();
            $table->string('registro_numero', 50)->nullable();
            $table->string('cedula_numero', 50)->nullable();
            $table->integer('numero_filhos')->default(0);
            $table->decimal('vencimento', 10, 2)->nullable();
            $table->string('ramo_actividade', 100)->nullable();
            $table->string('ramo', 100)->nullable();
            $table->year('ano_incorporacao')->nullable();
            $table->year('ano_abandono')->nullable();
            $table->integer('ano_servico')->nullable();
            $table->string('modo_vida', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dados_biograficos');
    }
};
