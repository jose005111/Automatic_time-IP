<?php

namespace App\Http\Controllers;

use App\Models\DadosBiografico;
use App\Models\Municipe;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DadosBiograficoController extends Controller
{
    /**
     * Lista todos os dados biográficos (com o munícipe associado).
     * Útil para relatórios ou administração directa.
     */
    public function index(Request $request)
    {
        $query = DadosBiografico::with('municipe:id,nome_completo,sexo')
            ->latest();

        if ($search = $request->input('search')) {
            $query->whereHas('municipe', fn($q) =>
                $q->where('nome_completo', 'like', "%{$search}%")
            )->orWhere('nip', 'like', "%{$search}%")
             ->orWhere('ramo_actividade', 'like', "%{$search}%");
        }

        return Inertia::render('DadosBiograficos/Index', [
            'registos' => $query->paginate(20)->withQueryString(),
            'filters'  => $request->only(['search']),
        ]);
    }

    /**
     * Cria ou actualiza os dados biográficos de um munícipe.
     * Equivalente ao storeBiografico do MunicipeController mas exposto
     * como rota própria para permitir acesso directo via API/Inertia.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_municipe'      => 'required|exists:municipes,id',
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

        DadosBiografico::updateOrCreate(
            ['id_municipe' => $validated['id_municipe']],
            $validated
        );

        return back()->with('success', 'Dados biográficos guardados com sucesso!');
    }

    /**
     * Mostra os dados biográficos de um registo específico.
     */
    public function show(DadosBiografico $dadosBiografico)
    {
        return response()->json(
            $dadosBiografico->load('municipe:id,nome_completo')
        );
    }

    /**
     * Actualiza um registo existente.
     */
    public function update(Request $request, DadosBiografico $dadosBiografico)
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

        $dadosBiografico->update($validated);

        return back()->with('success', 'Dados biográficos actualizados com sucesso!');
    }

    /**
     * Remove um registo de dados biográficos.
     */
    public function destroy(DadosBiografico $dadosBiografico)
    {
        $dadosBiografico->delete();

        return back()->with('success', 'Dados biográficos removidos com sucesso!');
    }
}
