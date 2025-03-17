<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterial extends Model {
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'file',
        'file_extension',
        'type',
        'order_number',
        'active',
    ];
    protected $casts = [
        'type' => LearningMaterialTypeEnum::class,
        'active' => 'boolean',
    ];

    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }

    public function questions() {
        return $this->hasMany(LearningMaterialQuestion::class)
            ->orderBy('order_number');
    }

    public function studentScores() {
        return $this->hasManyThrough(
            StudentScore::class,
            LearningMaterialQuestion::class,
            'learning_material_id', // Foreign key on LearningMaterialQuestion
            'learning_material_question_id', // Foreign key on StudentScore
            'id', // Local key on LearningMaterial
            'id' // Local key on LearningMaterialQuestion
        );
    }
}
