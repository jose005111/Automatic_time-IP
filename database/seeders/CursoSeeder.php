<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CursoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cursos = [
            ['nome' => 'Ciências da Computação'],
            ['nome' => 'Engenharia Logística e Transportes'],
            ['nome' => 'Engenharia Mecânica'],
        ];

        foreach ($cursos as $curso) {
            DB::table('cursos')->updateOrInsert(
                ['nome' => $curso['nome']], // Critério de busca
                ['created_at' => now(), 'updated_at' => now()] // Dados a inserir/atualizar
            );
        }
    }
}
