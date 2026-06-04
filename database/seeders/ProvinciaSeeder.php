<?php

namespace Database\Seeders;

use App\Models\Provincia;
use Illuminate\Database\Seeder;

class ProvinciaSeeder extends Seeder
{
    public function run(): void
    {
        $provincias = [
            'Benguela',
            'Luanda',
            'Huambo',
            'Malanje',
            'Huíla',
            'Cuanza Norte',
            'Cuanza Sul',
            'Bié',
            'Cuando Cubango',
            'Cunene',
            'Lunda Norte',
            'Lunda Sul',
            'Moxico',
            'Namibe',
            'Uíge',
            'Zaire',
            'Bengo',
        ];

        foreach ($provincias as $nome) {
            Provincia::firstOrCreate(['nome' => $nome]);
        }

        $this->command->info('Províncias criadas com sucesso!');
    }
}
