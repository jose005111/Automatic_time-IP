<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password', [
            'mustChangePassword' => (bool) request()->user()?->must_change_password,
        ]);
    }

    /**
     * Update the user's password.
     * Se o utilizador estava a fazer a troca obrigatória, limpa a flag
     * e redireciona para o destino correcto conforme o role.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $mustChange = (bool) $user->must_change_password;

        $user->update([
            'password'             => $request->password,
            'must_change_password' => false,
        ]);

        if ($mustChange) {
            $destination = $user->role === 'municipe'
                ? route('municipe.painel')
                : route('dashboard');

            return redirect($destination)
                ->with('success', 'Senha alterada com sucesso! Bem-vindo ao SISTEMA INFORMÁTICO DE GESTÃO DE MUNÍCIPES - DMRMAB.');
        }

        return back()->with('success', 'Senha actualizada com sucesso!');
    }
}
