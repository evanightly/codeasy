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

    public function isPending(): bool {
        return $this->status === SchoolRequestStatusEnum::PENDING;
    }

    public function isApproved(): bool {
        return $this->status === SchoolRequestStatusEnum::APPROVED;
    }

    public function approve(): void {
        $this->update(['status' => SchoolRequestStatusEnum::APPROVED]);
    }

    public function reject(): void {
        $this->update(['status' => SchoolRequestStatusEnum::REJECTED]);
    }

    public function scopeForAdministrator($query, User $user) {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        return $query->whereIn('school_id', $user->administeredSchools()->pluck('schools.id'));
    }
}
