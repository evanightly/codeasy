<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ClassRoomStudent extends Pivot {
    protected $table = 'class_room_students';
    protected $fillable = [
        'class_room_id',
        'user_id',
    ];

    public function classroom() {
        return $this->belongsTo(ClassRoom::class);
    }

    public function student() {
        return $this->belongsTo(User::class);
    }
}
