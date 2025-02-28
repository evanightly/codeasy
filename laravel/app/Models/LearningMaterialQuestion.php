<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialType;
use Illuminate\Database\Eloquent\Model;

class LearningMaterialQuestion extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['learning_material_id', 'title', 'description', 'file', 'type', 'order_number', 'clue', 'active'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'type' => LearningMaterialType::class,
        'active' => 'boolean',
    ];

    /**
     * Get the learning material that owns the question.
     */
    public function learningMaterial() {
        return $this->belongsTo(LearningMaterial::class);
    }
}
