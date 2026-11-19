<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MunicipePainelController extends Controller
{
    public function index()
    {
        $user     = Auth::user();
        $municipe = $user->municipe;

        abort_if(! $municipe, 404, 'Nenhum registo de munícipe associado à sua conta.');

        $municipe->load([
            'municipioNaturalidade.provincia',
            'pai',
            'mae',
            'dadosBiograficos',
            'dadosComplementares',
            'endereco.provincia',
            'endereco.municipio',
            'recrutamentos' => fn ($q) => $q->with([
                'transferencias.municipioDestino',
            ])->latest(),
        ]);

        // Resolve URL pública da foto
        $municipe->foto_url = $municipe->foto
            ? Storage::disk('public')->url($municipe->foto)
            : null;

        return Inertia::render('Municipes/Painel', [
            'municipe' => $municipe,
        ]);
    }
}
