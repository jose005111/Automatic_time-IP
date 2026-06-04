<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enderecos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_municipe')->unique()->constrained('municipes')->onDelete('cascade');
            $table->string('comuna', 150)->nullable();
            $table->foreignId('id_provincia')->nullable()->constrained('provincias')->onDelete('set null');
            $table->foreignId('id_municipio')->nullable()->constrained('municipios')->onDelete('set null');
            $table->string('localidade', 150)->nullable();
            $table->string('morada', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enderecos');
    }
};
