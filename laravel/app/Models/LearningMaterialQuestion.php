<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningMaterialQuestion extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'learning_material_id',
        'title',
        'description',
        'file',
        'file_extension',
        'type',
        'order_number',
        'clue',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'type' => LearningMaterialTypeEnum::class,
    ];

    protected $appends = [
        'file_url',
    ];

    /**
     * Get the file URL for the question.
     */
    public function getFileUrlAttribute(): ?string {
        if (empty($this->file) || empty($this->file_extension)) {
            return null;
        }

        return asset('storage/learning-material-questions/' . $this->file);
    }

    /**
     * Get the learning material that owns the question.
     */
    public function learning_material(): BelongsTo {
        return $this->belongsTo(LearningMaterial::class);
    }

    /**
     * Get the test cases for the question.
     */
    public function learning_material_question_test_cases(): HasMany {
        return $this->hasMany(LearningMaterialQuestionTestCase::class);
    }

    /**
     * Get the public test cases for the question (not hidden).
     */
    public function public_learning_material_question_test_cases(): HasMany {
        return $this->hasMany(LearningMaterialQuestionTestCase::class)
            ->where('hidden', false)
            ->where('active', true);
    }

    /**
     * Get all student scores for this question.
     */
    public function student_scores(): HasMany {
        return $this->hasMany(StudentScore::class);
    }
}
