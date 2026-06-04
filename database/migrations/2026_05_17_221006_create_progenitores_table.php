<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progenitores', function (Blueprint $table) {
            $table->id();
            $table->string('nome_completo', 255);
            $table->date('data_nascimento')->nullable();
            $table->string('naturalidade', 150)->nullable();
            $table->string('profissao', 100)->nullable();
            $table->char('sexo', 1)->nullable(); // M or F
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progenitores');
    }
};
