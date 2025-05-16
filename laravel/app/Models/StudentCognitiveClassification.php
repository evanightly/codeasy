<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentCognitiveClassification extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', 'course_id', 'learning_material_id', 'classification_type',
        'classification_level', 'classification_score', 'raw_data',
        'classified_at', 'is_course_level',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'classification_score' => 'float',
        'raw_data' => 'array',
        'classified_at' => 'datetime',
        'is_course_level' => 'boolean',
    ];

    /**
     * belongsTo relationship with User.
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * belongsTo relationship with Course.
     */
    public function course() {
        return $this->belongsTo(Course::class);
    }

    /**
     * belongsTo relationship with LearningMaterial.
     */
    public function learning_material() {
        return $this->belongsTo(LearningMaterial::class);
    }

    /**
     * Get recommendations for improving cognitive level
     */
    public function getRecommendationsAttribute(): array {
        if (!isset($this->raw_data['recommendations'])) {
            return [];
        }

        return $this->raw_data['recommendations'];
    }
}
