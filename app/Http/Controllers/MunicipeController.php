<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Provincia;
use App\Models\Municipio;
use App\Models\Progenitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MunicipeController extends Controller
{
    /**
     * Lista munícipes com paginação, eager loading completo e filtros.
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
            'recrutamentos' => fn($q) => $q->with('transferencias.municipioDestino')->latest()->take(5),
        ])->latest();

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

        $municipes = $query->paginate(15)->withQueryString();

        // Estatísticas rápidas para os cards
        $stats = [
            'total'       => Municipe::count(),
            'masculino'   => Municipe::where('sexo', 'M')->count(),
            'feminino'    => Municipe::where('sexo', 'F')->count(),
            'com_bi'      => Municipe::whereNotNull('bi_numero')->count(),
        ];

        return Inertia::render('Municipes/Index', [
            'municipes'   => $municipes,
            'provincias'  => Provincia::orderBy('nome')->get(['id', 'nome']),
            'municipios'  => Municipio::with('provincia:id,nome')->orderBy('nome')->get(['id', 'nome', 'id_provincia']),
            'progenitores' => Progenitor::orderBy('nome_completo')->get(['id', 'nome_completo', 'sexo']),
            'filters'     => $request->only(['search', 'sexo', 'estado_civil', 'has_bi']),
            'stats'       => $stats,
        ]);
    }

    /**
     * Armazena um novo munícipe. Usa transação para garantir integridade.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_completo'              => 'required|string|max:255',
            'data_nascimento'            => 'required|date|before:today',
            'sexo'                       => 'required|in:M,F',
            'estado_civil'               => 'nullable|string|max:50',
            'naturalidade'               => 'nullable|string|max:150',
            'id_municipio_naturalidade'  => 'nullable|exists:municipios,id',
            'bi_numero'                  => 'nullable|string|max:50|unique:municipes,bi_numero',
            'bi_data_emissao'            => 'nullable|date|required_with:bi_numero',
            'bi_data_validade'           => 'nullable|date|after_or_equal:bi_data_emissao',
            'telefone'                   => 'nullable|string|max:20',
            'celular'                    => 'nullable|string|max:20',
            'id_pai'                     => 'nullable|exists:progenitores,id',
            'id_mae'                     => 'nullable|exists:progenitores,id',
        ]);

        DB::transaction(function () use ($validated) {
            Municipe::create([
                ...$validated,
                'id_user' => Auth::id(),
            ]);
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
            'nome_completo'              => 'required|string|max:255',
            'data_nascimento'            => 'required|date|before:today',
            'sexo'                       => 'required|in:M,F',
            'estado_civil'               => 'nullable|string|max:50',
            'naturalidade'               => 'nullable|string|max:150',
            'id_municipio_naturalidade'  => 'nullable|exists:municipios,id',
            'bi_numero'                  => 'nullable|string|max:50|unique:municipes,bi_numero,' . $municipe->id,
            'bi_data_emissao'            => 'nullable|date|required_with:bi_numero',
            'bi_data_validade'           => 'nullable|date|after_or_equal:bi_data_emissao',
            'telefone'                   => 'nullable|string|max:20',
            'celular'                    => 'nullable|string|max:20',
            'id_pai'                     => 'nullable|exists:progenitores,id',
            'id_mae'                     => 'nullable|exists:progenitores,id',
        ]);

        $municipe->update($validated);

        return redirect()
            ->route('municipes.index')
            ->with('success', 'Munícipe atualizado com sucesso!');
    }

    /**
     * Remove um munícipe (cascade elimina dados relacionados via FK).
     */
    public function destroy(Municipe $municipe)
    {
        $municipe->delete();

        return redirect()
            ->route('municipes.index')
            ->with('success', 'Munícipe removido com sucesso!');
    }

    // ============================================================
    // DADOS RELACIONADOS — chamados via modais no frontend
    // ============================================================

    public function storeBiografico(Request $request, Municipe $municipe)
    {
        $validated = $request->validate([
            'nip'              => 'nullable|string|max:50',
            'assento_numero'   => 'nullable|string|max:50',
            'registro_civil'   => 'nullable|string|max:50',
            'registro_numero'  => 'nullable|string|max:50',
            'cedula_numero'    => 'nullable|string|max:50',
            'numero_filhos'    => 'nullable|integer|min:0',
            'vencimento'       => 'nullable|numeric|min:0',
            'ramo_actividade'  => 'nullable|string|max:100',
            'ramo'             => 'nullable|string|max:100',
            'ano_incorporacao' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'ano_abandono'     => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'ano_servico'      => 'nullable|integer|min:0',
            'modo_vida'        => 'nullable|string|max:100',
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
            'caixa_postal'          => 'nullable|string|max:20',
            'nif'                   => 'nullable|string|max:30',
            'encargo_familiar'      => 'nullable|integer|min:0',
            'habilitacao_literaria' => 'nullable|string|max:100',
            'profissao'             => 'nullable|string|max:100',
            'numero_irmaos'         => 'nullable|integer|min:0',
            'entidade_emissora_bi'  => 'nullable|string|max:100',
            'numero_carta_conducao' => 'nullable|string|max:50',
            'data_emissao_carta'    => 'nullable|date',
            'data_validade_carta'   => 'nullable|date|after_or_equal:data_emissao_carta',
            'atributo'              => 'nullable|string|max:100',
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
            'morada'       => 'nullable|string|max:255',
            'localidade'   => 'nullable|string|max:150',
            'comuna'       => 'nullable|string|max:150',
            'id_provincia' => 'nullable|exists:provincias,id',
            'id_municipio' => 'nullable|exists:municipios,id',
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
            'observacoes'  => 'nullable|string|max:1000',
            'estado'       => 'required|integer|in:0,1,2',
        ]);

        $municipe->recrutamentos()->create($validated);

        return back()->with('success', 'Recrutamento registado com sucesso!');
    }

    /**
     * Atualiza o estado de um recrutamento (aprovar / rejeitar).
     */
    public function updateRecrutamento(Request $request, Municipe $municipe, $recrutamentoId)
    {
        $validated = $request->validate([
            'estado'      => 'required|integer|in:0,1,2',
            'observacoes' => 'nullable|string|max:1000',
        ]);

        $municipe->recrutamentos()->findOrFail($recrutamentoId)->update($validated);

        return back()->with('success', 'Recrutamento atualizado com sucesso!');
    }

    /**
     * Regista uma transferência associada a um recrutamento.
     */
    public function storeTransferencia(Request $request, Municipe $municipe, $recrutamentoId)
    {
        $recrutamento = $municipe->recrutamentos()->findOrFail($recrutamentoId);

        $validated = $request->validate([
            'data_solicitacao'     => 'required|date|before_or_equal:today',
            'id_municipio_destino' => 'nullable|exists:municipios,id',
            'local_destino'        => 'nullable|string|max:255',
            'estado'               => 'required|integer|in:0,1,2',
        ]);

        $recrutamento->transferencias()->create([
            ...$validated,
            'id_user_aprovou' => $validated['estado'] == 1 ? Auth::id() : null,
            'data_aprovacao'  => $validated['estado'] == 1 ? now()->toDateString() : null,
        ]);

        return back()->with('success', 'Transferência registada com sucesso!');
    }
}
