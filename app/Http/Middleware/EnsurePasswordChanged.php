<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Se o utilizador ainda não trocou a senha padrão, redireciona para a
     * página de alteração de password. Exclui as próprias rotas de settings
     * para evitar loop de redirecionamento.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Permite acesso às rotas de settings, logout e API Fortify
            $allowedRoutes = [
                'user-password.edit',
                'user-password.update',
                'logout',
                'profile.edit',
                'appearance.edit',
            ];

            $allowedPrefixes = ['settings/', 'logout', 'two-factor'];

            $currentPath = $request->path();
            $routeName   = $request->route()?->getName() ?? '';

            $isAllowed = in_array($routeName, $allowedRoutes)
                || collect($allowedPrefixes)->contains(fn($p) => str_starts_with($currentPath, $p));

            if (! $isAllowed) {
                if ($request->header('X-Inertia')) {
                    return redirect()->route('user-password.edit')
                        ->with('warning', 'Por razões de segurança, deve alterar a sua senha antes de continuar.');
                }
                return redirect()->route('user-password.edit')
                    ->with('warning', 'Por razões de segurança, deve alterar a sua senha antes de continuar.');
            }
        }

        return $next($request);
    }
}
