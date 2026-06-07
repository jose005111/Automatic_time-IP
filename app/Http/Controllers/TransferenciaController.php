<?php

namespace App\Http\Controllers;

use App\Models\Transferencia;
use App\Models\Recrutamento;
use App\Models\Municipio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransferenciaController extends Controller
{
  
    public function index(Request $request): Response
    {
        $query = Transferencia::with([
            'recrutamento.municipe',
            'municipioDestino.provincia',
            'userAprovou'
        ])->latest('data_solicitacao');

        // Filtros profissionais (search + estado + município)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('recrutamento.municipe', function ($sub) use ($search) {
                    $sub->where('nome_completo', 'like', "%{$search}%");
                })->orWhere('local_destino', 'like', "%{$search}%");
            });
        }

        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        if ($idMunicipio = $request->input('id_municipio_destino')) {
            $query->where('id_municipio_destino', $idMunicipio);
        }

        // Paginação com query string preservada (essencial para filtros + paginação funcionarem juntos)
        $transferencias = $query->paginate(15)->withQueryString();
        return Inertia::render('Transferencias/Index', [
            'transferencias' => $transferencias,
            'recrutamentos' => Recrutamento::with('municipe:id,nome_completo')->get(),
            'municipios' => Municipio::with('provincia:id,nome')->get(),
            'filters' => $request->only(['search', 'estado', 'id_municipio_destino']),
        ]);
    }

    /**
     * Armazena uma nova solicitação de transferência.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_recrutamento' => [
                'required',
                'exists:recrutamentos,id',
            ],
            'data_solicitacao' => 'required|date|before_or_equal:today',
            'id_municipio_destino' => 'nullable|exists:municipios,id',
            'local_destino' => 'nullable|string|max:255',
            'estado' => 'sometimes|integer|in:0,1,2',
        ]);

        $validated['estado'] = $validated['estado'] ?? 0; // Pendente por defeito

        Transferencia::create($validated);

        return redirect()
            ->route('transferencias.index')
            ->with('success', 'Solicitação de transferência registada com sucesso!');
    }

    /**
     * Atualiza uma transferência (inclui lógica inteligente de aprovação).
     */
    public function update(Request $request, Transferencia $transferencia)
    {
        $validated = $request->validate([
            'data_solicitacao' => 'required|date',
            'id_municipio_destino' => 'nullable|exists:municipios,id',
            'local_destino' => 'nullable|string|max:255',
            'estado' => 'required|integer|in:0,1,2',
        ]);

        // Lógica de negócio: ao aprovar (estado=1), preenche automaticamente data e usuário
        if ($validated['estado'] == 1 && $transferencia->estado != 1) {
            $validated['data_aprovacao'] = now()->toDateString();
            $validated['id_user_aprovou'] = Auth::id();
        } elseif ($validated['estado'] != 1) {
            // Se reverter para pendente/rejeitado, limpa os campos de aprovação
            $validated['data_aprovacao'] = null;
            $validated['id_user_aprovou'] = null;
        }

        $transferencia->update($validated);

        return back()->with('success', 'Transferência atualizada com sucesso!');
    }

    /**
     * Remove uma transferência.
     */
    public function destroy(Transferencia $transferencia)
    {
        $transferencia->delete();

        return back()->with('success', 'Transferência removida com sucesso!');
    }

    /**
     * Ação extra recomendada: Aprovar transferência (botão dedicado no frontend).
     * Mais seguro e claro do que editar manualmente o estado.
     */
    public function aprovar(Transferencia $transferencia)
    {
        if ($transferencia->estado !== 0) {
            return back()->with('error', 'Esta transferência já foi processada anteriormente.');
        }

        $transferencia->update([
            'estado' => 1,
            'data_aprovacao' => now(),
            'id_user_aprovou' => Auth::id(),
        ]);

        return back()->with('success', 'Transferência aprovada com sucesso! O munícipe pode agora ser transferido para o novo município.');
    }
}
