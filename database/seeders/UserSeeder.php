<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Administrador',
                'password' => bcrypt('12345678'),
                'role' => 'admin',
            ]
        );

        $this->command->info('Usuário criado com sucesso!');
    }
}
