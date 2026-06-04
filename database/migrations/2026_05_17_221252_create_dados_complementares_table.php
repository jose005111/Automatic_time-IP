<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dados_complementares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_municipe')->unique()->constrained('municipes')->onDelete('cascade');
            $table->string('caixa_postal', 20)->nullable();
            $table->string('nif', 30)->nullable();
            $table->integer('encargo_familiar')->default(0);
            $table->string('habilitacao_literaria', 100)->nullable();
            $table->string('profissao', 100)->nullable();
            $table->integer('numero_irmaos')->default(0);
            $table->string('entidade_emissora_bi', 100)->nullable();
            $table->string('numero_carta_conducao', 50)->nullable();
            $table->date('data_emissao_carta')->nullable();
            $table->date('data_validade_carta')->nullable();
            $table->string('atributo', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dados_complementares');
    }
};
