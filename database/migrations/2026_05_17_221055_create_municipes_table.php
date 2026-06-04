<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('municipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_user')->nullable()->constrained('users')->onDelete('set null'); // quem registrou
            $table->string('nome_completo', 255);
            $table->date('data_nascimento');
            $table->char('sexo', 1); // M/F
            $table->string('estado_civil', 50)->nullable();
            $table->string('naturalidade', 150)->nullable();
            $table->foreignId('id_municipio_naturalidade')->nullable()->constrained('municipios')->onDelete('set null');
            $table->string('bi_numero', 50)->unique()->nullable();
            $table->date('bi_data_emissao')->nullable();
            $table->date('bi_data_validade')->nullable();
            $table->string('telefone', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->foreignId('id_pai')->nullable()->constrained('progenitores')->onDelete('set null');
            $table->foreignId('id_mae')->nullable()->constrained('progenitores')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipes');
    }
};
