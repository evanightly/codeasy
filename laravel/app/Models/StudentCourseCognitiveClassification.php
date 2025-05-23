<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCourseCognitiveClassification extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_id', 'user_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'classification_score' => 'decimal:2',
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
}
