<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\ClassRoom;

interface ClassRoomServiceInterface extends BaseCrudServiceInterface {
    /**
     * Assign a student to a classroom
     *
     * required data:
     * - user_id
     */
    public function assignStudent(ClassRoom $classRoom, array $validatedRequest): void;

    /**
     * Unassign a student from a classroom
     *
     * required data:
     * - user_id
     */
    public function unassignStudent(ClassRoom $classRoom, array $validatedRequest): void;
}
