<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCourseCognitiveClassificationHistory extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id', 'user_id', 'student_course_cognitive_classification_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'classification_score' => 'decimal',
        'raw_data' => 'array',
        'classified_at' => 'datetime',
    ];

    /**
     * belongsTo relationship with Course.
     */
    public function course() {
        return $this->belongsTo(Course::class);
    }

    /**
     * belongsTo relationship with User.
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * hasOne relationship with StudentCourseCognitiveClassification.
     */
    public function student_course_cognitive_classification() {
        return $this->hasOne(StudentCourseCognitiveClassification::class);
    }
}
