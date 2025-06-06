<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class UserService extends BaseCrudService implements UserServiceInterface {
    use HandlesPageSizeAll;

    /** @var UserRepository */
    protected $repository;

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    public function create(array $data): ?Model {
        $user = parent::create($data);

        if (isset($data['role_ids'])) {
            $user->syncRoles($data['role_ids']);
        }

        return $user;
    }

    public function update($keyOrModel, array $data): ?Model {
        if (isset($data['role_ids'])) {
            $keyOrModel->syncRoles($data['role_ids']);
        }

        return parent::update($keyOrModel, $data);
    }

    public function updatePreferences($keyOrModel, array $preferences): ?Model {
        // Get the user model if an ID was passed
        $user = is_numeric($keyOrModel) ? $this->findOrFail($keyOrModel) : $keyOrModel;

        // Merge new preferences with existing ones
        $existingPreferences = $user->preferences ?? [];
        $newPreferences = array_merge($existingPreferences, $preferences);

        return parent::update($user, ['preferences' => $newPreferences]);
    }

    protected function getRepositoryClass(): string {
        return UserRepositoryInterface::class;
    }
}
