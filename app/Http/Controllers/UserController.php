<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()->latest();

        if ($search = $request->input('search')) {
            $query->where(fn($q) => 
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            );
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->get(['id', 'name', 'email', 'role', 'created_at', 'updated_at']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roleOptions' => [
                'admin' => 'Administrador',
                'custom' => 'Utilizador',
            ],
        ]);
    }

public function store(StoreUserRequest $request)
{
    $data = $request->validated();
    $data['password'] = bcrypt($data['password']);

    User::create($data);

    return back()->with('success', 'Utilizador criado com sucesso!');
}

public function update(UpdateUserRequest $request, User $user)
{
    $data = $request->validated();

    if (!empty($data['password'])) {
        $data['password'] = bcrypt($data['password']);
    } else {
        unset($data['password']);
    }

    $user->update($data);

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
