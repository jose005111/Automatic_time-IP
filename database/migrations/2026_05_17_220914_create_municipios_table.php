<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('municipios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 150);
            $table->foreignId('id_provincia')->constrained('provincias')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['nome', 'id_provincia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipios');
    }
};
