<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentScore extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'learning_material_question_id',
        'coding_time',
        'score',
        'completion_status',
        'trial_status',
        'compile_count', // Added compile_count here
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'completion_status' => 'boolean',
        'trial_status' => 'boolean',
        'compile_count' => 'integer',
    ];

    /**
     * Get the user that owns the score.
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the question that owns the score.
     */
    public function question() {
        return $this->belongsTo(LearningMaterialQuestion::class, 'learning_material_question_id');
    }

    /**
     * Get the execution results for this student score.
     */
    public function executionResults() {
        return $this->hasMany(ExecutionResult::class);
    }
}
