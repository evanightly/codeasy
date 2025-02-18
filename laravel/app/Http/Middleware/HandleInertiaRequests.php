<?php

namespace App\Http\Middleware;

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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => array_merge(
                    optional($request->user())->toArray() ?? [],
                    ['image' => optional($request->user())->image ?? null],
                    ['role' => optional($request->user())->roles?->first()->name ?? null],
                    ['permissions' => optional($request->user())->getAllPermissions()?->pluck('name')->toArray() ?? []],
                ),
            ],
        ];
    }
}
