<?php

namespace App\Models;

use App\Support\Enums\LearningMaterialTypeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningMaterial extends Model {
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'file',
        'file_extension',
        'type',
        'order_number',
        'active',
    ];
    protected $casts = [
        'type' => LearningMaterialTypeEnum::class,
        'active' => 'boolean',
    ];
    protected $appends = [
        'file_url',
        'full_file_url', // appended attribute for full PDF URL
    ];

    public function getFileUrlAttribute() {
        if (empty($this->file) || empty($this->file_extension)) {
            return null;
        }

        return asset('storage/learning-materials/' . $this->file);
    }

    // Add accessor for full PDF version URL
    public function getFullFileUrlAttribute() {
        if (empty($this->file) || empty($this->file_extension)) {
            return null;
        }
        $baseName = pathinfo($this->file, PATHINFO_FILENAME);
        $fullName = $baseName . '_full.' . $this->file_extension;

        return asset('storage/learning-materials/' . $fullName);
    }

    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }

    public function learning_material_questions() {
        return $this->hasMany(LearningMaterialQuestion::class)
            ->orderBy('order_number');
    }

    public function student_scores() {
        return $this->hasManyThrough(
            StudentScore::class,
            LearningMaterialQuestion::class,
            'learning_material_id', // Foreign key on LearningMaterialQuestion
            'learning_material_question_id', // Foreign key on StudentScore
            'id', // Local key on LearningMaterial
            'id' // Local key on LearningMaterialQuestion
        );
    }

    // count cognitive level defined in the test case column cognitive_levels that has attribute as json
    // flow LearningMaterial(this class) -> LearningMaterialQuestion -> LearningMaterialQuestionTestCase
    // add a parameter $cognitiveLevel to countCognitiveLevel, if the user didnt pass the $cognitiveLevel parameter, just count each cognitive level defined within this learning material
    // cognitive levels (C1, C2, ... C6)
    // so the result example will be {C1: 6, C2: 2, ... C6: 1}
    public function countCognitiveLevels(?string $cognitiveLevel = null, bool $detailed = false): array {
        $questions = $this->learning_material_questions()
            ->with('learning_material_question_test_cases')
            ->get();

        $summary = [];
        $details = [];

        $questions->each(function ($question) use (&$summary, &$details, $cognitiveLevel) {
            $qInfo = [
                'id' => $question->id,
                'title' => $question->title ?? null,
                'test_cases' => [],
            ];

            $question->learning_material_question_test_cases->each(function ($testCase) use (&$summary, &$qInfo, $cognitiveLevel) {
                $levels = $testCase->cognitive_levels;

                // handle JSON string or null, then ensure collection
                if (is_string($levels)) {
                    $levels = json_decode($levels, true) ?: [];
                }
                $levels = collect($levels)->values();

                // if filtering by a single cognitive level, skip test cases that don't contain it
                if ($cognitiveLevel && !$levels->contains($cognitiveLevel)) {
                    return;
                }

                // update summary counts (same semantics as original: each test-case->level counts as 1)
                if ($cognitiveLevel) {
                    if ($levels->contains($cognitiveLevel)) {
                        $summary[$cognitiveLevel] = ($summary[$cognitiveLevel] ?? 0) + 1;
                    }
                } else {
                    $levels->each(function ($level) use (&$summary) {
                        $summary[$level] = ($summary[$level] ?? 0) + 1;
                    });
                }

                // add detailed info for this test case
                $qInfo['test_cases'][] = [
                    'id' => $testCase->id,
                    'input' => $testCase->input ?? null,
                    'cognitive_levels' => $levels->all(),
                    'cognitive_levels_count' => $levels->count(),
                ];
            });

            if (!empty($qInfo['test_cases'])) {
                $details[] = $qInfo;
            }
        });

        if ($detailed) {
            return [
                'summary' => $summary,
                'details' => $details,
            ];
        }

        return $summary;
    }
}
