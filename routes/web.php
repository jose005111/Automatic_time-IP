<?php

use App\Http\Controllers\DadosBiograficoController;
use App\Http\Controllers\DadosComplementaresController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MunicipeController;
use App\Http\Controllers\MunicipePdfController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\MunicipioController;
use App\Http\Controllers\ProgenitoresController;
use App\Http\Controllers\RecrutamentoController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransferenciaController;
use App\Http\Controllers\UserController;
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
    return inertia('welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// =====================================================
// ROTAS AUTENTICADAS
// =====================================================


Route::middleware(['auth'])->group(function () {
    Route::get('/utilizadores', [UserController::class, 'index'])->name('users.index');
    Route::post('/utilizadores', [UserController::class, 'store'])->name('users.store');
    Route::put('/utilizadores/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/utilizadores/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});


Route::middleware(['auth', 'verified'])->group(function () {

    // ------------------ DASHBOARD ------------------
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
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

     Route::get('/reports', [ReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('reports.index');

// ── MUNÍCIPES (CRUD + sub-recursos via modal)
Route::prefix('municipes')->name('municipes.')->group(function () {
    Route::get('/',          [MunicipeController::class, 'index'])->name('index');
    Route::post('/',         [MunicipeController::class, 'store'])->name('store');
    Route::put('/{municipe}', [MunicipeController::class, 'update'])->name('update');
    Route::delete('/{municipe}', [MunicipeController::class, 'destroy'])->name('destroy');

    // Dados relacionados — usados pelos modais
    Route::post('/{municipe}/biografico',   [MunicipeController::class, 'storeBiografico'])->name('biografico.store');
    Route::post('/{municipe}/complementar', [MunicipeController::class, 'storeComplementar'])->name('complementar.store');
    Route::post('/{municipe}/endereco',     [MunicipeController::class, 'storeEndereco'])->name('endereco.store');
    Route::post('/{municipe}/recrutamento', [MunicipeController::class, 'storeRecrutamento'])->name('recrutamento.store');

    // Actualizar estado de recrutamento
    Route::patch('/{municipe}/recrutamento/{recrutamento}', [MunicipeController::class, 'updateRecrutamento'])->name('recrutamento.update');

    // Transferência (dentro de um recrutamento)
    Route::post('/{municipe}/recrutamento/{recrutamento}/transferencia', [MunicipeController::class, 'storeTransferencia'])->name('transferencia.store');
});

// ── PROGENITORES — pesquisa rápida + CRUD
Route::prefix('progenitores')->name('progenitores.')->group(function () {
    Route::get('/',                 [ProgenitoresController::class, 'index'])->name('index');
    Route::post('/',                [ProgenitoresController::class, 'store'])->name('store');
    Route::put('/{progenitor}',     [ProgenitoresController::class, 'update'])->name('update');
    Route::delete('/{progenitor}',  [ProgenitoresController::class, 'destroy'])->name('destroy');
    Route::get('/search',           [ProgenitoresController::class, 'search'])->name('search'); // JSON
});

// ── DADOS BIOGRÁFICOS (acesso directo — opcional)
Route::apiResource('dados-biograficos', DadosBiograficoController::class)
    ->parameters(['dados-biograficos' => 'dadosBiografico'])
    ->except(['create', 'edit']);

// ── DADOS COMPLEMENTARES (acesso directo — opcional)
Route::apiResource('dados-complementares', DadosComplementaresController::class)
    ->parameters(['dados-complementares' => 'dadosComplementar'])
    ->except(['create', 'edit']);

});

// Rota para download/visualização do PDF do munícipe
Route::get('/municipes/{municipe}/pdf', [MunicipePdfController::class, 'download'])
    ->name('municipes.pdf');
 
// Rota de pesquisa de progenitores (AJAX — devolve JSON)
// Já está no grupo de progenitores, mas confirmar que existe:
Route::get('/progenitores/search', [ProgenitoresController::class, 'search'])
    ->name('progenitores.search');
