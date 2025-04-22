<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['class_room_id', 'teacher_id', 'name', 'description', 'active'];

    public function classroom(): BelongsTo {
        return $this->belongsTo(ClassRoom::class, 'class_room_id');
    }

    public function teacher(): BelongsTo {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function learning_materials(): HasMany {
        return $this->hasMany(LearningMaterial::class);
    }
}
