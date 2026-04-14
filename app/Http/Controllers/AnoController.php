<?php

namespace App\Http\Controllers;

use App\Models\Ano;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnoController extends Controller
{
    public function index(Request $request)
    {
        $query = Ano::query();

        if ($request->search) {
            $query->where('ano', 'like', '%' . $request->search . '%');
        }

        return Inertia::render('anos/index', [
            'anos' => $query->orderBy('ano', 'desc')->paginate(10)->withQueryString(),
            'search' => $request->search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ano' => 'required|integer|unique:anos,ano',
            'estado' => 'required|integer',
        ]);
        Ano::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Ano $ano)
    {
        $validated = $request->validate([
            'ano' => "required|integer|unique:anos,ano,{$ano->id}",
            'estado' => 'required|integer',
        ]);

        $ano->update($validated);
        return redirect()->back();
    }

    public function destroy(Ano $ano)
    {
        $ano->delete();
        return redirect()->back();
    }
}
