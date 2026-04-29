<?php

namespace App\Http\Controllers;

use App\Models\Departamento;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartamentoController extends Controller
{
    public function index(Request $request)
    {
        $query = Departamento::query();

        if ($request->search) {
            $query->where('nome', 'like', '%' . $request->search . '%')
            ->orWhere('sigla', 'like', '%' . $request->search . '%');
        }

        $departamentos = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('departamentos/index', [
            'departamentos' => $departamentos,
            'search' => $request->search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:10',
        ]);

        Departamento::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Departamento $departamento)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:10',
        ]);

        $departamento->update($validated);

        return redirect()->back();
    }

    public function destroy(Departamento $departamento)
    {
        $departamento->delete();

        return redirect()->back();
    }
}
