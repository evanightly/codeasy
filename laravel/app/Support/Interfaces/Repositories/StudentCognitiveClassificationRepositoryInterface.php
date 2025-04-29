<?php

namespace App\Support\Interfaces\Repositories;

use Adobrovolsky97\LaravelRepositoryServicePattern\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;

interface StudentCognitiveClassificationRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Get all classifications with specified relations
     */
    public function getAllWithRelationsQuery(array $relations = []): Builder;
}
