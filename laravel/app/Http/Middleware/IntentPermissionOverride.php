<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class IntentPermissionOverride {
    /**
     * Handle an incoming request.
     *
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $permissions, ?string $allowedIntents = null, string $type = 'permission') {
        $intent = $request->get('intent');

        // Check if the intent is in the allowed intents list
        if ($allowedIntents) {
            $allowedIntentsArray = explode(',', $allowedIntents);
            if (in_array($intent, $allowedIntentsArray, true)) {
                return $next($request);
            }
        }

        // Default permission check
        $permissionsArray = explode('|', $permissions);
        foreach ($permissionsArray as $permission) {
            if (Gate::allows($permission)) {
                return $next($request);
            }
        }

        // If no permissions are allowed, deny access
        abort(403, 'Unauthorized action.');
    }
}
