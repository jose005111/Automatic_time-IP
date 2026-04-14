<?php

use App\Http\Controllers\AnoController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\SalaController;
use App\Http\Controllers\TurmaController;
use App\Http\Controllers\TempoAulaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Rotas para gerenciamento de departamentos
Route::resource('departamentos', DepartamentoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/departamentos/{departamento}', [DepartamentoController::class, 'update'])->name('departamentos.update');

// Rotas para gerenciamento de cursos
Route::resource('cursos', CursoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/cursos/{curso}', [CursoController::class, 'update'])->name('cursos.update');

// Rotas para gerenciamento de Turmas
Route::resource('turmas', TurmaController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/turmas/{turma}', [TurmaController::class, 'update'])->name('turmas.update');


// Rotas para gerenciamento de classes, incluindo impressão de relatórios
Route::resource('anos', AnoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/anos/{classe}', [AnoController::class, 'update'])->name('anos.update');
Route::get('/anos/print', [AnoController::class, 'print'])
    ->name('anos.print');


// Rotas para gerenciamento de salas, incluindo impressão de relatórios
Route::resource('salas', SalaController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/salas/{sala}', [SalaController::class, 'update'])->name('salas.update');
Route::get('/salas/print', [SalaController::class, 'print'])
    ->name('salas.print');

// Rotas para gerenciamento de tempos_aula, incluindo impressão de relatórios
Route::resource('tempos_aula', TempoAulaController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/tempos_aula/{tempo_aula}', [TempoAulaController::class, 'update'])->name('tempos_aula.update');
Route::get('/tempos_aula/print', [TempoAulaController::class, 'print'])
    ->name('tempos_aula.print');


// Rotas para gerenciamento de disciplinas, incluindo impressão de relatórios
Route::resource('disciplinas', DisciplinaController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/disciplinas/{disciplina}', [DisciplinaController::class, 'update'])->name('disciplinas.update');
Route::get('/disciplinas/print', [DisciplinaController::class, 'print'])
    ->name('disciplinas.print');

// Rotas para gerenciamento de professores
Route::resource('professores', ProfessorController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);

Route::put('/professores/{professor}/disciplinas', [ProfessorController::class, 'syncDisciplinas'])
    ->name('professores.disciplinas.sync');

require __DIR__.'/settings.php';
