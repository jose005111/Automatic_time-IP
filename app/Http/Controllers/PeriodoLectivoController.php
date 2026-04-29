<?php

namespace App\Http\Controllers;

use App\Models\PeriodoLectivo;
use App\Models\Turma;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;

class PeriodoLectivoController extends Controller
{
    /**
     * Listagem de períodos lectivos com pesquisa.
     */
    public function index(Request $request)
    {
        return Inertia::render('periodos_lectivos/index', [
            'periodos' => PeriodoLectivo::query()
                ->when($request->input('search'), function ($query, $search) {
                    $query->where('ano', 'like', "%{$search}%")
                          ->orWhere('semestre', 'like', "%{$search}%");
                })
                ->orderBy('ano', 'desc')
                ->orderBy('semestre', 'desc')
                ->paginate(10)
                ->withQueryString(),
            
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Salva o período lectivo.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ano'          => 'required|integer|min:2000|max:2100',
            'semestre'     => 'required|in:1,2',
            'data_inicio'  => 'required|date',
            'data_fim'     => 'required|date|after:data_inicio',
            'estado'       => 'required|in:activo,inactivo,concluido',
        ], [
            'ano.required' => 'O ano é obrigatório.',
            'ano.integer' => 'O ano deve ser um número válido.',
            'semestre.required' => 'O semestre é obrigatório.',
            'semestre.in' => 'O semestre deve ser 1 ou 2.',
            'data_fim.after' => 'A data de fim deve ser posterior à data de início.',
            'estado.required' => 'O estado é obrigatório.',
            'estado.in' => 'Estado inválido. Use: activo, inactivo ou concluido.',
        ]);

        // Se for criar um período activo, verificar se já existe um activo
        if ($validated['estado'] === 'activo') {
            $activeExists = PeriodoLectivo::where('estado', 'activo')->exists();
            if ($activeExists) {
                return Redirect::back()->with('error', 'Já existe um período lectivo activo. Desactive-o primeiro.');
            }
        }

        PeriodoLectivo::create($validated);

        return Redirect::back()->with('success', 'Período lectivo criado com sucesso.');
    }

    /**
     * Mostra detalhes do período lectivo.
     */
    public function show(PeriodoLectivo $periodoLectivo)
    {
        return Inertia::render('periodos_lectivos/show', [
            'periodo' => $periodoLectivo->load('turmas'),
        ]);
    }

    /**
     * Atualiza os dados do período lectivo.
     */
    public function update(Request $request, PeriodoLectivo $periodos_lectivo)
    {
        // dd($periodos_lectivo);
        $validated = $request->validate([
            'ano'          => 'required|integer|min:2000|max:2100',
            'semestre'     => 'required|in:1,2',
            'data_inicio'  => 'required|date',
            'data_fim'     => 'required|date|after:data_inicio',
            'estado'       => 'required|in:activo,inactivo,concluido',
        ]);

        // Se estiver mudando para activo, verificar se já existe outro activo
        if ($validated['estado'] === 'activo' && $periodos_lectivo->estado !== 'activo') {
            $activeExists = PeriodoLectivo::where('estado', 'activo')
                ->where('id', '!=', $periodos_lectivo->id)
                ->exists();
            if ($activeExists) {
                return Redirect::back()->with('error', 'Já existe outro período lectivo activo. Desactive-o primeiro.');
            }
        }

        $periodos_lectivo->update($validated);

        return Redirect::back()->with('success', 'Período lectivo atualizado com sucesso.');
    }

    /**
     * Remove o período lectivo.
     */
    public function destroy(PeriodoLectivo $periodos_lectivo)
    {
        // Verificar se existem turmas associadas
        if ($periodos_lectivo->turmas()->exists()) {
            return Redirect::back()->with('error', 'Não é possível excluir este período lectivo porque existem turmas associadas.');
        }

        $periodos_lectivo->delete();
        return Redirect::back()->with('success', 'Período lectivo removido com sucesso.');
    }

    /**
     * Altera o estado do período lectivo.
     */
    public function changeStatus(Request $request, PeriodoLectivo $periodos_lectivo)
    {
        $request->validate([
            'estado' => 'required|in:activo,inactivo,concluido',
        ]);

        // Se for activar, verificar se já existe outro activo
        if ($request->estado === 'activo') {
            $activeExists = PeriodoLectivo::where('estado', 'activo')
                ->where('id', '!=', $periodos_lectivo->id)
                ->exists();
            if ($activeExists) {
                return Redirect::back()->with('error', 'Já existe um período lectivo activo.');
            }
        }

        $periodos_lectivo->update(['estado' => $request->estado]);

        return Redirect::back()->with('success', 'Estado do período lectivo alterado com sucesso.');
    }
}
