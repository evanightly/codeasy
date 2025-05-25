<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentScore extends Model {
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'learning_material_question_id',
        'coding_time',
        'score',
        'completion_status',
        'trial_status',
        'compile_count',
        'completed_execution_result_id',
        'test_case_complete_count',
        'test_case_total_count',
        'is_workspace_locked',
        'workspace_locked_at',
        'workspace_unlock_at',
        'can_reattempt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'completion_status' => 'boolean',
        'trial_status' => 'boolean',
        'compile_count' => 'integer',
        'test_case_complete_count' => 'integer',
        'test_case_total_count' => 'integer',
        'is_workspace_locked' => 'boolean',
        'workspace_locked_at' => 'datetime',
        'workspace_unlock_at' => 'datetime',
        'can_reattempt' => 'boolean',
    ];

    /**
     * Get the user that owns the score.
     */
    public function user() {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the learning material question that owns the score.
     */
    public function learning_material_question() {
        return $this->belongsTo(LearningMaterialQuestion::class, 'learning_material_question_id');
    }

    /**
     * Get the execution results for this student score.
     */
    public function execution_results() {
        return $this->hasMany(ExecutionResult::class);
    }

    /**
     * Get the execution result that completed this score.
     */
    public function completed_execution_result() {
        return $this->belongsTo(ExecutionResult::class, 'completed_execution_result_id');
    }

    /**
     * Check if workspace is currently locked and not expired
     */
    public function isWorkspaceLocked(): bool
    {
        if (!$this->is_workspace_locked) {
            return false;
        }

        // Check if unlock time has passed
        if ($this->workspace_unlock_at && now()->gte($this->workspace_unlock_at)) {
            return false;
        }

        return true;
    }

    /**
     * Lock the workspace for this student score
     */
    public function lockWorkspace(int $timeoutDays = 7): void
    {
        $this->update([
            'is_workspace_locked' => true,
            'workspace_locked_at' => now(),
            'workspace_unlock_at' => now()->addDays($timeoutDays),
            'can_reattempt' => false,
        ]);
    }

    /**
     * Unlock the workspace (teacher override or timeout reached)
     */
    public function unlockWorkspace(): void
    {
        $this->update([
            'is_workspace_locked' => false,
            'workspace_locked_at' => null,
            'workspace_unlock_at' => null,
            'can_reattempt' => true,
        ]);
    }

    /**
     * Reset for re-attempt (when unlocked)
     */
    public function resetForReattempt(): void
    {
        if ($this->isWorkspaceLocked()) {
            throw new \Exception('Cannot reset while workspace is locked');
        }

        $this->update([
            'completion_status' => false,
            'trial_status' => false,
            'score' => 0,
            'coding_time' => 0,
            'compile_count' => 0,
            'completed_execution_result_id' => null,
            'test_case_complete_count' => 0,
            'test_case_total_count' => 0,
        ]);

        // TODO: make conditional
        // Delete all execution results for this score
        $this->execution_results()->delete();
    }
}
