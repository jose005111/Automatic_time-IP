<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProvinciaSeeder::class,
            MunicipioSeeder::class,
            ProgenitorSeeder::class,
            MunicipeSeeder::class,
            TransferenciaSeeder::class,
            UserSeeder::class,
        ]);

        $this->command->info('✅ Seeders executados com sucesso! Dados de Benguela carregados.');
    }
}
