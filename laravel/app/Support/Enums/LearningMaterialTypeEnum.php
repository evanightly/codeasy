<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum LearningMaterialTypeEnum: string {
    use Arrayable;

    case LIVE_CODE = 'live_code';
    case QUIZ = 'quiz';
    case ARTICLE = 'article';
    case ESSAY = 'essay';
    case TUTORIAL = 'tutorial';
    case DOCUMENTATION = 'documentation';
    case VIDEO = 'video';
    case INTERACTIVE = 'interactive';
    case PRESENTATION = 'presentation';

    // Keep old values for backward compatibility if needed
    case MULTIPLE_CHOICE = 'multiple_choice'; // Was 'Multiple Choice'
    case DOCUMENT = 'document'; // Was 'Document'
    case AUDIO = 'audio'; // Was 'Audio'
    case IMAGE = 'image'; // Was 'Image'
}
