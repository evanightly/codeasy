<?php

namespace App\Observers;

use App\Models\LearningMaterialQuestionTestCase;
use App\Models\StudentScore;
use App\Models\TestCaseChangeTracker;
use App\Support\Enums\TestCaseChangeTracker\TestCaseChangeTypeEnum;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LearningMaterialQuestionTestCaseObserver {
    /**
     * Handle the LearningMaterialQuestionTestCase "updated" event.
     */
    public function updated(LearningMaterialQuestionTestCase $testCase): void {
        try {
            // Only track changes that could affect execution results
            if ($this->hasRelevantChanges($testCase)) {
                $this->trackChanges($testCase, TestCaseChangeTypeEnum::UPDATED);
            }
        } catch (\Exception $e) {
            Log::error('Error tracking test case update: ' . $e->getMessage(), [
                'test_case_id' => $testCase->id,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Handle the LearningMaterialQuestionTestCase "created" event.
     */
    public function created(LearningMaterialQuestionTestCase $testCase): void {
        try {
            // Track new test case creation
            $this->trackChanges($testCase, TestCaseChangeTypeEnum::CREATED);
        } catch (\Exception $e) {
            Log::error('Error tracking test case creation: ' . $e->getMessage(), [
                'test_case_id' => $testCase->id,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Handle the LearningMaterialQuestionTestCase "deleted" event.
     */
    public function deleted(LearningMaterialQuestionTestCase $testCase): void {
        try {
            // Track deleted test cases
            $this->trackChanges($testCase, TestCaseChangeTypeEnum::DELETED);
        } catch (\Exception $e) {
            Log::error('Error tracking test case deletion: ' . $e->getMessage(), [
                'test_case_id' => $testCase->id,
                'exception' => $e,
            ]);
        }
    }

    /**
     * Check if the test case has changes that would affect execution results.
     */
    private function hasRelevantChanges(LearningMaterialQuestionTestCase $testCase): bool {
        // Fields that could affect execution results
        $relevantFields = ['input', 'hidden', 'active'];

        foreach ($relevantFields as $field) {
            if ($testCase->isDirty($field)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Track changes to test cases and identify affected students.
     */
    private function trackChanges(LearningMaterialQuestionTestCase $testCase, TestCaseChangeTypeEnum $changeType): void {
        // Get the question, material and course related to this test case
        $question = $testCase->learning_material_question;

        if (!$question) {
            Log::warning('Cannot track test case changes: Question not found', [
                'test_case_id' => $testCase->id,
            ]);

            return;
        }

        $material = $question->learning_material;

        if (!$material) {
            Log::warning('Cannot track test case changes: Material not found', [
                'test_case_id' => $testCase->id,
                'question_id' => $question->id,
            ]);

            return;
        }

        $course = $material->course;

        if (!$course) {
            Log::warning('Cannot track test case changes: Course not found', [
                'test_case_id' => $testCase->id,
                'question_id' => $question->id,
                'material_id' => $material->id,
            ]);

            return;
        }

        // Find affected students - all who have attempted this question, not just completed ones
        $affectedStudentIds = StudentScore::where('learning_material_question_id', $question->id)
            // ->where('completion_status', true)
            ->pluck('user_id')
            ->toArray();

        // If no students are affected, no need to create a tracker
        if (empty($affectedStudentIds)) {
            return;
        }

        // Calculate scheduled time based on config
        $reexecutionInterval = config('test_case_tracking.reexecution_interval', 3);
        $scheduledAt = Carbon::now()->addHours($reexecutionInterval);

        // Get the previous data for updates
        $previousData = null;
        if ($changeType === TestCaseChangeTypeEnum::UPDATED && $testCase->wasChanged()) {
            $previousData = [];
            foreach ($testCase->getOriginal() as $key => $value) {
                if ($testCase->isDirty($key)) {
                    $previousData[$key] = $value;
                }
            }
        }

        // Create a tracker entry
        TestCaseChangeTracker::create([
            'test_case_id' => $testCase->id,
            'learning_material_question_id' => $question->id,
            'learning_material_id' => $material->id,
            'course_id' => $course->id,
            'change_type' => $changeType->value,
            'previous_data' => $previousData,
            'affected_student_ids' => $affectedStudentIds,
            'status' => 'pending',
            'scheduled_at' => $scheduledAt,
        ]);
    }
}
