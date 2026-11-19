<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Municipe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()->with('municipe:id,data_nascimento,sexo')->latest();

        if ($search = $request->input('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->get(['id', 'name', 'email', 'role', 'id_municipe', 'created_at', 'updated_at']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roleOptions' => [
                'admin' => 'Administrador',
                'custom' => 'Utilizador',
                'municipe' => 'Municipe',
            ],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $municipe = null;

            if ($data['role'] === 'municipe') {
                $municipe = Municipe::create([
                    'nome_completo' => $data['name'],
                    'data_nascimento' => $data['data_nascimento'],
                    'sexo' => $data['sexo'],
                    'id_user' => auth()->id(),
                ]);
            }

            unset($data['data_nascimento'], $data['sexo']);

            User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt($data['password']),
                'role' => $data['role'],
                'id_municipe' => $municipe?->id,
                'must_change_password' => $data['role'] === 'municipe',
            ]);
        });

        return back()->with('success', 'Utilizador criado com sucesso!');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $user) {
            if ($data['role'] === 'municipe' && ! $user->id_municipe) {
                $municipe = Municipe::create([
                    'nome_completo' => $data['name'],
                    'data_nascimento' => $data['data_nascimento'],
                    'sexo' => $data['sexo'],
                    'id_user' => auth()->id(),
                ]);

                $data['id_municipe'] = $municipe->id;
                $data['must_change_password'] = true;
            }

            unset($data['data_nascimento'], $data['sexo']);

            if (! empty($data['password'])) {
                $data['password'] = bcrypt($data['password']);
            } else {
                unset($data['password']);
            }

            $user->update($data);

            if ($user->id_municipe) {
                $user->municipe()->update(['nome_completo' => $data['name']]);
            }
        });

        return back()->with('success', 'Utilizador atualizado com sucesso!');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Não podes eliminar o teu próprio utilizador.');
        }

        if ($user->role === 'admin' && User::where('role', 'admin')->count() <= 1) {
            return back()->with('error', 'Não é possível eliminar o último administrador do sistema.');
        }

        $user->delete();

        return back()->with('success', 'Utilizador eliminado com sucesso!');
    }
}
