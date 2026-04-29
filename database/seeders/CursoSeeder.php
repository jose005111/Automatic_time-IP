<?php

namespace Database\Seeders;

use App\Models\Departamento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CursoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Garantir que existe um departamento para associar
        $depto = Departamento::first() ?? Departamento::create([
            'nome' => 'Departamento de Engenharia e Tecnologias', 
            'sigla' => 'DET'
        ]);

        $cursos = [
            [
                'nome' => 'Ciências da Computação',
                'descricao' => 'Focado no desenvolvimento de software, algoritmos e inteligência artificial.',
                'data_inicio' => Carbon::parse('2026-01-01'),
                'data_fim' => Carbon::parse('2030-12-31'),
                'departamento_id' => $depto->id
            ],
            [
                'nome' => 'Engenharia Logística e Transportes',
                'descricao' => 'Especializado na gestão de cadeias de suprimentos e infraestruturas de transporte.',
                'data_inicio' => Carbon::parse('2026-01-01'),
                'data_fim' => Carbon::parse('2031-12-31'),
                'departamento_id' => $depto->id
            ],
            [
                'nome' => 'Engenharia Mecânica',
                'descricao' => 'Focado no projeto, análise e manutenção de sistemas mecânicos e industriais.',
                'data_inicio' => Carbon::parse('2026-01-01'),
                'data_fim' => Carbon::parse('2031-12-31'),
                'departamento_id' => $depto->id
            ],
        ];

        foreach ($cursos as $curso) {
            DB::table('cursos')->updateOrInsert(
                ['nome' => $curso['nome']], // Critério de busca para não duplicar
                [
                    'descricao'       => $curso['descricao'],
                    'data_inicio'     => $curso['data_inicio'],
                    'data_fim'        => $curso['data_fim'],
                    'departamento_id' => $curso['departamento_id'],
                    'created_at'      => now(), 
                    'updated_at'      => now()
                ]
            );
        }
    }
}
