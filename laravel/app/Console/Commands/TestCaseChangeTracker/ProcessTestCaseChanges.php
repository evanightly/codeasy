<?php

namespace App\Console\Commands\TestCaseChangeTracker;

use App\Jobs\TestCaseChangeTracker\ExecuteStudentCodeWithUpdatedTestCases;
use App\Models\TestCaseChangeTracker;
use Illuminate\Console\Command;

class ProcessTestCaseChanges extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test-cases:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process scheduled test case changes and re-execute student code';

    /**
     * Execute the console command.
     */
    public function handle() {
        $this->info('Processing scheduled test case changes...');

        // Find trackers that are scheduled to run now
        $pendingTrackers = TestCaseChangeTracker::where('status', 'pending')
            ->where('scheduled_at', '<=', now())
            ->limit(config('test_case_tracking.batch_size', 50))
            ->get();

        $count = $pendingTrackers->count();
        $this->info("Found $count pending re-executions to process");

        // Dispatch a job for each pending tracker
        foreach ($pendingTrackers as $tracker) {
            ExecuteStudentCodeWithUpdatedTestCases::dispatch($tracker);
            $this->info("Dispatched job for tracker ID: {$tracker->id}");
        }

        $this->info('All pending re-executions have been queued');

        return 0;
    }
}
