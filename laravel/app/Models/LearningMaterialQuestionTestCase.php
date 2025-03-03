<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningMaterialQuestionTestCase extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['learning_material_question_id', 'input', 'expected_output', 'description', 'order_number', 'hidden', 'active'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'hidden' => 'boolean',
        'active' => 'boolean',
    ];

    /**
     * Get the question that owns the test case.
     */
    public function question() {
        return $this->belongsTo(LearningMaterialQuestion::class);
    }
}
