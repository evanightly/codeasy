<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum LearningMaterialType: string {
    use Arrayable;

    case MULTIPLE_CHOICE = 'Multiple Choice';
    case ESSAY = 'Essay';
    case LIVE_CODE = 'Live Code';
    case VIDEO = 'Video';
    case DOCUMENT = 'Document';
    case AUDIO = 'Audio';
    case IMAGE = 'Image';
}
