<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum ProgrammingLanguageEnum: string {
    use Arrayable;

    case PYTHON = 'python';
    case JAVASCRIPT = 'javascript';
    case JAVA = 'java';
    case CPP = 'cpp';
    case PHP = 'php';
    case CSHARP = 'csharp';
    case RUBY = 'ruby';
    case GO = 'go';
}
