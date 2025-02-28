<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['class_room_id', 'teacher_id', 'name', 'description', 'active'];

    public function classroom() {
        return $this->belongsTo(ClassRoom::class);
    }

    public function teacher() {
        return $this->belongsTo(User::class);
    }
}
