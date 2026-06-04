<?php

namespace Database\Seeders;

use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Database\Seeder;

class MunicipioSeeder extends Seeder
{
    public function run(): void
    {
        $benguela = Provincia::where('nome', 'Benguela')->first();

        if (!$benguela) {
            $this->command->error('Província de Benguela não encontrada!');
            return;
        }

        $municipiosBenguela = [
            'Benguela',
            'Lobito',
            'Catumbela',
            'Baía Farta',
            'Cubal',
            'Ganda',
            'Caimbambo',
            'Chongorói',
            'Balombo',
            'Bocoio',
        ];

        foreach ($municipiosBenguela as $nome) {
            Municipio::firstOrCreate([
                'nome' => $nome,
                'id_provincia' => $benguela->id,
            ]);
        }

        // Add a few municipalities in other provinces for realism
        $luanda = Provincia::where('nome', 'Luanda')->first();
        if ($luanda) {
            Municipio::firstOrCreate(['nome' => 'Luanda', 'id_provincia' => $luanda->id]);
            Municipio::firstOrCreate(['nome' => 'Belas', 'id_provincia' => $luanda->id]);
            Municipio::firstOrCreate(['nome' => 'Cacuaco', 'id_provincia' => $luanda->id]);
        }

        $this->command->info('Municípios de Benguela e outros criados com sucesso!');
    }
}
