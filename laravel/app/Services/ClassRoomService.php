<?php

namespace App\Services;

use Adobrovolsky97\LaravelRepositoryServicePattern\Services\BaseCrudService;
use App\Models\ClassRoom;
use App\Models\School;
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
        // Filter classrooms based on user's schools if not super admin
        if (!Auth::user()->isSuperAdmin()) {
            $schoolIds = Auth::user()->schools()->pluck('schools.id');
            $search['school_id'] = $schoolIds->toArray();
        }

        $this->handlePageSizeAll();

        return parent::getAllPaginated($search, $pageSize);
    }

    public function create(array $data): ?Model {
        $school = School::findOrFail($data['school_id']);

        // Check if user is authorized to manage classrooms in this school
        if (!Auth::user()->isTeacherAt($school) && !Auth::user()->isSchoolAdmin($school)) {
            throw new \Exception('Unauthorized to create classrooms in this school');
        }

        $classroom = parent::create($data);

        if (isset($data['student_ids'])) {
            $classroom->students()->sync($data['student_ids']);
        }

        return $classroom;
    }

    public function update($keyOrModel, array $data): ?Model {
        $classroom = $keyOrModel instanceof ClassRoom ? $keyOrModel : $this->findOrFail($keyOrModel);

        // Check if user is authorized to manage this classroom
        if (!Auth::user()->isTeacherAt($classroom->school) && !Auth::user()->isSchoolAdmin($classroom->school)) {
            throw new \Exception('Unauthorized to update this classroom');
        }

        if (isset($data['student_ids'])) {
            $classroom->students()->sync($data['student_ids']);
        }

        return parent::update($classroom, $data);
    }

    public function delete($keyOrModel): bool {
        $classroom = $keyOrModel instanceof ClassRoom ? $keyOrModel : $this->findOrFail($keyOrModel);

        // Check if user is authorized to manage this classroom
        if (!Auth::user()->isTeacherAt($classroom->school) && !Auth::user()->isSchoolAdmin($classroom->school)) {
            throw new \Exception('Unauthorized to delete this classroom');
        }

        return parent::delete($classroom);
    }

    public function assignStudent(ClassRoom $classroom, array $validatedRequest): void {
        dump($validatedRequest);
        $classroom->students()->attach($validatedRequest['user_id']);
    }

    public function unassignStudent(ClassRoom $classroom, array $validatedRequest): void {
        dump($validatedRequest);
        $classroom->students()->detach($validatedRequest['user_id']);
    }

    protected function getRepositoryClass(): string {
        return ClassRoomRepositoryInterface::class;
    }
}
