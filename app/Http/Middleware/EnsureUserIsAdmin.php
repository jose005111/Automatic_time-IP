<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Garante que apenas utilizadores com role 'admin' acedem à rota.
     * Devolve 403 para pedidos normais e JSON para pedidos AJAX/Inertia.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return response()->json(['message' => 'Acesso negado. Apenas administradores.'], 403);
            }
            abort(403, 'Acesso negado. Apenas administradores podem aceder a esta área.');
        }

        return $next($request);
    }
}
