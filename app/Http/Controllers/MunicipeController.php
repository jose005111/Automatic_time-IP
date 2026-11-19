<?php

namespace App\Http\Controllers;

use App\Models\Municipe;
use App\Models\Municipio;
use App\Models\Progenitor;
use App\Models\Provincia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
            'recrutamentos' => fn ($q) => $q->with('transferencias.municipioDestino')->latest()->take(5),
            'usuarios:id,id_municipe,email',
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

        // Resolve URL pública da foto para cada munícipe
        $municipes->getCollection()->transform(function ($municipe) {
            $municipe->foto_url = $municipe->foto
                ? Storage::disk('public')->url($municipe->foto)
                : null;

            return $municipe;
        });

        // Estatísticas rápidas para os cards
        $stats = [
            'total' => Municipe::count(),
            'masculino' => Municipe::where('sexo', 'M')->count(),
            'feminino' => Municipe::where('sexo', 'F')->count(),
            'com_bi' => Municipe::whereNotNull('bi_numero')->count(),
        ];

        return Inertia::render('Municipes/Index', [
            'municipes' => $municipes,
            'provincias' => Provincia::orderBy('nome')->get(['id', 'nome']),
            'municipios' => Municipio::with('provincia:id,nome')->orderBy('nome')->get(['id', 'nome', 'id_provincia']),
            'progenitores' => Progenitor::orderBy('nome_completo')->get(['id', 'nome_completo', 'sexo']),
            'filters' => $request->only(['search', 'sexo', 'estado_civil', 'has_bi']),
            'stats' => $stats,
        ]);
    }

    private function mensagensValidacao(): array
    {
        return [
            'nome_completo.required' => 'O nome completo é obrigatório.',
            'nome_completo.min' => 'O nome completo deve ter pelo menos 3 caracteres.',
            'data_nascimento.required' => 'A data de nascimento é obrigatória.',
            'data_nascimento.date' => 'A data de nascimento deve ser uma data válida.',
            'data_nascimento.before' => 'A data de nascimento deve ser anterior a hoje.',
            'sexo.required' => 'Selecione o sexo.',
            'sexo.in' => 'Selecione Masculino ou Feminino.',
            'email.required' => 'O email de acesso é obrigatório.',
            'email.email' => 'Informe um email válido.',
            'email.unique' => 'Este email já está a ser utilizado.',
            'bi_numero.unique' => 'Este número de BI já está registado.',
            'bi_data_emissao.required_with' => 'Informe a data de emissão do BI.',
            'bi_data_emissao.date' => 'A data de emissão do BI deve ser válida.',
            'bi_data_validade.date' => 'A data de validade do BI deve ser válida.',
            'bi_data_validade.after_or_equal' => 'A validade do BI deve ser igual ou posterior à emissão.',
            'id_municipio_naturalidade.exists' => 'O município de naturalidade selecionado não é válido.',
            'id_pai.exists' => 'O pai selecionado não é válido.',
            'id_mae.exists' => 'A mãe selecionada não é válida.',
        ];
    }

    /**
     * Armazena um novo munícipe. Usa transação para garantir integridade.
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
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'id_pai' => 'nullable|exists:progenitores,id',
            'id_mae' => 'nullable|exists:progenitores,id',
            'email' => 'required|email|max:255|unique:users,email',
        ], $this->mensagensValidacao());

        DB::transaction(function () use ($validated, $request) {
            $fotoPath = null;
            if ($request->hasFile('foto')) {
                $fotoPath = $request->file('foto')->store('municipes/fotos', 'public');
            }

            $municipe = Municipe::create([
                ...collect($validated)->except(['email', 'foto'])->toArray(),
                'foto' => $fotoPath,
                'id_user' => Auth::id(),
            ]);

            if (! empty($validated['email'])) {
                User::create([
                    'name' => $municipe->nome_completo,
                    'email' => $validated['email'],
                    'password' => bcrypt('12345678'),
                    'role' => 'municipe',
                    'id_municipe' => $municipe->id,
                    'must_change_password' => true, // força troca no 1º login
                ]);
            }
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
            'bi_numero' => 'nullable|string|max:50|unique:municipes,bi_numero,'.$municipe->id,
            'bi_data_emissao' => 'nullable|date|required_with:bi_numero',
            'bi_data_validade' => 'nullable|date|after_or_equal:bi_data_emissao',
            'telefone' => 'nullable|string|max:20',
            'celular' => 'nullable|string|max:20',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'id_pai' => 'nullable|exists:progenitores,id',
            'id_mae' => 'nullable|exists:progenitores,id',
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($municipe->usuarios()->first())],
        ], $this->mensagensValidacao());

        DB::transaction(function () use ($validated, $municipe, $request) {
            $fotoPath = $municipe->foto;
            if ($request->hasFile('foto')) {
                // Remove a foto antiga se existir
                if ($fotoPath) {
                    Storage::disk('public')->delete($fotoPath);
                }
                $fotoPath = $request->file('foto')->store('municipes/fotos', 'public');
            }

            $municipe->update([
                ...collect($validated)->except(['email', 'foto'])->toArray(),
                'foto' => $fotoPath,
            ]);

            if (! empty($validated['email'])) {
                $usuario = $municipe->usuarios()->first();
                if ($usuario) {
                    $usuario->update(['email' => $validated['email']]);
                } else {
                    User::create([
                        'name' => $municipe->nome_completo,
                        'email' => $validated['email'],
                        'password' => bcrypt('12345678'),
                        'role' => 'municipe',
                        'id_municipe' => $municipe->id,
                        'must_change_password' => true,
                    ]);
                }
            }
        });

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
            'nip' => 'nullable|string|max:50',
            'assento_numero' => 'nullable|string|max:50',
            'registro_civil' => 'nullable|string|max:50',
            'registro_numero' => 'nullable|string|max:50',
            'cedula_numero' => 'nullable|string|max:50',
            'numero_filhos' => 'nullable|integer|min:0',
            'vencimento' => 'nullable|numeric|min:0',
            'ramo_actividade' => 'nullable|string|max:100',
            'ramo' => 'nullable|string|max:100',
            'ano_incorporacao' => 'nullable|integer|min:1900|max:'.(date('Y') + 1),
            'ano_abandono' => 'nullable|integer|min:1900|max:'.(date('Y') + 1),
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
            'morada' => 'nullable|string|max:255',
            'localidade' => 'nullable|string|max:150',
            'comuna' => 'nullable|string|max:150',
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
            'observacoes' => 'nullable|string|max:1000',
            'estado' => 'required|integer|in:0,1,2',
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
            'estado' => 'required|integer|in:0,1,2',
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
            'data_solicitacao' => 'required|date|before_or_equal:today',
            'id_municipio_destino' => 'nullable|exists:municipios,id',
            'local_destino' => 'nullable|string|max:255',
            'estado' => 'required|integer|in:0,1,2',
        ]);

        $recrutamento->transferencias()->create([
            ...$validated,
            'id_user_aprovou' => $validated['estado'] == 1 ? Auth::id() : null,
            'data_aprovacao' => $validated['estado'] == 1 ? now()->toDateString() : null,
        ]);

        return back()->with('success', 'Transferência registada com sucesso!');
    }
}
