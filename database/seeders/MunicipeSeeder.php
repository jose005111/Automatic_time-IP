<?php

namespace Database\Seeders;

use App\Models\DadosBiografico;
use App\Models\DadosComplementar;
use App\Models\Endereco;
use App\Models\Municipe;
use App\Models\Municipio;
use App\Models\Progenitor;
use App\Models\Provincia;
use App\Models\Recrutamento;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MunicipeSeeder extends Seeder
{
    public function run(): void
    {
        $dataNascimento1 = Carbon::today()->subYears(18)->subMonths(7)->format('Y-m-d');
        $dataNascimento2 = Carbon::today()->subYears(18)->subMonths(3)->format('Y-m-d');
        $dataNascimento3 = Carbon::today()->subYears(18)->subDays(10)->format('Y-m-d');

        $biEmissao1 = Carbon::parse($dataNascimento1)->addYears(18)->format('Y-m-d');
        $biValidade1 = Carbon::parse($dataNascimento1)->addYears(28)->format('Y-m-d');
        $biEmissao2 = Carbon::parse($dataNascimento2)->addYears(18)->format('Y-m-d');
        $biValidade2 = Carbon::parse($dataNascimento2)->addYears(28)->format('Y-m-d');

        $benguelaProv = Provincia::where('nome', 'Benguela')->first();
        $benguelaMun = Municipio::where('nome', 'Benguela')->where('id_provincia', $benguelaProv->id)->first();
        $lobitoMun = Municipio::where('nome', 'Lobito')->first();
        $catumbelaMun = Municipio::where('nome', 'Catumbela')->first();

        $pai1 = Progenitor::where('nome_completo', 'João Manuel da Silva')->first();
        $mae1 = Progenitor::where('nome_completo', 'Maria Fernanda Costa')->first();
        $pai2 = Progenitor::where('nome_completo', 'António Pedro Lopes')->first();
        $mae2 = Progenitor::where('nome_completo', 'Isabel Cristina Mendes')->first();

        // Munícipe 1 - Exemplo completo
        $municipe1 = Municipe::firstOrCreate(
            ['bi_numero' => '123456789LA042'],
            [
                'nome_completo' => 'Carlos Eduardo Silva Costa',
                'data_nascimento' => $dataNascimento1,
                'sexo' => 'M',
                'estado_civil' => 'Solteiro',
                'naturalidade' => 'Benguela',
                'id_municipio_naturalidade' => $benguelaMun->id,
                'bi_numero' => '123456789LA042',
                'bi_data_emissao' => $biEmissao1,
                'bi_data_validade' => $biValidade1,
                'telefone' => '222-456-789',
                'celular' => '923-456-789',
                'id_pai' => $pai1->id,
                'id_mae' => $mae1->id,
            ]
        );

        // Dados Biográficos
        DadosBiografico::firstOrCreate(
            ['id_municipe' => $municipe1->id],
            [
                'nip' => 'NIP-2025-001234',
                'assento_numero' => 'AS-45678',
                'registro_civil' => 'Registo Civil de Benguela',
                'numero_filhos' => 0,
                'vencimento' => 85000.00,
                'ramo_actividade' => 'Estudante',
                'modo_vida' => 'Urbano',
            ]
        );

        // Dados Complementares
        DadosComplementar::firstOrCreate(
            ['id_municipe' => $municipe1->id],
            [
                'nif' => '123456789',
                'profissao' => 'Estudante Universitário',
                'habilitacao_literaria' => '12ª Classe',
                'encargo_familiar' => 2,
                'numero_irmaos' => 3,
            ]
        );

        // Endereço
        Endereco::firstOrCreate(
            ['id_municipe' => $municipe1->id],
            [
                'comuna' => 'Comuna de Benguela',
                'id_provincia' => $benguelaProv->id,
                'id_municipio' => $benguelaMun->id,
                'localidade' => 'Bairro da Restinga',
                'morada' => 'Rua Principal, Casa nº 45',
            ]
        );

        // Recrutamento
        Recrutamento::firstOrCreate(
            ['id_municipe' => $municipe1->id, 'data_recruta' => '2023-08-20'],
            [
                'data_recruta' => '2023-08-20',
                'observacoes' => 'Apto para serviço militar',
                'estado' => 1, // Aprovado
            ]
        );

        // Munícipe 2 - Feminino
        $municipe2 = Municipe::firstOrCreate(
            ['bi_numero' => '987654321LA056'],
            [
                'nome_completo' => 'Ana Beatriz Mendes Lopes',
                'data_nascimento' => $dataNascimento2,
                'sexo' => 'F',
                'estado_civil' => 'Solteira',
                'naturalidade' => 'Lobito',
                'id_municipio_naturalidade' => $lobitoMun->id,
                'bi_numero' => '987654321LA056',
                'bi_data_emissao' => $biEmissao2,
                'bi_data_validade' => $biValidade2,
                'celular' => '924-567-890',
                'id_pai' => $pai2->id,
                'id_mae' => $mae2->id,
            ]
        );

        DadosBiografico::firstOrCreate(
            ['id_municipe' => $municipe2->id],
            [
                'nip' => 'NIP-2025-005678',
                'numero_filhos' => 0,
                'ramo_actividade' => 'Estudante',
                'modo_vida' => 'Urbano',
            ]
        );

        Endereco::firstOrCreate(
            ['id_municipe' => $municipe2->id],
            [
                'comuna' => 'Comuna do Lobito',
                'id_provincia' => $benguelaProv->id,
                'id_municipio' => $lobitoMun->id,
                'localidade' => 'Bairro da Praia',
                'morada' => 'Avenida 4 de Fevereiro, nº 120',
            ]
        );

        // Munícipe 3 - Com transferência
        $municipe3 = Municipe::firstOrCreate(
            ['bi_numero' => '456789123LA078'],
            [
                'nome_completo' => 'Pedro António Neto',
                'data_nascimento' => $dataNascimento3,
                'sexo' => 'M',
                'estado_civil' => 'Solteiro',
                'naturalidade' => 'Catumbela',
                'id_municipio_naturalidade' => $catumbelaMun->id,
                'bi_numero' => '456789123LA078',
                'celular' => '925-678-901',
                'id_pai' => $pai1->id,
                'id_mae' => $mae2->id,
            ]
        );

        Recrutamento::firstOrCreate(
            ['id_municipe' => $municipe3->id, 'data_recruta' => '2022-07-15'],
            [
                'data_recruta' => '2022-07-15',
                'observacoes' => 'Transferido para serviço em Luanda',
                'estado' => 2, // Rejeitado (exemplo)
            ]
        );

        $this->command->info('Munícipes de exemplo criados com sucesso para Benguela!');
    }
}
