<?php

namespace App\Support\Interfaces\Repositories;

interface UserRepositoryInterface extends BaseRepositoryInterface {
    /**
     * Find students enrolled in a specific course
     */
    public function findStudentsByCourse(int $courseId);
}
