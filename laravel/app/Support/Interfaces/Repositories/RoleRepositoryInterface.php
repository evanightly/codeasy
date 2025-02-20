<?php

namespace App\Support\Interfaces\Repositories;

use Illuminate\Database\Eloquent\Model;

interface RoleRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Force update the model
     */
    public function forceUpdate(mixed $keyOrModel, array $data): ?Model;
}
