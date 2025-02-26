<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['school_id', 'grade', 'year', 'active'];

    protected function school() {
        return $this->belongsTo(School::class);
    }
}
