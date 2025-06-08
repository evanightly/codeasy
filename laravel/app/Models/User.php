<?php

namespace App\Models;

use App\Support\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable {
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'profile_image',
        'preferences',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
        ];
    }

    public function schools(): BelongsToMany {
        return $this->belongsToMany(School::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function classrooms(): BelongsToMany {
        return $this->belongsToMany(ClassRoom::class, 'class_room_students', 'user_id', 'class_room_id')
            ->using(ClassRoomStudent::class)
            ->withTimestamps();
    }

    public function isSchoolAdmin(?School $school = null): bool {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($school) {
            return $this->schools()
                ->wherePivot('role', RoleEnum::SCHOOL_ADMIN->value)
                ->where('schools.id', $school->id)
                ->exists();
        }

        return $this->schools()
            ->wherePivot('role', RoleEnum::SCHOOL_ADMIN->value)
            ->exists();
    }

    public function isTeacherAt(School $school): bool {
        return $this->schools()
            ->wherePivot('role', RoleEnum::TEACHER->value)
            ->where('schools.id', $school->id)
            ->exists();
    }

    public function isStudentAt(School $school): bool {
        return $this->schools()
            ->wherePivot('role', RoleEnum::STUDENT->value)
            ->where('schools.id', $school->id)
            ->exists();
    }

    public function isSuperAdmin(): bool {
        return $this->hasRole(RoleEnum::SUPER_ADMIN->value);
    }

    public function administeredSchools(): BelongsToMany {
        return $this->schools()
            ->wherePivot('role', RoleEnum::SCHOOL_ADMIN->value);
    }

    public function teachedSchools(): BelongsToMany {
        return $this->schools()
            ->wherePivot('role', RoleEnum::TEACHER->value);
    }
}
