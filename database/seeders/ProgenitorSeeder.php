<?php

namespace Database\Seeders;

use App\Models\Progenitor;
use Illuminate\Database\Seeder;

class ProgenitorSeeder extends Seeder
{
    public function run(): void
    {
        $progenitores = [
            [
                'nome_completo' => 'João Manuel da Silva',
                'data_nascimento' => '1975-03-15',
                'naturalidade' => 'Benguela',
                'profissao' => 'Professor',
                'sexo' => 'M',
            ],
            [
                'nome_completo' => 'Maria Fernanda Costa',
                'data_nascimento' => '1978-07-22',
                'naturalidade' => 'Lobito',
                'profissao' => 'Enfermeira',
                'sexo' => 'F',
            ],
            [
                'nome_completo' => 'António Pedro Lopes',
                'data_nascimento' => '1968-11-05',
                'naturalidade' => 'Catumbela',
                'profissao' => 'Agricultor',
                'sexo' => 'M',
            ],
            [
                'nome_completo' => 'Isabel Cristina Mendes',
                'data_nascimento' => '1980-02-18',
                'naturalidade' => 'Benguela',
                'profissao' => 'Comerciante',
                'sexo' => 'F',
            ],
            [
                'nome_completo' => 'Francisco José Neto',
                'data_nascimento' => '1970-09-30',
                'naturalidade' => 'Baía Farta',
                'profissao' => 'Pescador',
                'sexo' => 'M',
            ],
        ];

        foreach ($progenitores as $data) {
            Progenitor::firstOrCreate(
                ['nome_completo' => $data['nome_completo']],
                $data
            );
        }

        $this->command->info('Progenitores (pais) criados com sucesso!');
    }
}
