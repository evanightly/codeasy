<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\UserRepository;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\UserServiceInterface;
use Illuminate\Database\Eloquent\Model;

class UserService extends BaseCrudService implements UserServiceInterface {

    /** @var UserRepository $repository */
    protected $repository;

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

    protected function getRepositoryClass(): string {
        return UserRepositoryInterface::class;
    }
}
