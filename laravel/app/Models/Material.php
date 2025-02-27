<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = ['course_id', 'name', 'description', 'file', 'active'];
}
