<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestCaseChangeTracker extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'test_case_id', 'learning_material_question_id', 'learning_material_id', 'course_id', 'change_type', 'previous_data', 'affected_student_ids', 'status', 'scheduled_at', 'completed_at', 'execution_details',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'previous_data' => 'array',
        'affected_student_ids' => 'array',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'execution_details' => 'array',
    ];

    /**
     * belongsTo relationship with LearningMaterialQuestionTestCase.
     */
    public function learning_material_question_test_case() {
        return $this->belongsTo(LearningMaterialQuestionTestCase::class);
    }

    /**
     * belongsTo relationship with LearningMaterialQuestion.
     */
    public function learning_material_question() {
        return $this->belongsTo(LearningMaterialQuestion::class);
    }

    /**
     * belongsTo relationship with LearningMaterial.
     */
    public function learning_material() {
        return $this->belongsTo(LearningMaterial::class);
    }

    /**
     * belongsTo relationship with Course.
     */
    public function course() {
        return $this->belongsTo(Course::class);
    }
}
