<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Support\Interfaces\Repositories\PermissionRepositoryInterface;
use App\Support\Interfaces\Services\PermissionServiceInterface;
use Illuminate\Database\Eloquent\Model;

class PermissionService extends BaseCrudService implements PermissionServiceInterface {
    public function delete($keyOrModel): bool {
        if ($keyOrModel->canBeDeleted()) {
            parent::delete($keyOrModel);

            return true;
        }

        return false;
    }

    protected function getRepositoryClass(): string {
        return PermissionRepositoryInterface::class;
    }
}
