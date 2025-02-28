<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialType;
use Illuminate\Database\Eloquent\Model;

class LearningMaterial extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['course_id', 'title', 'description', 'file', 'type', 'order_number', 'active'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'type' => LearningMaterialType::class,
        'active' => 'boolean',
    ];

    public function course() {
        return $this->belongsTo(Course::class);
    }
}
