<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningMaterialQuestion extends Model {
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'learning_material_id',
        'title',
        'description',
        'file',
        'file_extension',
        'type',
        'order_number',
        'clue',
        'active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean',
        'type' => LearningMaterialTypeEnum::class,
    ];

    /**
     * Get the learning material that owns the question.
     */
    public function learningMaterial(): BelongsTo {
        return $this->belongsTo(LearningMaterial::class);
    }

    /**
     * Get the test cases for the question.
     */
    public function testCases(): HasMany {
        return $this->hasMany(LearningMaterialQuestionTestCase::class);
    }
}
