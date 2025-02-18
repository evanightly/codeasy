<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Support\Interfaces\Repositories\PermissionRepositoryInterface;
use App\Support\Interfaces\Services\PermissionServiceInterface;

class PermissionService extends BaseCrudService implements PermissionServiceInterface {
    protected function getRepositoryClass(): string {
        return PermissionRepositoryInterface::class;
    }
}
