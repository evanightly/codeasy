<?php

namespace App\Console\Commands;

use App\Models\StudentScore;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UnlockExpiredWorkspaces extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'workspace:unlock-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unlock expired workspace locks based on timeout settings';

    /**
     * Execute the console command.
     */
    public function handle() {
        $this->info('Checking for expired workspace locks...');

        // Find all locked workspaces where unlock time has passed
        $expiredLocks = StudentScore::where('is_workspace_locked', true)
            ->where('workspace_unlock_at', '<=', Carbon::now())
            ->get();

        if ($expiredLocks->isEmpty()) {
            $this->info('No expired workspace locks found.');

            return;
        }

        $unlockedCount = 0;
        foreach ($expiredLocks as $score) {
            $score->unlockWorkspace();
            $unlockedCount++;
        }

        $this->info("Successfully unlocked {$unlockedCount} expired workspace(s).");

        // Log the activity
        Log::info("Workspace unlock scheduler: {$unlockedCount} workspaces unlocked", [
            'unlocked_count' => $unlockedCount,
            'executed_at' => Carbon::now()->toDateTimeString(),
        ]);
    }
}
