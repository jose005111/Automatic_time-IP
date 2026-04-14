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
            // Salas de Aula Normais
            ['designacao' => 'Sala de Aula', 'numero' => 1, 'capacidade' => 45, 'estado' => 1],
            ['designacao' => 'Sala de Aula', 'numero' => 2, 'capacidade' => 45, 'estado' => 1],
            ['designacao' => 'Sala de Aula', 'numero' => 3, 'capacidade' => 45, 'estado' => 1],
            ['designacao' => 'Sala de Aula', 'numero' => 4, 'capacidade' => 45, 'estado' => 1],
            ['designacao' => 'Sala de Aula', 'numero' => 5, 'capacidade' => 45, 'estado' => 0], // Manutenção

            // Laboratórios (Informática e Engenharia)
            ['designacao' => 'Laboratório de Informática 1', 'numero' => 101, 'capacidade' => 30, 'estado' => 1],
            ['designacao' => 'Laboratório de Informática 2', 'numero' => 102, 'capacidade' => 30, 'estado' => 1],
            ['designacao' => 'Laboratório de Física', 'numero' => 103, 'capacidade' => 25, 'estado' => 1],
            ['designacao' => 'Laboratório de Mecânica', 'numero' => 104, 'capacidade' => 20, 'estado' => 1],

            // Anfiteatros para turmas maiores ou eventos
            ['designacao' => 'Anfiteatro A', 'numero' => 201, 'capacidade' => 120, 'estado' => 1],
            ['designacao' => 'Anfiteatro B', 'numero' => 202, 'capacidade' => 100, 'estado' => 1],
        ];

        foreach ($salas as $sala) {
            DB::table('salas')->updateOrInsert(
                ['numero' => $sala['numero']], // Critério único
                [
                    'designacao' => $sala['designacao'],
                    'capacidade' => $sala['capacidade'],
                    'estado'     => $sala['estado'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
