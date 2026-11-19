<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProvinciaController extends Controller
{
public function index(Request $request): Response
{
    $provincias = Provincia::withCount('municipios')
        ->orderBy('nome')
        ->paginate(10, ['*'], 'provincias_page')
        ->withQueryString();

    $municipiosQuery = Municipio::with('provincia');

    if ($search = $request->input('search')) {
        $municipiosQuery->where('nome', 'like', "%{$search}%");
    }
    if ($idProvincia = $request->input('id_provincia')) {
        $municipiosQuery->where('id_provincia', $idProvincia);
    }

    $municipios = $municipiosQuery
        ->orderBy('nome')
        ->paginate(10, ['*'], 'municipios_page')
        ->withQueryString();

    return Inertia::render('Localizacoes/Index', [
        'provincias' => $provincias,
        'municipios' => $municipios,
        'filters'    => $request->only(['search', 'id_provincia']),
    ]);
}

public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:100|unique:provincias,nome',
        ]);

        Provincia::create($validated);

        return back()->with('success', 'Província criada com sucesso!');
    } catch (ValidationException $e) {
        // Pega o primeiro erro e manda como flash error
        $firstError = collect($e->errors())->flatten()->first();
        return back()
            ->with('error', $firstError)
            ->withErrors($e->errors())
            ->withInput();
    }
}

public function update(Request $request, Provincia $provincia)
{
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:100|unique:provincias,nome,' . $provincia->id,
        ]);

        $provincia->update($validated);

        return back()->with('success', 'Província atualizada com sucesso!');
    } catch (ValidationException $e) {
        $firstError = collect($e->errors())->flatten()->first();
        return back()
            ->with('error', $firstError)
            ->withErrors($e->errors())
            ->withInput();
    }
}

    public function destroy(Provincia $provincia)
    {
        $provincia->delete();
        return back()->with('success', 'Província removida!');
    }
}
