<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\SchoolRequest;

interface SchoolRequestServiceInterface extends BaseCrudServiceInterface {
    /**
     * Approve a teacher school request
     */
    public function approveTeacherRequest(SchoolRequest $schoolRequest): void;

    /**
     * Reject a teacher school request
     */
    public function rejectTeacherRequest(SchoolRequest $schoolRequest): void;

    /**
     * Approve a student school request
     */
    public function approveStudentRequest(SchoolRequest $schoolRequest): void;

    /**
     * Reject a student school request
     */
    public function rejectStudentRequest(SchoolRequest $schoolRequest): void;
}
