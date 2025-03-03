<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterialQuestionTestCase extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'learning_material_question_id',
        'input',
        'expected_output_file',
        'expected_output_file_extension',
        'description',
        'hidden',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'hidden' => 'boolean',
        'active' => 'boolean',
    ];

    /**
     * Get the question that owns the test case.
     */
    public function question(): BelongsTo {
        return $this->belongsTo(LearningMaterialQuestion::class, 'learning_material_question_id');
    }
}
