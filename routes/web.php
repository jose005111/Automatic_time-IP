<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MunicipeController;
use App\Http\Controllers\MunicipePainelController;
use App\Http\Controllers\MunicipePdfController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\MunicipioController;
use App\Http\Controllers\ProgenitoresController;
use App\Http\Controllers\RecrutamentoController;
use App\Http\Controllers\RecrutaMunicipeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TransferenciaController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes - SISTEMA INFORMÁTICO DE GESTÃO DE MUNÍCIPES - DMRMAB
| Administração Municipal de Benguela - DMRMAB
|--------------------------------------------------------------------------
| Hierarquia de acesso:
|   admin   → acesso total
|   custom  → acesso geral (sem gestão de utilizadores)
|   municipe → apenas painel próprio + área de recruta
*/

// ── PÁGINA DE BOAS-VINDAS ─────────────────────────────────────────────────
Route::get('/', function () {
    return inertia('welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// =====================================================
// ROTAS AUTENTICADAS (qualquer utilizador logado)
// =====================================================
Route::middleware(['auth', 'senha_alterada'])->group(function () {

    // ── PAINEL PESSOAL DO MUNÍCIPE ──────────────────────────────────────────
    Route::get('/meu-painel', [MunicipePainelController::class, 'index'])
        ->name('municipe.painel');

    // ── ÁREA DE RECRUTA (role: municipe com recrutamento activo) ───────────
    Route::prefix('meu-recrutamento')->name('meu-recrutamento.')->group(function () {
        Route::get('/', [RecrutaMunicipeController::class, 'index'])
            ->name('index');

        Route::post('/{recrutamento}/transferencia', [RecrutaMunicipeController::class, 'solicitarTransferencia'])
            ->name('transferencia.store');

        Route::delete('/transferencia/{transferencia}', [RecrutaMunicipeController::class, 'cancelarTransferencia'])
            ->name('transferencia.destroy');
    });

    // ── PDF DO MUNÍCIPE (auth obrigatório — dados pessoais) ─────────────────
    Route::get('/municipes/{municipe}/pdf', [MunicipePdfController::class, 'download'])
        ->name('municipes.pdf');
});

// =====================================================
// ROTAS PARA ADMIN + CUSTOM (não municipe)
// =====================================================
Route::middleware(['auth', 'senha_alterada'])->group(function () {

    // ── DASHBOARD ──────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // ── RELATÓRIOS ─────────────────────────────────────────────────────────
    Route::get('/relatorios', [ReportController::class, 'index'])
        ->name('reports.index');

    // ── LOCALIZAÇÕES (Províncias + Municípios) ─────────────────────────────
    Route::resource('provincias', ProvinciaController::class)
        ->except(['create', 'show', 'edit'])
        ->names('provincias');

    Route::resource('municipios', MunicipioController::class)
        ->except(['create', 'show', 'edit'])
        ->names('municipios');

    // ── RECRUTAMENTOS ──────────────────────────────────────────────────────
    Route::resource('recrutamentos', RecrutamentoController::class)
        ->except(['create', 'show', 'edit']);

    // ── TRANSFERÊNCIAS ─────────────────────────────────────────────────────
    Route::resource('transferencias', TransferenciaController::class)
        ->except(['create', 'show', 'edit']);

    // ── MUNÍCIPES (CRUD + sub-recursos via modal) ──────────────────────────
    Route::prefix('municipes')->name('municipes.')->group(function () {
        Route::get('/',              [MunicipeController::class, 'index'])->name('index');
        Route::post('/',             [MunicipeController::class, 'store'])->name('store');
        Route::put('/{municipe}',    [MunicipeController::class, 'update'])->name('update');
        Route::delete('/{municipe}', [MunicipeController::class, 'destroy'])->name('destroy');

        // Dados relacionados — chamados pelos modais
        Route::post('/{municipe}/biografico',   [MunicipeController::class, 'storeBiografico'])->name('biografico.store');
        Route::post('/{municipe}/complementar', [MunicipeController::class, 'storeComplementar'])->name('complementar.store');
        Route::post('/{municipe}/endereco',     [MunicipeController::class, 'storeEndereco'])->name('endereco.store');
        Route::post('/{municipe}/recrutamento', [MunicipeController::class, 'storeRecrutamento'])->name('recrutamento.store');

        Route::patch('/{municipe}/recrutamento/{recrutamento}',
            [MunicipeController::class, 'updateRecrutamento'])->name('recrutamento.update');

        Route::post('/{municipe}/recrutamento/{recrutamento}/transferencia',
            [MunicipeController::class, 'storeTransferencia'])->name('transferencia.store');
    });

    // ── PROGENITORES ────────────────────────────────────────────────────────
    Route::prefix('progenitores')->name('progenitores.')->group(function () {
        Route::get('/',                [ProgenitoresController::class, 'index'])->name('index');
        Route::post('/',               [ProgenitoresController::class, 'store'])->name('store');
        Route::put('/{progenitor}',    [ProgenitoresController::class, 'update'])->name('update');
        Route::delete('/{progenitor}', [ProgenitoresController::class, 'destroy'])->name('destroy');
        Route::get('/search',          [ProgenitoresController::class, 'search'])->name('search');
    });
});

// =====================================================
// ROTAS EXCLUSIVAS DE ADMIN
// =====================================================
Route::middleware(['auth', 'senha_alterada', 'admin'])->group(function () {

    // Aprovação de transferências — apenas admins
    Route::post('/transferencias/{transferencia}/aprovar', [TransferenciaController::class, 'aprovar'])
        ->name('transferencias.aprovar');

    // Gestão de utilizadores — apenas admins
    Route::get('/utilizadores',          [UserController::class, 'index'])->name('users.index');
    Route::post('/utilizadores',         [UserController::class, 'store'])->name('users.store');
    Route::put('/utilizadores/{user}',   [UserController::class, 'update'])->name('users.update');
    Route::delete('/utilizadores/{user}',[UserController::class, 'destroy'])->name('users.destroy');
});

require __DIR__.'/settings.php';
