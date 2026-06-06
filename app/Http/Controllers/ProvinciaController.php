<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProvinciaController extends Controller
{
   public function index(Request $request): Response
{
    $provincias = Provincia::withCount('municipios')
        ->orderBy('nome')
        ->paginate(10)
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
        ->paginate(10)
        ->withQueryString();

    return Inertia::render('Localizacoes/Index', [
        'provincias' => $provincias,
        'municipios' => $municipios,
        'filters'    => $request->only(['search', 'id_provincia']),
    ]);
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:100|unique:provincias,nome',
        ]);

        Provincia::create($validated);

        return back()->with('success', 'Província criada com sucesso!');
    }

    public function update(Request $request, Provincia $provincia)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:100|unique:provincias,nome,' . $provincia->id,
        ]);

        $provincia->update($validated);

        return back()->with('success', 'Província atualizada!');
    }

    public function destroy(Provincia $provincia)
    {
        $provincia->delete();
        return back()->with('success', 'Província removida!');
    }
}
