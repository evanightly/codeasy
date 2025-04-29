<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class StudentCognitiveClassification extends Model
{
    use HasFactory;


    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', 'course_id', 'classification_type', 'classification_level', 'classification_score', 'raw_data', 'classified_at'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // TODO: possibly cause issues with the database
        // 'classification_score' => 'decimal',
        'raw_data' => 'array',
        'classified_at' => 'datetime',
    ];

    /**
     * belongsTo relationship with User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * belongsTo relationship with Course.
     */
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
