<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExecutionResult extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'student_score_id',
        'code',
        'compile_status',
        'output_image',
        'variable_count',
        'function_count',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'compile_status' => 'boolean',
        'variable_count' => 'integer',
        'function_count' => 'integer',
    ];

    /**
     * Get the student score that owns the execution result.
     */
    public function student_score() {
        return $this->belongsTo(StudentScore::class);
    }
}
