<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DisciplinaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $disciplinas = [
            // Tronco Comum / Geral
            ['nome' => 'Matemática Discreta'],
            ['nome' => 'Análise Matemática I'],
            ['nome' => 'Física Geral'],
            ['nome' => 'Metodologia de Investigação Científica'],
            
            // Ciências da Computação
            ['nome' => 'Algoritmos e Estruturas de Dados'],
            ['nome' => 'Engenharia de Software'],
            ['nome' => 'Bases de Dados'],
            ['nome' => 'Redes de Computadores'],
            ['nome' => 'Inteligência Artificial'],
            
            // Engenharia Logística e Transportes
            ['nome' => 'Gestão de Cadeia de Suprimentos'],
            ['nome' => 'Planeamento de Transportes'],
            ['nome' => 'Investigação Operacional'],
            ['nome' => 'Economia de Transportes'],
            
            // Engenharia Mecânica
            ['nome' => 'Termodinâmica'],
            ['nome' => 'Resistência de Materiais'],
            ['nome' => 'Mecânica dos Fluidos'],
            ['nome' => 'Desenho Técnico'],
            ['nome' => 'Processos de Fabrico'],
        ];

        foreach ($disciplinas as $d) {
            DB::table('disciplinas')->updateOrInsert(
                ['nome' => $d['nome']], // Evita duplicados pelo nome
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
