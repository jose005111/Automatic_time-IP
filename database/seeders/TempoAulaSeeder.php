<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TempoAulaSeeder extends Seeder
{
    public function run(): void
    {
        $turnos = [
            0 => [ // Manhã
                'inicio' => '07:30',
                'tempos' => 6
            ],
            1 => [ // Tarde
                'inicio' => '13:00',
                'tempos' => 6
            ],
            2 => [ // Noite
                'inicio' => '18:30',
                'tempos' => 4
            ],
        ];

        foreach ($turnos as $turnoId => $config) {
            $horaAtual = \Carbon\Carbon::createFromFormat('H:i', $config['inicio']);

            for ($i = 1; $i <= $config['tempos']; $i++) {
                $inicio = $horaAtual->format('H:i:s');
                $fim = $horaAtual->addMinutes(45)->format('H:i:s');

                DB::table('tempos_aula')->insert([
                    'hora_inicio' => $inicio,
                    'hora_fim'    => $fim,
                    'turno'       => $turnoId,
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);

                // Intervalo de 5 min para a próxima aula
                $horaAtual->addMinutes(5);

                // Regra extra: Após o 3º tempo (Intervalo maior de 15 min em vez de 5)
                if ($i === 3) {
                    $horaAtual->addMinutes(10); // +10 para totalizar 15 min de recreio
                }
            }
        }
    }
}
