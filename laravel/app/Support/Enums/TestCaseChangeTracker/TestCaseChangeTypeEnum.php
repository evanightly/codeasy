<?php

namespace App\Support\Enums\TestCaseChangeTracker;

use App\Traits\Enums\Arrayable;

enum TestCaseChangeTypeEnum: string {
    use Arrayable;

    case CREATED = 'created';
    case UPDATED = 'updated';
    case DELETED = 'deleted';
}
