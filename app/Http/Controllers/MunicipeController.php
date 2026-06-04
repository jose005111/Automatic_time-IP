<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Provincia;
use App\Models\Municipio;
use App\Models\Progenitor;
use App\Models\DadosBiografico;
use App\Models\DadosComplementar;
use App\Models\Endereco;
use App\Models\Recrutamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MunicipeController extends Controller
{
    /**
     * Lista munícipes com paginação, eager loading completo e filtros profissionais.
     * Inclui search por nome/BI e filtros por sexo/estado civil.
     */
    public function index(Request $request): Response
    {
        $query = Municipe::with([
            'municipioNaturalidade.provincia',
            'dadosBiograficos',
            'dadosComplementares',
            'endereco.provincia',
            'endereco.municipio',
            'pai',
            'mae',
            'recrutamentos' => fn($q) => $q->latest()->take(3), // últimos 3 recrutamentos (otimização)
        ])->latest();

        // Filtros e pesquisa (padrão enterprise para UX)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nome_completo', 'like', "%{$search}%")
                  ->orWhere('bi_numero', 'like', "%{$search}%")
                  ->orWhere('telefone', 'like', "%{$search}%")
                  ->orWhere('celular', 'like', "%{$search}%");
            });
        }

        if ($sexo = $request->input('sexo')) {
            $query->where('sexo', $sexo);
        }

        if ($estadoCivil = $request->input('estado_civil')) {
            $query->where('estado_civil', $estadoCivil);
        }

        if ($hasBI = $request->input('has_bi')) {
            if ($hasBI === 'yes') {
                $query->whereNotNull('bi_numero');
            } elseif ($hasBI === 'no') {
                $query->whereNull('bi_numero');
            }
        }

        // Paginação com preservação de filtros na URL
        $municipes = $query->paginate(15)->withQueryString();

        return Inertia::render('Municipes/Index', [
            'municipes' => $municipes,
            'provincias' => Provincia::all(['id', 'nome']),
            'municipios' => Municipio::with('provincia:id,nome')->get(['id', 'nome', 'id_provincia']),
            'filters' => $request->only(['search', 'sexo', 'estado_civil', 'has_bi']),
        ]);
    }

    /**
     * Armazena um novo munícipe + dados relacionados (se enviados).
     * Usa transação para garantir integridade (padrão senior).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'required|date|before:today',
            'sexo' => 'required|in:M,F',
            'estado_civil' => 'nullable|string|max:50',
            'naturalidade' => 'nullable|string|max:150',
            'id_municipio_naturalidade' => 'nullable|exists:municipios,id',
            'bi_numero' => 'nullable|string|max:50|unique:municipes,bi_numero',
            'bi_data_emissao' => 'nullable|date|required_with:bi_numero',
            'bi_data_validade' => 'nullable|date|after_or_equal:bi_data_emissao',
            'telefone' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'id_pai' => 'nullable|exists:progenitores,id',
            'id_mae' => 'nullable|exists:progenitores,id',

            // Dados relacionados (opcionais no momento do cadastro)
            'dados_biograficos' => 'nullable|array',
            'dados_complementares' => 'nullable|array',
            'endereco' => 'nullable|array',
        ]);

        $municipe = DB::transaction(function () use ($validated) {
            $municipe = Municipe::create([
                ...$validated,
                'id_user' => Auth::id(),
            ]);

            // Cria dados relacionados se fornecidos (updateOrCreate evita duplicados)
            if (!empty($validated['dados_biograficos'])) {
                $municipe->dadosBiograficos()->updateOrCreate(
                    ['id_municipe' => $municipe->id],
                    $validated['dados_biograficos']
                );
            }

            if (!empty($validated['dados_complementares'])) {
                $municipe->dadosComplementares()->updateOrCreate(
                    ['id_municipe' => $municipe->id],
                    $validated['dados_complementares']
                );
            }

            if (!empty($validated['endereco'])) {
                $municipe->endereco()->updateOrCreate(
                    ['id_municipe' => $municipe->id],
                    $validated['endereco']
                );
            }

            return $municipe;
        });

        return redirect()
            ->route('municipes.index')
            ->with('success', 'Munícipe cadastrado com sucesso!');
    }

    /**
     * Atualiza dados principais do munícipe.
     */
    public function update(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'nome_completo' => 'required|string|max:255',
            'data_nascimento' => 'required|date|before:today',
            'sexo' => 'required|in:M,F',
            'estado_civil' => 'nullable|string|max:50',
            'naturalidade' => 'nullable|string|max:150',
            'id_municipio_naturalidade' => 'nullable|exists:municipios,id',
            'bi_numero' => 'nullable|string|max:50|unique:municipes,bi_numero,' . $municipe->id,
            'bi_data_emissao' => 'nullable|date|required_with:bi_numero',
            'bi_data_validade' => 'nullable|date|after_or_equal:bi_data_emissao',
            'telefone' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'id_pai' => 'nullable|exists:progenitores,id',
            'id_mae' => 'nullable|exists:progenitores,id',
        ]);

        $municipe->update($validated);

        return redirect()
            ->route('municipes.index')
            ->with('success', 'Munícipe atualizado com sucesso!');
    }

    /**
     * Remove um munícipe (cascade deleta dados relacionados via FK).
     */
    public function destroy(Municipe $municipe)
    {
        $municipe->delete();

        return redirect()
            ->route('municipes.index')
            ->with('success', 'Munícipe removido com sucesso!');
    }

    // ==================== MÉTODOS PARA DADOS RELACIONADOS (usados via Modal no frontend) ====================

    public function storeBiografico(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'nip' => 'nullable|string|max:50',
            'assento_numero' => 'nullable|string|max:50',
            'registro_civil' => 'nullable|string|max:50',
            'registro_numero' => 'nullable|string|max:50',
            'cedula_numero' => 'nullable|string|max:50',
            'numero_filhos' => 'nullable|integer|min:0',
            'vencimento' => 'nullable|numeric|min:0',
            'ramo_actividade' => 'nullable|string|max:100',
            'ramo' => 'nullable|string|max:100',
            'ano_incorporacao' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'ano_abandono' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'ano_servico' => 'nullable|integer|min:0',
            'modo_vida' => 'nullable|string|max:100',
        ]);

        $municipe->dadosBiograficos()->updateOrCreate(
            ['id_municipe' => $municipe->id],
            $validated
        );

        return back()->with('success', 'Dados biográficos atualizados com sucesso!');
    }

    public function storeComplementar(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'caixa_postal' => 'nullable|string|max:20',
            'nif' => 'nullable|string|max:30',
            'encargo_familiar' => 'nullable|integer|min:0',
            'habilitacao_literaria' => 'nullable|string|max:100',
            'profissao' => 'nullable|string|max:100',
            'numero_irmaos' => 'nullable|integer|min:0',
            'entidade_emissora_bi' => 'nullable|string|max:100',
            'numero_carta_conducao' => 'nullable|string|max:50',
            'data_emissao_carta' => 'nullable|date',
            'data_validade_carta' => 'nullable|date|after_or_equal:data_emissao_carta',
            'atributo' => 'nullable|string|max:100',
        ]);

        $municipe->dadosComplementares()->updateOrCreate(
            ['id_municipe' => $municipe->id],
            $validated
        );

        return back()->with('success', 'Dados complementares atualizados com sucesso!');
    }

    public function storeEndereco(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'comuna' => 'nullable|string|max:150',
            'id_provincia' => 'nullable|exists:provincias,id',
            'id_municipio' => 'nullable|exists:municipios,id',
            'localidade' => 'nullable|string|max:150',
            'morada' => 'nullable|string|max:255',
        ]);

        $municipe->endereco()->updateOrCreate(
            ['id_municipe' => $municipe->id],
            $validated
        );

        return back()->with('success', 'Endereço atualizado com sucesso!');
    }

    public function storeRecrutamento(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'data_recruta' => 'required|date|before_or_equal:today',
            'observacoes' => 'nullable|string|max:1000',
            'estado' => 'required|integer|in:0,1,2',
        ]);

        $municipe->recrutamentos()->create($validated);

        return back()->with('success', 'Recrutamento registado com sucesso!');
    }
}
