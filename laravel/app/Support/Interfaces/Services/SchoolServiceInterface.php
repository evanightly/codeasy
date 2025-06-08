<?php

namespace App\Support\Interfaces\Services;

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

    /**
     * Assign multiple users as students in bulk
     *
     * request needed:
     * - user_ids (array)
     */
    public function assignBulkStudents(School $school, array $validatedRequest): void;

    /**
     * Unassign multiple users as students in bulk
     *
     * request needed:
     * - user_ids (array)
     */
    public function unassignBulkStudents(School $school, array $validatedRequest): void;
}
