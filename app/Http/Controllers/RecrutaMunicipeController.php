<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

/**
 * Acções disponíveis para um munícipe com perfil de recruta:
 * - Ver os seus dados de recrutamento
 * - Exportar a sua ficha (via frontend PDF)
 * - Solicitar uma transferência pendente
 * - Cancelar uma transferência pendente (própria)
 */
class RecrutaMunicipeController extends Controller
{
    /**
     * Página principal de recruta — dados + transferências.
     * Rota: GET /meu-recrutamento
     */
    public function index()
    {
        $user     = Auth::user();
        $municipe = $user->municipe;

        abort_if(! $municipe, 404, 'Nenhum registo de munícipe associado à sua conta.');

        $municipe->load([
            'municipioNaturalidade.provincia',
            'dadosBiograficos',
            'dadosComplementares',
            'endereco.provincia',
            'endereco.municipio',
            'pai',
            'mae',
            'recrutamentos' => fn ($q) => $q->with([
                'transferencias.municipioDestino',
            ])->latest(),
        ]);

        $municipe->foto_url = $municipe->foto
            ? Storage::disk('public')->url($municipe->foto)
            : null;

        // Verifica se tem pelo menos um recrutamento aprovado
        $temRecrutamento = $municipe->recrutamentos->isNotEmpty();
        $recrutamentoAtivo = $municipe->recrutamentos
            ->where('estado', 1) // aprovado
            ->first();

        return Inertia::render('Municipes/MeuRecrutamento', [
            'municipe'         => $municipe,
            'municipios'       => Municipio::with('provincia:id,nome')
                ->orderBy('nome')
                ->get(['id', 'nome', 'id_provincia']),
            'temRecrutamento'  => $temRecrutamento,
            'recrutamentoAtivo' => $recrutamentoAtivo,
        ]);
    }

    /**
     * Solicita uma transferência a partir do painel do recruta.
     * Apenas para recrutamentos aprovados (estado = 1).
     * Rota: POST /meu-recrutamento/{recrutamento}/transferencia
     */
    public function solicitarTransferencia(Request $request, $recrutamentoId)
    {
        $user     = Auth::user();
        $municipe = $user->municipe;

        abort_if(! $municipe, 404);

        // Garante que o recrutamento pertence ao próprio munícipe
        $recrutamento = $municipe->recrutamentos()->findOrFail($recrutamentoId);

        // Só pode solicitar transferência se o recrutamento estiver aprovado
        if ($recrutamento->estado !== 1) {
            return back()->with('error', 'Só pode solicitar transferência com um recrutamento aprovado.');
        }

        // Não pode ter uma transferência pendente em aberto
        $temPendente = $recrutamento->transferencias()
            ->where('estado', 0)
            ->exists();

        if ($temPendente) {
            return back()->with('error', 'Já tem uma solicitação de transferência pendente. Aguarde a resolução antes de submeter outra.');
        }

        $validated = $request->validate([
            'data_solicitacao'     => 'required|date|before_or_equal:today',
            'id_municipio_destino' => 'nullable|exists:municipios,id',
            'local_destino'        => 'nullable|string|max:255',
            'motivo'               => 'nullable|string|max:1000',
        ]);

        $recrutamento->transferencias()->create([
            'data_solicitacao'     => $validated['data_solicitacao'],
            'id_municipio_destino' => $validated['id_municipio_destino'] ?? null,
            'local_destino'        => $validated['local_destino'] ?? null,
            'estado'               => 0, // sempre pendente — munícipe não pode auto-aprovar
        ]);

        return back()->with('success', 'Solicitação de transferência submetida com sucesso! Aguarde a aprovação.');
    }

    /**
     * Cancela uma transferência pendente própria.
     * Rota: DELETE /meu-recrutamento/transferencia/{transferencia}
     */
    public function cancelarTransferencia($transferenciaId)
    {
        $user     = Auth::user();
        $municipe = $user->municipe;

        abort_if(! $municipe, 404);

        // Localiza a transferência verificando que pertence ao munícipe
        $transferencia = \App\Models\Transferencia::whereHas('recrutamento', function ($q) use ($municipe) {
            $q->where('id_municipe', $municipe->id);
        })->findOrFail($transferenciaId);

        // Só pode cancelar se ainda estiver pendente
        if ($transferencia->estado !== 0) {
            return back()->with('error', 'Só é possível cancelar transferências pendentes.');
        }

        $transferencia->delete();

        return back()->with('success', 'Solicitação de transferência cancelada.');
    }
}
