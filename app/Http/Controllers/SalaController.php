<?php

namespace App\Http\Controllers;

use App\Models\Sala;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salas = Sala::paginate(10);
        // dd($salas);

         return Inertia::render('sala/index', [
        'salas' => $salas,
        'search' => $request->search ?? '',
    ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // dd($request);

        $validated = $request->validate([
            'designacao' => ['required', 'max:255'],
            'estado' => ['required', 'integer'],
            'numero' => ['required', 'integer', 'unique:salas'],
            'capacidade' => ['required', 'integer'],
        ]);

        Sala::create($validated);
        return redirect()->route('salas.index')->with('success', 'Sala criada com sucesso!');
    }

   
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sala $sala)
    {
        $validated = $request->validate([
            'designacao' => ['required', 'max:255'],
            'estado' => ['required', 'integer'],
            'numero' => ['required', 'integer', 'unique:salas,escola_id'],
            'capacidade' => ['required', 'integer'],
        ]);

        $sala->update($validated);
        return redirect()->route('salas.index')->with('success', 'Sala actualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sala $sala)
    {
        $sala->delete();
        return redirect()->route('salas.index')->with('success', 'Sala deletada com sucesso!');
    }
}
