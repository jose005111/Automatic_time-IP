<?php

namespace Database\Seeders;

use App\Models\Municipe;
use App\Models\Provincia;
use App\Models\Municipio;
use App\Models\Progenitor;
use App\Models\DadosBiografico;
use App\Models\DadosComplementar;
use App\Models\Endereco;
use App\Models\Recrutamento;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MunicipeSeeder extends Seeder
{
    public function run(): void
    {
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
                'data_nascimento' => '2005-04-12',
                'sexo' => 'M',
                'estado_civil' => 'Solteiro',
                'naturalidade' => 'Benguela',
                'id_municipio_naturalidade' => $benguelaMun->id,
                'bi_numero' => '123456789LA042',
                'bi_data_emissao' => '2022-06-15',
                'bi_data_validade' => '2032-06-15',
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
                'data_nascimento' => '2006-11-03',
                'sexo' => 'F',
                'estado_civil' => 'Solteira',
                'naturalidade' => 'Lobito',
                'id_municipio_naturalidade' => $lobitoMun->id,
                'bi_numero' => '987654321LA056',
                'bi_data_emissao' => '2023-02-10',
                'bi_data_validade' => '2033-02-10',
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
                'data_nascimento' => '2004-05-28',
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
