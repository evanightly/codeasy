<?php

namespace App\Models;

use App\Support\Enums\SchoolRequestStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolRequest extends Model {
    protected $fillable = [
        'user_id',
        'school_id',
        'status',
        'message',
    ];

    protected $casts = [
        'status' => SchoolRequestStatusEnum::class,
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo {
        return $this->belongsTo(School::class);
    }
}
