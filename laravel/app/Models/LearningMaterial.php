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
    protected $appends = [
        'file_url',
        'full_file_url', // appended attribute for full PDF URL
    ];

    public function getFileUrlAttribute() {
        if (empty($this->file) || empty($this->file_extension)) {
            return null;
        }

        return asset('storage/learning-materials/' . $this->file);
    }

    // Add accessor for full PDF version URL
    public function getFullFileUrlAttribute() {
        if (empty($this->file) || empty($this->file_extension)) {
            return null;
        }
        $baseName = pathinfo($this->file, PATHINFO_FILENAME);
        $fullName = $baseName . '_full.' . $this->file_extension;

        return asset('storage/learning-materials/' . $fullName);
    }

    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }

    public function learning_material_questions() {
        return $this->hasMany(LearningMaterialQuestion::class)
            ->orderBy('order_number');
    }

    public function student_scores() {
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
