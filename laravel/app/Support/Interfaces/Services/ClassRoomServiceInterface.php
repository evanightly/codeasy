<?php

namespace App\Support\Interfaces\Services;

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

    /**
     * Assign multiple students to a classroom
     *
     * required data:
     * - user_ids (array)
     */
    public function assignBulkStudents(ClassRoom $classRoom, array $validatedRequest): void;

    /**
     * Unassign multiple students from a classroom
     *
     * required data:
     * - user_ids (array)
     */
    public function unassignBulkStudents(ClassRoom $classRoom, array $validatedRequest): void;
}
