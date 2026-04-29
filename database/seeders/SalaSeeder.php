<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $salas = [
            // Bloco 1 (Ex: Edifício Principal) - Salas Teóricas
            ['bloco' => 1, 'numero' => 1, 'tipo' => 'teórica', 'capacidade' => 45, 'estado' => 1],
            ['bloco' => 1, 'numero' => 2, 'tipo' => 'teórica', 'capacidade' => 45, 'estado' => 1],
            ['bloco' => 1, 'numero' => 3, 'tipo' => 'teórica', 'capacidade' => 45, 'estado' => 1],
            ['bloco' => 1, 'numero' => 4, 'tipo' => 'teórica', 'capacidade' => 45, 'estado' => 1],
            ['bloco' => 1, 'numero' => 5, 'tipo' => 'teórica', 'capacidade' => 45, 'estado' => 0],

            // Bloco 2 (Ex: Pavilhão Tecnológico) - Laboratórios
            ['bloco' => 2, 'numero' => 101, 'tipo' => 'laboratório', 'capacidade' => 30, 'estado' => 1],
            ['bloco' => 2, 'numero' => 102, 'tipo' => 'laboratório', 'capacidade' => 30, 'estado' => 1],
            ['bloco' => 2, 'numero' => 103, 'tipo' => 'laboratório', 'capacidade' => 25, 'estado' => 1],
            ['bloco' => 2, 'numero' => 104, 'tipo' => 'laboratório', 'capacidade' => 20, 'estado' => 1],

            // Bloco 3 - Mais Laboratórios
            ['bloco' => 3, 'numero' => 201, 'tipo' => 'laboratório', 'capacidade' => 25, 'estado' => 1],
        ];

        foreach ($salas as $sala) {
            DB::table('salas')->updateOrInsert(
                ['numero' => $sala['numero']], // Critério único
                [
                    'bloco'      => $sala['bloco'],
                    'tipo'       => $sala['tipo'],
                    'capacidade' => $sala['capacidade'],
                    'estado'     => $sala['estado'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
