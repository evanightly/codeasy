<?php

namespace App\Services;

use App\Models\ClassRoom;
use App\Models\School;
use App\Models\User;
use App\Support\Interfaces\Repositories\ClassRoomRepositoryInterface;
use App\Support\Interfaces\Services\ClassRoomServiceInterface;
use App\Support\Interfaces\Services\ClassRoomStudentServiceInterface;
use App\Traits\Services\HandlesPageSizeAll;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class ClassRoomService extends BaseCrudService implements ClassRoomServiceInterface {
    use HandlesPageSizeAll;

    public function __construct(protected ClassRoomStudentServiceInterface $classRoomStudentService) {
        parent::__construct();
    }

    public function getAllPaginated(array $search = [], int $pageSize = 15): LengthAwarePaginator {
        /**
         * @var User $user
         */
        $user = Auth::user();
        // Filter classrooms based on user's schools if not super admin
        if (!$user->isSuperAdmin()) {
            $schoolIds = $user->schools()->pluck('schools.id');
            $search['school_id'] = $schoolIds->toArray();
        }

        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    public function create(array $data): ?Model {
        /**
         * @var User $user
         */
        $user = Auth::user();
        $school = School::findOrFail($data['school_id']);

        // Check if user is authorized to manage classrooms in this school
        if (!$user->isTeacherAt($school) && !$user->isSchoolAdmin($school)) {
            throw new \Exception(__('exceptions.services.classroom.unauthorized', ['action' => 'create']));
        }

        $classroom = parent::create($data);

        if (isset($data['student_ids'])) {
            $classroom->students()->sync($data['student_ids']);
        }

        return $classroom;
    }

    public function update($keyOrModel, array $data): ?Model {
        /**
         * @var User $user
         */
        $user = Auth::user();
        $classroom = $keyOrModel instanceof ClassRoom ? $keyOrModel : $this->findOrFail($keyOrModel);

        // Check if user is authorized to manage this classroom
        if (!$user->isTeacherAt($classroom->school) && !$user->isSchoolAdmin($classroom->school)) {
            throw new \Exception(__('exceptions.services.classroom.unauthorized', ['action' => 'update']));
        }

        if (isset($data['student_ids'])) {
            $classroom->students()->sync($data['student_ids']);
        }

        return parent::update($classroom, $data);
    }

    public function delete($keyOrModel): bool {
        /**
         * @var User $user
         */
        $user = Auth::user();
        $classroom = $keyOrModel instanceof ClassRoom ? $keyOrModel : $this->findOrFail($keyOrModel);

        // Check if user is authorized to manage this classroom
        if (!$user->isTeacherAt($classroom->school) && !$user->isSchoolAdmin($classroom->school)) {
            throw new \Exception(__('exceptions.services.classroom.unauthorized', ['action' => 'delete']));
        }

        return parent::delete($classroom);
    }

    public function assignStudent(ClassRoom $classroom, array $validatedRequest): void {
        // Check if student is already assigned
        if ($classroom->students()->where('user_id', $validatedRequest['user_id'])->exists()) {
            throw new \InvalidArgumentException(__('exceptions.services.classroom.student.already_assigned'));
        }

        $classroom->students()->attach($validatedRequest['user_id']);
    }

    public function unassignStudent(ClassRoom $classroom, array $validatedRequest): void {
        $classroom->students()->detach($validatedRequest['user_id']);
    }

    public function assignBulkStudents(ClassRoom $classroom, array $validatedRequest): void {
        $userIds = $validatedRequest['user_ids'];

        // Get already assigned student IDs to avoid duplicates
        $existingStudentIds = $classroom->students()->pluck('user_id')->toArray();

        // Filter out already assigned students
        $newStudentIds = array_diff($userIds, $existingStudentIds);

        if (empty($newStudentIds)) {
            throw new \InvalidArgumentException(__('exceptions.services.classroom.student.all_already_assigned'));
        }

        // Attach new students
        $classroom->students()->attach($newStudentIds);
    }

    public function unassignBulkStudents(ClassRoom $classroom, array $validatedRequest): void {
        $userIds = $validatedRequest['user_ids'];

        // Remove students from classroom
        $classroom->students()->detach($userIds);
    }

    protected function getRepositoryClass(): string {
        return ClassRoomRepositoryInterface::class;
    }
}
