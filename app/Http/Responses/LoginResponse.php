<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->role === 'municipe') {
            return redirect()->route('municipe.painel');
        }
// dd($user->role);
        return redirect()->intended(route('dashboard', absolute: false));
    }
}
