<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\School;
use App\Models\User;

interface SchoolServiceInterface extends BaseCrudServiceInterface {
    /**
     * Assign a user as a school admin
     *
     * request needed:
     * - user_id
     */
    public function assignSchoolAdmin(School $school, array $validatedRequest): void;
}
