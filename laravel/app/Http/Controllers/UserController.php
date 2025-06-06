<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\Enums\IntentEnum;
use App\Support\Enums\PermissionEnum;
use App\Support\Interfaces\Services\UserServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;

class UserController extends Controller implements HasMiddleware {
    public function __construct(protected UserServiceInterface $userService) {}

    public static function middleware(): array {
        // Define permissions that should grant access to user listing
        $userReadPermissions = [
            PermissionEnum::USER_READ->value,
            PermissionEnum::CLASS_ROOM_STUDENT_CREATE->value,
            PermissionEnum::CLASS_ROOM_STUDENT_READ->value,
            PermissionEnum::CLASS_ROOM_STUDENT_UPDATE->value,
            PermissionEnum::SCHOOL_REQUEST_CREATE->value,
            PermissionEnum::SCHOOL_REQUEST_READ->value,
        ];

        return [
            self::createPermissionMiddleware([PermissionEnum::USER_CREATE->value], ['create', 'store']),
            self::createPermissionMiddleware([PermissionEnum::USER_UPDATE->value], ['edit', 'update']),
            self::createPermissionMiddleware($userReadPermissions, ['index', 'show']),
            self::createPermissionMiddleware([PermissionEnum::USER_DELETE->value], ['destroy']),
        ];
    }

    public function index(Request $request) {
        $intent = $request->get('intent');

        switch ($intent) {
            case IntentEnum::USER_INDEX_STUDENTS->value:
                $data = UserResource::collection($this->userService->getAllPaginated($request->query()));

                break;
            default:
                $data = UserResource::collection($this->userService->getAllPaginated($request->query()));
                break;
        }

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
        $intent = $request->get('intent');

        switch ($intent) {
            case IntentEnum::USER_UPDATE_PREFERENCES->value:
                $data = $this->userService->updatePreferences($user, $request->validated());
                break;
            default:
                $data = $this->userService->update($user, $request->validated());
                break;
        }

        if ($this->ajax()) {
            return $data;
        }
    }

    public function destroy(User $user) {
        if ($this->ajax()) {
            return $this->userService->delete($user);
        }
    }
}
