<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recrutamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_municipe')->constrained('municipes')->onDelete('cascade');
            $table->date('data_recruta');
            $table->text('observacoes')->nullable();
            $table->tinyInteger('estado')->default(0); // 0=pendente, 1=aprovado, 2=rejeitado, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recrutamentos');
    }
}; 
