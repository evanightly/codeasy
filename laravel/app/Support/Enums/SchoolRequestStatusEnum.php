<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum SchoolRequestStatusEnum: string {
    use Arrayable;

    case APPROVED = 'approved';
    case PENDING = 'pending';
    case REJECTED = 'rejected';
}
