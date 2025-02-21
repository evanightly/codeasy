<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Repositories\UserRepository;
use App\Support\Interfaces\Repositories\UserRepositoryInterface;
use App\Support\Interfaces\Services\UserServiceInterface;

class UserService extends BaseCrudService implements UserServiceInterface {

    /** @var UserRepository $repository */
    protected $repository;

    protected function getRepositoryClass(): string {
        return UserRepositoryInterface::class;
    }
}
