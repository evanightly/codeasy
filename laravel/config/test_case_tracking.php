<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Test Case Re-execution Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for the test case re-execution system.
    |
    */

    // Time in hours between scheduled re-executions
    'reexecution_interval' => env('TEST_CASE_REEXECUTION_INTERVAL', 3),

    // Maximum number of attempts for re-execution
    'max_attempts' => env('TEST_CASE_REEXECUTION_MAX_ATTEMPTS', 3),

    // Batch size for processing re-executions
    'batch_size' => env('TEST_CASE_REEXECUTION_BATCH_SIZE', 50),
];
