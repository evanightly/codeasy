<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassRoomStudent extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['class_room_id', 'student_id'];

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class);
    }
}
