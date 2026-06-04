<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MunicipeController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\MunicipioController;
use App\Http\Controllers\RecrutamentoController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransferenciaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - SIGID (Sistema Informático de Gestão da Informação)
| Administração Municipal de Benguela - DMRMAB
|--------------------------------------------------------------------------
| Todas as rotas protegidas por auth + verified.
| Padrão Inertia + React: index pages com paginação + modals para CRUD.
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// =====================================================
// ROTAS AUTENTICADAS
// =====================================================
Route::middleware(['auth', 'verified'])->group(function () {

    // ------------------ DASHBOARD ------------------
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // ------------------ MUNÍCIPES (Módulo Principal) ------------------
    // Gestão completa de munícipes + dados relacionados via modals
    Route::resource('municipes', MunicipeController::class)
        ->except(['create', 'show', 'edit']);

    // Rotas adicionais para dados relacionados (chamadas via Modal enriquecido)
    Route::post('/municipes/{municipe}/biografico', [MunicipeController::class, 'storeBiografico'])
        ->name('municipes.biografico.store');

    Route::post('/municipes/{municipe}/complementar', [MunicipeController::class, 'storeComplementar'])
        ->name('municipes.complementar.store');

    Route::post('/municipes/{municipe}/endereco', [MunicipeController::class, 'storeEndereco'])
        ->name('municipes.endereco.store');

    Route::post('/municipes/{municipe}/recrutamento', [MunicipeController::class, 'storeRecrutamento'])
        ->name('municipes.recrutamento.store');

    // ------------------ LOCALIZAÇÕES (Províncias + Municípios) ------------------
    // Gestão de províncias (página combinada com municípios)
    Route::resource('provincias', ProvinciaController::class)
        ->except(['create', 'show', 'edit'])
        ->names('provincias');

          Route::resource('localizacoes', ProvinciaController::class)
        ->except(['create', 'show', 'edit'])
        ->names('provincias');
    // Gestão de municípios (pode ser usado em modal ou página separada)
    Route::resource('municipios', MunicipioController::class)
        ->except(['create', 'show', 'edit'])
        ->names('municipios');

    // Alternativa: se quiseres manter o nome "localizacoes" apontando para a página combinada
    // Route::get('/localizacoes', [ProvinciaController::class, 'index'])->name('localizacoes.index');

    // ------------------ RECRUTAMENTOS ------------------
    // Recenseamento Militar / Recrutamento
    Route::resource('recrutamentos', RecrutamentoController::class)
        ->except(['create', 'show', 'edit']);

    // ------------------ TRANSFERÊNCIAS ------------------
    // Solicitação e aprovação de transferências entre municípios
    Route::resource('transferencias', TransferenciaController::class)
        ->except(['create', 'show', 'edit']);

    // Rota dedicada para aprovação (mais segura e clara que editar estado)
    Route::post('/transferencias/{transferencia}/aprovar', [TransferenciaController::class, 'aprovar'])
        ->name('transferencias.aprovar');

        Route::get('/relatorios', [ReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('reports.index');

});

// =====================================================
// FALLBACK / 404 personalizado (opcional)
// =====================================================
// Route::fallback(function () {
//     return Inertia::render('Errors/404');
// });
