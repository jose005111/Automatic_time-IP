<?php
 
namespace App\Http\Controllers;
 
use App\Models\Progenitor;
use Illuminate\Http\Request;
use Inertia\Inertia;
 
class ProgenitoresController extends Controller
{
    public function index()
    {
        return Inertia::render('Progenitores/Index', [
            'progenitores' => Progenitor::orderBy('nome_completo')->get(),
        ]);
    }
 

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_completo'   => 'required|string|max:255',
            'data_nascimento' => 'nullable|date|before:today',
            'naturalidade'    => 'nullable|string|max:150',
            'profissao'       => 'nullable|string|max:100',
            'sexo'            => 'nullable|in:M,F',
        ]);

        $progenitor = Progenitor::create($validated);

        // Se o pedido espera JSON (chamada fetch do React), devolve o objecto
        if ($request->expectsJson() || $request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json($progenitor, 201);
        }

        return back()
            ->with('success', 'Progenitor cadastrado com sucesso!');
    }
 
    public function update(Request $request, Progenitor $progenitor)
    {
        $validated = $request->validate([
            'nome_completo'   => 'required|string|max:255',
            'data_nascimento' => 'nullable|date|before:today',
            'naturalidade'    => 'nullable|string|max:150',
            'profissao'       => 'nullable|string|max:100',
            'sexo'            => 'nullable|in:M,F',
        ]);
 
        $progenitor->update($validated);
 
        return back()->with('success', 'Progenitor actualizado!');
    }
 
    public function destroy(Progenitor $progenitor)
    {
        $progenitor->delete();
        return back()->with('success', 'Progenitor removido!');
    }
 
    /**
     * Pesquisa rápida via AJAX — usada pelo combobox do React.
     */
    public function search(Request $request)
    {
        $q = $request->input('q', '');
        $sexo = $request->input('sexo');
 
        $query = Progenitor::query()
            ->select('id', 'nome_completo', 'sexo', 'profissao')
            ->when($q, fn($builder) =>
                $builder->where('nome_completo', 'like', "%{$q}%")
            )
            ->when($sexo, fn($builder) =>
                $builder->where(fn($b) =>
                    $b->where('sexo', $sexo)->orWhereNull('sexo')
                )
            )
            ->orderBy('nome_completo')
            ->limit(20);
 
        return response()->json($query->get());
    }
}
 
