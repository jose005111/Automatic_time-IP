<?php

namespace Database\Seeders;

use App\Models\Municipio;
use App\Models\Recrutamento;
use App\Models\Transferencia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransferenciaSeeder extends Seeder
{
    public function run(): void
    {
        $recrutamento = Recrutamento::first();
        $admin = User::where('email', 'admin@gmail.com')->first();
        $luanda = Municipio::where('nome', 'Luanda')->first();

        if (! $recrutamento || ! $admin || ! $luanda) {
            $this->command->error('Não foi possível criar a transferência de exemplo.');

            return;
        }

        Transferencia::firstOrCreate(
            ['id_recrutamento' => $recrutamento->id],
            [
                'data_solicitacao' => Carbon::parse($recrutamento->data_recruta)->addDays(30)->format('Y-m-d'),
                'id_municipio_destino' => $luanda->id,
                'local_destino' => 'Luanda',
                'estado' => 1,
                'data_aprovacao' => Carbon::parse($recrutamento->data_recruta)->addDays(35)->format('Y-m-d'),
                'id_user_aprovou' => $admin->id,
            ]
        );

        $this->command->info('Transferência de exemplo criada com sucesso!');
    }
}
