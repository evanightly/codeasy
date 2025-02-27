<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['classroom_id', 'name', 'description', 'active'];

    public function classroom() {
        return $this->belongsTo(ClassRoom::class);
    }
}
