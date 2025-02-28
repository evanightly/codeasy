<?php

namespace App\Support\Enums;

use App\Traits\Enums\Arrayable;

enum FileTypeEnum: string {
    use Arrayable;

    case JPG = 'jpg';
    case JPEG = 'jpeg';
    case PNG = 'png';
    case PDF = 'pdf';
    case DOC = 'doc';
    case DOCX = 'docx';
    case PPT = 'ppt';
    case PPTX = 'pptx';
    case XLS = 'xls';
    case XLSX = 'xlsx';
    case TXT = 'txt';
    case ZIP = 'zip';
    case RAR = 'rar';
    case MP4 = 'mp4';
    case MP3 = 'mp3';
    case WAV = 'wav';
    case AVI = 'avi';
    case FLV = 'flv';
    case MOV = 'mov';
    case MKV = 'mkv';
    case WEBM = 'webm';
    case OGG = 'ogg';
    case OGV = 'ogv';
    case WMV = 'wmv';
}
