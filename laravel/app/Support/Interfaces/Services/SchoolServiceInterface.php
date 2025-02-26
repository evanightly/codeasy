<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\School;

interface SchoolServiceInterface extends BaseCrudServiceInterface {
    /**
     * Assign a user as a school admin
     *
     * request needed:
     * - user_id
     */
    public function assignSchoolAdmin(School $school, array $validatedRequest): void;

    /**
     * Unassign a user as a school admin
     *
     * request needed:
     * - user_id
     */
    public function unassignSchoolAdmin(School $school, array $validatedRequest): void;

    /**
     * Assign a user as a student
     *
     * request needed:
     * - user_id
     */
    public function assignStudent(School $school, array $validatedRequest): void;

    /**
     * Unassign a user as a student
     *
     * request needed:
     * - user_id
     */
    public function unassignStudent(School $school, array $validatedRequest): void;
}
