<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\UserServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller {
    public function __construct(protected UserServiceInterface $userService) {}

    public static function middleware(): array {
        return [
            new Middleware('permission:' . PermissionEnum::USER_CREATE->value, only: ['create', 'store']),
            new Middleware('permission:' . PermissionEnum::USER_UPDATE->value, only: ['edit', 'update']),
            new Middleware('permission:' . PermissionEnum::USER_READ->value, only: ['index', 'show']),
            new Middleware('permission:' . PermissionEnum::USER_DELETE->value, only: ['destroy']),
        ];
    }

    public function index(Request $request) {
        $perPage = $request->get('perPage', 10);
        $data = UserResource::collection($this->userService->getAllPaginated($request->query(), $perPage));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('User/Index');
    }

    public function create() {
        return inertia('User/Create');
    }

    public function store(StoreUserRequest $request) {
        if ($this->ajax()) {
            return $this->userService->create($request->validated());
        }
    }

    public function show(User $user) {
        $data = UserResource::make($user->load('roles'));

        if ($this->ajax()) {
            return $data;
        }

        return inertia('User/Show', compact('data'));
    }

    public function edit(User $user) {
        $data = UserResource::make($user->load('roles'));

        return inertia('User/Edit', compact('data'));
    }

    public function update(UpdateUserRequest $request, User $user) {
        if ($this->ajax()) {
            return $this->userService->update($user, $request->validated());
        }
    }

    public function destroy(User $user) {
        if ($this->ajax()) {
            return $this->userService->delete($user);
        }
    }
}
