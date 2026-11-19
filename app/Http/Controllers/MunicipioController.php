<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use App\Models\Provincia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MunicipioController extends Controller
{
    /**
     * Lista municípios com paginação (pode ser usado em página separada ou combinado com Provincias).
     */
    public function index(Request $request): Response
    {
        $query = Municipio::with('provincia');

        if ($search = $request->input('search')) {
            $query->where('nome', 'like', "%{$search}%");
        }

        if ($idProvincia = $request->input('id_provincia')) {
            $query->where('id_provincia', $idProvincia);
        }

        $municipios = $query->orderBy('nome')->paginate(20)->withQueryString();

        return Inertia::render('Localizacoes/MunicipiosIndex', [
            'municipios' => $municipios,
            'provincias' => Provincia::orderBy('nome')->get(['id', 'nome']),
            'filters' => $request->only(['search', 'id_provincia']),
        ]);
    }

    /**
     * Cria um novo município.
     */
    public function store(Request $request)
    {
       $validated = $request->validate([
        'nome' => [
            'required',
            'string',
            'max:150',
            'unique:municipios,nome,NULL,id,id_provincia,' . $request->input('id_provincia'),
        ],
        'id_provincia' => 'required|exists:provincias,id',
    ], [
        'nome.unique' => 'Já existe um município com este nome nesta província.',
    ]);

        // O unique(nome, id_provincia) já existe na migration
        Municipio::create($validated);

        return back()->with('success', 'Município criado com sucesso!');
    }

    /**
     * Atualiza um município.
     */
    public function update(Request $request, Municipio $municipio)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:150',
            'id_provincia' => 'required|exists:provincias,id',
        ]);

        $municipio->update($validated);

        return back()->with('success', 'Município atualizado com sucesso!');
    }

    /**
     * Remove um município (atenção: pode falhar se houver FKs dependentes).
     */
    public function destroy(Municipio $municipio)
    {
        try {
            $municipio->delete();
            return back()->with('success', 'Município removido com sucesso!');
        } catch (\Illuminate\Database\QueryException $e) {
            return back()->with('error', 'Não foi possível remover: este município está sendo utilizado em outros registos.');
        }
    }
}
