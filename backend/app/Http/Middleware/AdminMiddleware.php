<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || Auth::user()->role_id !== 'admin') {
            return response()->json(['message' => 'Accès refusé. Seul un administrateur peut effectuer cette action.'], 403);
        }

        return $next($request);
    }
}
