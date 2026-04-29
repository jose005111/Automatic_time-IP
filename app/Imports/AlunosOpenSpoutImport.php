<?php

namespace App\Imports;

use App\Models\Aluno;
use App\Models\Curso;
use App\Models\Turma;
use OpenSpout\Reader\XLSX\Reader;
use OpenSpout\Reader\CSV\Reader as CSVReader;
use Illuminate\Support\Facades\Log;

class AlunosOpenSpoutImport
{
    private $importados = 0;
    private $erros = [];

    public function import($file)
    {
        $extension = $file->getClientOriginalExtension();
        
        if ($extension === 'csv') {
            $reader = new CSVReader();
        } else {
            $reader = new Reader();
        }
        
        $reader->open($file->getPathname());
        
        foreach ($reader->getSheetIterator() as $sheet) {
            $linha = 1;
            foreach ($sheet->getRowIterator() as $row) {
                $linha++;
                
                // Pular cabeçalho
                if ($linha === 2) continue;
                
                $cells = $row->getCells();
                $nome = isset($cells[0]) ? $cells[0]->getValue() : null;
                $cursoNome = isset($cells[1]) ? $cells[1]->getValue() : null;
                $turmaNome = isset($cells[2]) ? $cells[2]->getValue() : null;
                $matricula = isset($cells[3]) ? $cells[3]->getValue() : null;
                
                try {
                    // Validações
                    if (empty($nome)) {
                        $this->erros[] = "Linha {$linha}: Nome é obrigatório";
                        continue;
                    }
                    
                    if (empty($cursoNome)) {
                        $this->erros[] = "Linha {$linha}: Curso é obrigatório";
                        continue;
                    }
                    
                    if (empty($turmaNome)) {
                        $this->erros[] = "Linha {$linha}: Turma é obrigatória";
                        continue;
                    }
                    
                    // Buscar curso
                    $curso = Curso::where('nome', 'like', "%{$cursoNome}%")->first();
                    if (!$curso) {
                        $this->erros[] = "Linha {$linha}: Curso '{$cursoNome}' não encontrado";
                        continue;
                    }
                    
                    // Buscar turma
                    $turma = Turma::where('nome', 'like', "%{$turmaNome}%")
                        ->where('curso_id', $curso->id)
                        ->first();
                    
                    if (!$turma) {
                        $this->erros[] = "Linha {$linha}: Turma '{$turmaNome}' não encontrada para o curso '{$curso->nome}'";
                        continue;
                    }
                    
                    // Verificar matrícula duplicada
                    if ($matricula) {
                        $existe = Aluno::where('matricula', $matricula)->exists();
                        if ($existe) {
                            $this->erros[] = "Linha {$linha}: Matrícula '{$matricula}' já existe";
                            continue;
                        }
                    }
                    
                    // Criar aluno
                    Aluno::create([
                        'nome' => $nome,
                        'matricula' => $matricula ?: null,
                        'curso_id' => $curso->id,
                        'turma_id' => $turma->id,
                    ]);
                    
                    $this->importados++;
                    
                } catch (\Exception $e) {
                    $this->erros[] = "Linha {$linha}: " . $e->getMessage();
                    Log::error("Erro importação: " . $e->getMessage());
                }
            }
            break; // Só processar primeira planilha
        }
        
        $reader->close();
    }
    
    public function getImportados()
    {
        return $this->importados;
    }
    
    public function getErros()
    {
        return $this->erros;
    }
}
