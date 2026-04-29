<?php

use App\Models\User;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PeriodoLectivoController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\DepartamentoController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\ProfessorController;
use App\Http\Controllers\SalaController;
use App\Http\Controllers\TempoAulaController;
use App\Http\Controllers\PortalHorarioController;
use App\Http\Controllers\TurmaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()) && User::count() === 0,
    ]);
})->name('home');


Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Rotas para gerenciamento de departamentos
Route::resource('departamentos', DepartamentoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/departamentos/{departamento}', [DepartamentoController::class, 'update'])->name('departamentos.update');

// Rotas para gerenciamento de cursos
Route::resource('cursos', CursoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/cursos/{curso}', [CursoController::class, 'update'])->name('cursos.update');

// Rotas para gerenciamento de Turmas
Route::resource('turmas', TurmaController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/turmas/{turma}', [TurmaController::class, 'update'])->name('turmas.update');


Route::prefix('horarios')->group(function () {
    Route::get('/', [HorarioController::class, 'index'])->name('horarios.index');
    Route::post('/gerar', [HorarioController::class, 'gerarAutomaticamente'])->name('horarios.gerar');
    Route::post('/turma/{turma}/gerar', [HorarioController::class, 'gerarPorTurma'])->name('horarios.gerar.turma');
    Route::get('/turma/{turma}/pdf', [HorarioController::class, 'exportarPdf'])->name('horarios.pdf');
});

Route::get('/horarios/print', [HorarioController::class, 'print'])->name('horarios.print');
Route::get('/horarios/exportar-pdf/{turma}', [HorarioController::class, 'exportarPdf'])->name('horarios.pdf');

// Rotas para gerenciamento de classes, incluindo impressão de relatórios
Route::resource('periodos_lectivos', PeriodoLectivoController::class)->except(['show', 'edit'])->middleware(['auth', 'verified']);
Route::post('/periodos_lectivos/{periodo}', [PeriodoLectivoController::class, 'update'])->name('periodos_lectivos.update');
Route::get('/periodos_lectivos/print', [PeriodoLectivoController::class, 'print'])
    ->name('periodos_lectivos.print');


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


// ROTAS PÚBLICAS (Fora do middleware auth)
Route::get('/portal', [PortalHorarioController::class, 'index'])->name('portal.index');
Route::post('/portal/consultar', [PortalHorarioController::class, 'consultar'])->name('portal.consultar');

// Rotas para alunos (Admin)
Route::prefix('alunos')->group(function () {
    Route::get('/', [PortalHorarioController::class, 'indexAdmin'])->name('alunos.index');
    Route::post('/adicionar', [PortalHorarioController::class, 'storeAluno'])->name('alunos.store');
    Route::post('/importar', [PortalHorarioController::class, 'importarAlunos'])->name('alunos.import');
    Route::put('/{aluno}', [PortalHorarioController::class, 'updateAluno'])->name('alunos.update');
    Route::delete('/{aluno}', [PortalHorarioController::class, 'destroyAluno'])->name('alunos.destroy');
});
require __DIR__.'/settings.php';
