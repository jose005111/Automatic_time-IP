<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = 
            [
                'name' => 'Administrador',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('12345678'),
                'role' => 'admin',
            ];

            User::firstOrCreate($user);

        $this->command->info('Usuário criado com sucesso!');
    }
}
