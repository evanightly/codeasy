<?php

namespace App\Models;

use App\Support\Enums\FileTypeEnum;
use App\Support\Enums\LearningMaterialType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterial extends Model {
    protected $fillable = [
        'course_id',
        'title',
        'description',
        'file',
        'file_type',
        'type',
        'order_number',
        'active',
    ];
    protected $casts = [
        'file_type' => FileTypeEnum::class,
        'type' => LearningMaterialType::class,
        'active' => 'boolean',
    ];

    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }
}
