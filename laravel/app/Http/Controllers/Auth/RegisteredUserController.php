<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SchoolRequest;
use App\Models\User;
use App\Support\Enums\RoleEnum;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller {
    /**
     * Display the registration view.
     */
    public function create(): Response {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse {
        $validationRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => [
                'nullable',
                'string',
                Rule::in(RoleEnum::toArray()),
            ],
        ];

        // Add school_id validation if role is Teacher or Student
        if ($request->input('role') === RoleEnum::TEACHER->value || $request->input('role') === RoleEnum::STUDENT->value) {
            $validationRules['school_id'] = 'required|exists:schools,id';
        }

        $validated = $request->validate($validationRules);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign role if provided
        if (!empty($validated['role'])) {
            $user->assignRole($validated['role']);

            // Handle teacher or student role with school request
            if (in_array($validated['role'], [RoleEnum::TEACHER->value, RoleEnum::STUDENT->value]) && isset($validated['school_id'])) {
                SchoolRequest::create([
                    'user_id' => $user->id,
                    'school_id' => $validated['school_id'],
                    'status' => 'pending', // Default status
                    'message' => $validated['role'] === RoleEnum::STUDENT->value
                        ? 'Student registration request'
                        : ($validated['message'] ?? 'Teacher registration request'),
                ]);
            }
        }

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard.index', absolute: false));
    }
}
