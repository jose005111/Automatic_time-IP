<?php

namespace App\Http\Controllers;

use App\Imports\AlunosImport;
use App\Models\Aluno;
use App\Models\AulaHorario;
use App\Models\Curso;
use App\Models\Professor;
use App\Models\Turma;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Imports\AlunosOpenSpoutImport;
use OpenSpout\Reader\XLSX\Reader;

class PortalHorarioController extends Controller
{
    // Admin - Listagem de Alunos
    public function indexAdmin(Request $request)
    {
        $query = Aluno::with(['curso', 'turma', 'turma.curso'])->latest();

        // Lógica de pesquisa
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nome', 'like', "%{$search}%")
                  ->orWhere('matricula', 'like', "%{$search}%");
            });
        }

        // Paginação
        $alunos = $query->paginate(10)->withQueryString();
        
        $cursos = Curso::all();
        $turmas = Turma::with('curso')->get();

        return Inertia::render('Alunos/Index', [
            'alunos' => $alunos,
            'cursos' => $cursos,
            'turmas' => $turmas,
            'search' => $request->search ?? '',
            'flash' => session('flash'),
        ]);
    }
    
    // Admin - Adicionar Aluno Individual
    public function storeAluno(Request $request)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'curso_id' => 'required|exists:cursos,id',
            'turma_id' => 'required|exists:turmas,id',
        ]);

        // Verificar se a turma pertence ao curso selecionado
        $turma = Turma::where('id', $request->turma_id)
            ->where('curso_id', $request->curso_id)
            ->first();

        if (!$turma) {
            return back()->withErrors(['turma_id' => 'A turma selecionada não pertence ao curso escolhido.']);
        }

        $aluno = Aluno::create([
            'nome' => $request->nome,
            'curso_id' => $request->curso_id,
            'turma_id' => $request->turma_id,
        ]);

        return back()->with('success', 'Aluno adicionado com sucesso! Matrícula: ' . $aluno->matricula);
    }
    
    // Admin - Importar Alunos via Excel/CSV
    public function importarAlunos(Request $request)
    {
        $request->validate([
            'arquivo' => 'required|file|mimes:xlsx,xls,csv|max:10240'
        ]);

        $file = $request->file('arquivo');
        $extension = $file->getClientOriginalExtension();
        
        $importados = 0;
        $erros = [];
        
        if ($extension === 'csv') {
            // Processar CSV
            $handle = fopen($file->getPathname(), 'r');
            $firstLine = fgets($handle);
            rewind($handle);
            $delimiter = strpos($firstLine, ';') !== false ? ';' : ',';
            
            // Pular cabeçalho
            fgetcsv($handle, 0, $delimiter);
            
            $linha = 2;
            while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
                $nome = trim($data[0] ?? '');
                $cursoNome = trim($data[1] ?? '');
                $turmaNome = trim($data[2] ?? '');
                $matricula = trim($data[3] ?? '');
                
                $result = $this->processarAluno($nome, $cursoNome, $turmaNome, $matricula, $linha);
                if ($result === true) {
                    $importados++;
                } else {
                    $erros[] = $result;
                }
                $linha++;
            }
            fclose($handle);
            
        } elseif ($extension === 'xlsx' || $extension === 'xls') {
            // Processar Excel com OpenSpout versão 5.x
            try {
                $reader = new \OpenSpout\Reader\XLSX\Reader();
                $reader->open($file->getPathname());
                
                foreach ($reader->getSheetIterator() as $sheet) {
                    $linha = 0;
                    foreach ($sheet->getRowIterator() as $row) {
                        $linha++;
                        
                        // Pular cabeçalho
                        if ($linha === 1) {
                            continue;
                        }
                        
                        // Na versão 5.x, os valores são acessados diretamente pelo índice
                        $values = $row->toArray();
                        $nome = isset($values[0]) ? (string) $values[0] : '';
                        $cursoNome = isset($values[1]) ? (string) $values[1] : '';
                        $turmaNome = isset($values[2]) ? (string) $values[2] : '';
                        $matricula = isset($values[3]) ? (string) $values[3] : '';
                        
                        $result = $this->processarAluno($nome, $cursoNome, $turmaNome, $matricula, $linha);
                        if ($result === true) {
                            $importados++;
                        } else {
                            $erros[] = $result;
                        }
                    }
                    break;
                }
                
                $reader->close();
                
            } catch (\Exception $e) {
                return back()->with('error', 'Erro ao ler arquivo Excel: ' . $e->getMessage());
            }
        }
        
        $mensagem = "Importação concluída! {$importados} alunos importados com sucesso.";
        
        if (count($erros) > 0) {
            $mensagem .= " " . count($erros) . " erro(s) encontrado(s).";
            session()->flash('import_errors', $erros);
            return back()->with('warning', $mensagem);
        }
        
        return back()->with('success', $mensagem);
    }
    
    /**
     * Processa um único aluno para importação
     * 
     * @param string $nome
     * @param string $cursoNome
     * @param string $turmaNome
     * @param string $matricula
     * @param int $linha
     * @return true|string Retorna true se sucesso, ou mensagem de erro
     */
    private function processarAluno($nome, $cursoNome, $turmaNome, $matricula, $linha)
    {
        try {
            if (empty($nome)) {
                return "Linha {$linha}: Nome é obrigatório";
            }
            
            if (empty($cursoNome)) {
                return "Linha {$linha}: Curso é obrigatório";
            }
            
            if (empty($turmaNome)) {
                return "Linha {$linha}: Turma é obrigatória";
            }
            
            // Buscar curso pelo nome
            $curso = Curso::where('nome', 'like', "%{$cursoNome}%")->first();
            if (!$curso) {
                return "Linha {$linha}: Curso '{$cursoNome}' não encontrado";
            }
            
            // Buscar turma pelo nome e curso
            $turma = Turma::where('nome', 'like', "%{$turmaNome}%")
                ->where('curso_id', $curso->id)
                ->first();
            
            if (!$turma) {
                return "Linha {$linha}: Turma '{$turmaNome}' não encontrada para o curso '{$curso->nome}'";
            }
            
            // Verificar matrícula duplicada
            if (!empty($matricula)) {
                $existe = Aluno::where('matricula', $matricula)->exists();
                if ($existe) {
                    return "Linha {$linha}: Matrícula '{$matricula}' já existe";
                }
            }
            
            // Criar aluno
            Aluno::create([
                'nome' => $nome,
                'matricula' => $matricula ?: null,
                'curso_id' => $curso->id,
                'turma_id' => $turma->id,
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            return "Linha {$linha}: " . $e->getMessage();
        }
    }
    
    // Admin - Atualizar Aluno
    public function updateAluno(Request $request, Aluno $aluno)
    {
        $request->validate([
            'nome' => 'required|string|max:255',
            'curso_id' => 'required|exists:cursos,id',
            'turma_id' => 'required|exists:turmas,id',
        ]);

        // Verificar se a turma pertence ao curso selecionado
        $turma = Turma::where('id', $request->turma_id)
            ->where('curso_id', $request->curso_id)
            ->first();

        if (!$turma) {
            return back()->withErrors(['turma_id' => 'A turma selecionada não pertence ao curso escolhido.']);
        }

        $aluno->update([
            'nome' => $request->nome,
            'curso_id' => $request->curso_id,
            'turma_id' => $request->turma_id,
        ]);

        return back()->with('success', 'Aluno atualizado com sucesso!');
    }
    
    // Admin - Excluir Aluno
    public function destroyAluno(Aluno $aluno)
    {
        try {
            $aluno->delete();
            return back()->with('success', 'Aluno removido com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erro ao remover aluno: ' . $e->getMessage()]);
        }
    }
    
    // --- PARTE PÚBLICA (Consulta) ---
    public function index()
    {
        // Renderiza a página de login/pesquisa pública
        return Inertia::render('Portal/Consulta');
    }

    public function consultar(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:aluno,professor',
            'codigo' => 'required'
        ]);

        if ($request->tipo === 'aluno') {
            $aluno = Aluno::where('matricula', $request->codigo)
                ->with(['turma.curso', 'turma.sala', 'turma.aulas.disciplina', 'turma.aulas.professor', 'turma.aulas.tempoAula'])
                ->first();

            if (!$aluno) {
                return back()->with('error', 'Matrícula não encontrada.');
            }

            return Inertia::render('Portal/Resultado', [
                'usuario' => $aluno,
                'horario' => $aluno->turma
            ]);
        }

        if ($request->tipo === 'professor') {
            $professor = Professor::where('email', $request->codigo)->first();

            if (!$professor) {
                return back()->with('error', 'Código de professor não encontrado.');
            }

            $aulasDoProfessor = AulaHorario::where('professor_id', $professor->id)
                ->with([
                    'turma',
                    'turma.curso',
                    'disciplina',
                    'turma.sala',
                    'tempoAula'
                ])
                ->get();

            return Inertia::render('Portal/ResultadoProfessor', [
                'usuario' => $professor,
                'aulas' => $aulasDoProfessor
            ]);
        }
        
        return back()->with('error', 'Tipo de consulta inválido.');
    }
}
