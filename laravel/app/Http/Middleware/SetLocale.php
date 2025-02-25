<?php

namespace App\Http\Middleware;

use App;
use Closure;
use Illuminate\Http\Request;

class SetLocale {
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next) {
        $locale = $request->header('Accept-Language');

        if (in_array($locale, ['en', 'id', 'de'])) {
            App::setLocale($locale);
        }

        return $next($request);
    }
}
