<?php

namespace App\Support\Interfaces\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\Contracts\BaseCrudServiceInterface;
use App\Models\SchoolRequest;

interface SchoolRequestServiceInterface extends BaseCrudServiceInterface {
    /**
     * Approve a school request
     */
    public function approveTeacherRequest(SchoolRequest $schoolRequest): void;

    /**
     * Reject a school request
     */
    public function rejectTeacherRequest(SchoolRequest $schoolRequest): void;
}
