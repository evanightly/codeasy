<?php

namespace App\Support\Interfaces\Services;

use Illuminate\Database\Eloquent\Model;

interface UserServiceInterface extends BaseCrudServiceInterface {
    public function updatePreferences($keyOrModel, array $data): ?Model;
}
