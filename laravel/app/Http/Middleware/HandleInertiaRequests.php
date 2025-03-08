<?php

namespace App\Http\Middleware;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware {
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array {
        $user = $request->user();

        return [
            ...parent::share($request),
            'env' => [
                'appName' => config('app.name'),
                'appEnv' => config('app.env'),
                // 'appUrl' => config('app.url'),
                // 'appLocale' => config('app.locale'),
                // 'appDebug' => config('app.debug'),
                // 'csrfToken' => csrf_token(),
                // 'inertia' => array_merge(
                //     parent::share($request)['page'],
                //     ['resolveComponent' => $request->route()->getAction('component')],
                // ),
            ],
            'auth' => [
                'user' => array_merge(
                    $request->user() ? UserResource::make($request->user())->toArray($request) : [],
                    [
                        'roles' => optional($user)->roles?->pluck('name')->toArray() ?? [],
                        'permissions' => optional($user)->getAllPermissions()?->pluck('name')->toArray() ?? [],
                        'administeredSchools' => optional($user)?->administeredSchools()?->pluck('schools.id')->toArray() ?? [],
                        'teachedSchools' => optional($user)?->teachedSchools()?->pluck('schools.id')->toArray() ?? [],
                    ],
                ),
            ],
        ];
    }
}
