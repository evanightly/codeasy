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
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'compile_status' => 'boolean',
    ];

    /**
     * Get the student score that owns the execution result.
     */
    public function student_score() {
        return $this->belongsTo(StudentScore::class);
    }
}
