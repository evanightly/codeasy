<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterial extends Model {
    protected $fillable = [
        'course_id',
        'title',
        'description',
        'file',
        'file_extension',
        'type',
        'order_number',
        'active',
    ];
    protected $casts = [
        'type' => LearningMaterialTypeEnum::class,
        'active' => 'boolean',
    ];

    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }
}
