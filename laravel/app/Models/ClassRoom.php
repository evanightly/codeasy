<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassRoom extends Model {
    protected $fillable = [
        'school_id',
        'grade',
        'year',
        'active',
        'name', // Adding name field for better identification
        'description', // Optional description
    ];
    protected $casts = [
        'active' => 'boolean',
        'year' => 'integer',
        'grade' => 'integer',
    ];

    public function school(): BelongsTo {
        return $this->belongsTo(School::class);
    }

    public function students(): BelongsToMany {
        return $this->belongsToMany(User::class, 'class_room_students', 'class_room_id', 'user_id')
            ->using(ClassRoomStudent::class)
            ->withTimestamps();
    }

    public function courses(): HasMany {
        return $this->hasMany(Course::class);
    }
}
