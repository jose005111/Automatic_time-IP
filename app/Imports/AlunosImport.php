<?php

namespace App\Imports;

use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Turma;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Validators\Failure;
use Throwable;

class AlunosImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError, SkipsOnFailure
{
    private $importados = 0;
    private $erros = [];
    private $falhas = [];

    /**
     * Processa cada linha do Excel
     */
    public function model(array $row)
    {
        // Buscar curso pelo nome
        $curso = Curso::where('nome', 'like', '%' . $row['curso'] . '%')->first();
        
        if (!$curso) {
            throw new \Exception("Curso não encontrado: " . $row['curso']);
        }
        
        // Buscar turma pelo nome e curso
        $turma = Turma::where('nome', 'like', '%' . $row['turma'] . '%')
            ->where('curso_id', $curso->id)
            ->first();
        
        if (!$turma) {
            throw new \Exception("Turma '{$row['turma']}' não encontrada para o curso '{$curso->nome}'");
        }
        
        // Verificar se matrícula já existe (se fornecida)
        if (!empty($row['matricula'])) {
            $existe = Aluno::where('matricula', $row['matricula'])->exists();
            if ($existe) {
                throw new \Exception("Matrícula '{$row['matricula']}' já existe no sistema");
            }
        }
        
        $this->importados++;
        
        return new Aluno([
            'nome' => $row['nome'],
            'matricula' => $row['matricula'] ?? null, // Se vazio, o boot gera
            'curso_id' => $curso->id,
            'turma_id' => $turma->id,
        ]);
    }

    /**
     * Validações das colunas
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'curso' => 'required|string',
            'turma' => 'required|string',
        ];
    }

    /**
     * Mensagens de validação personalizadas
     */
    public function customValidationMessages()
    {
        return [
            'nome.required' => 'O campo nome é obrigatório.',
            'curso.required' => 'O campo curso é obrigatório.',
            'turma.required' => 'O campo turma é obrigatório.',
        ];
    }

    /**
     * Lida com erros de validação
     */
    public function onFailure(Failure ...$failures)
    {
        foreach ($failures as $failure) {
            $this->falhas[] = [
                'linha' => $failure->row(),
                'erros' => implode(', ', $failure->errors()),
                'valores' => $failure->values()
            ];
        }
    }

    /**
     * Lida com erros gerais
     */
    public function onError(Throwable $e)
    {
        $this->erros[] = $e->getMessage();
    }

    public function getImportados()
    {
        return $this->importados;
    }

    public function getErros()
    {
        return array_merge($this->erros, array_map(function($falha) {
            return "Linha {$falha['linha']}: {$falha['erros']}";
        }, $this->falhas));
    }
}
