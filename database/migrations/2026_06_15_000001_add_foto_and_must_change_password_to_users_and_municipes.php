<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Adicionar foto ao munícipe
        Schema::table('municipes', function (Blueprint $table) {
            $table->string('foto', 255)->nullable()->after('celular');
        });

        // 2. Forçar troca de senha no 1º login + corrigir typo 'costum' → 'custom'
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_password')->default(false)->after('role');
        });

        // 3. Corrigir o typo no default da coluna role (afecta apenas novos registos)
        // e actualizar registos existentes com o valor errado
        DB::table('users')
            ->where('role', 'costum')
            ->update(['role' => 'custom']);
    }

    public function down(): void
    {
        Schema::table('municipes', function (Blueprint $table) {
            $table->dropColumn('foto');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('must_change_password');
        });
    }
};
