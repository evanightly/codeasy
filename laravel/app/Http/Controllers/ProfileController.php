<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller {
    /**
     * The base directory for user profile images
     */
    protected $baseDirectory = 'user-profile-images';

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse|RedirectResponse {
        $user = $request->user();
        $validated = $request->validated();

        // Handle profile image upload if present
        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($user->profile_image) {
                Storage::disk('public')->delete($this->baseDirectory . '/' . $user->profile_image);
            }

            // Store the file and get only the filename
            $extension = $request->file('profile_image')->getClientOriginalExtension();
            $fileName = uniqid() . '.' . $extension;
            $request->file('profile_image')->storeAs($this->baseDirectory, $fileName, 'public');

            // Save only the filename in the database
            $validated['profile_image'] = $fileName;
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => new UserResource($user),
            ]);
        }

        return Redirect::route('profile.edit');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): JsonResponse|RedirectResponse {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Password updated successfully']);
        }

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Delete profile image if exists
        if ($user->profile_image) {
            Storage::disk('public')->delete($this->baseDirectory . '/' . $user->profile_image);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
