<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Support\Interfaces\Repositories\RoleRepositoryInterface;
use App\Support\Interfaces\Services\RoleServiceInterface;

class RoleService extends BaseCrudService implements RoleServiceInterface {
    protected function getRepositoryClass(): string {
        return RoleRepositoryInterface::class;
    }
}
