<?php

namespace App\Models;

use App\Support\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class School extends Model {
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'zip',
        'phone',
        'email',
        'website',
        'logo',
        'active',
    ];

    public function users(): BelongsToMany {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function administrators(): BelongsToMany {
        return $this->users()->wherePivot('role', RoleEnum::SCHOOL_ADMIN->value);
    }

    public function teachers(): BelongsToMany {
        return $this->users()->wherePivot('role', RoleEnum::TEACHER->value);
    }

    public function students(): BelongsToMany {
        return $this->users()->wherePivot('role', RoleEnum::STUDENT->value);
    }
}
