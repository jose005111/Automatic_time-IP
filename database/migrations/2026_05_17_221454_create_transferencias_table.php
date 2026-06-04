<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transferencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_recrutamento')->constrained('recrutamentos')->onDelete('cascade');
            $table->date('data_solicitacao');
            $table->foreignId('id_municipio_destino')->nullable()->constrained('municipios')->onDelete('set null');
            $table->string('local_destino', 255)->nullable();
            $table->tinyInteger('estado')->default(0); // 0=pendente, 1=aprovado, 2=rejeitado
            $table->date('data_aprovacao')->nullable();
            $table->foreignId('id_user_aprovou')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transferencias');
    }
};
