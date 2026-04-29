<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaController extends Controller
{
    public function index(Request $request)
    {
        $query = Sala::query();

        if ($request->search) {
            $query->where('numero', 'like', "%{$request->search}%")
                  ->orWhere('bloco', 'like', "%{$request->search}%")
                  ->orWhere('tipo', 'like', "%{$request->search}%");
        }

        $salas = $query->paginate(10)->withQueryString();

        return Inertia::render('sala/index', [
            'salas' => $salas,
            'search' => $request->search ?? '',
        ]);
    }

    public function store(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'bloco'      => ['required', 'integer'],
            'numero'     => ['required', 'integer', 'unique:Salas,numero'],
            'capacidade' => ['required', 'integer', 'min:1'],
            'tipo'       => ['required', 'string'], // Ex: Laboratório, Sala Comum
            'estado'     => ['required', 'integer'],
        ]);

        Sala::create($validated);

        return redirect()->back()->with('success', 'Sala criada com sucesso!');
    }

    public function update(Request $request, Sala $sala)
    {
        $validated = $request->validate([
            'bloco'      => ['required', 'integer'],
            'numero'     => ['required', 'integer', 'unique:Salas,numero,' . $sala->id],
            'capacidade' => ['required', 'integer', 'min:1'],
            'tipo'       => ['required', 'string'],
            'estado'     => ['required', 'integer'],
        ]);

        $sala->update($validated);

        return redirect()->back()->with('success', 'Sala actualizada com sucesso!');
    }

    public function destroy(Sala $sala)
    {
        $sala->delete();
        return redirect()->back()->with('success', 'Sala eliminada com sucesso!');
    }
}
