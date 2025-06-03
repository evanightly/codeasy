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

    /*
    |--------------------------------------------------------------------------
    | Progressive Test Case Revelation Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for revealing hidden test cases after failed attempts.
    |
    */

    // Number of failed compilation attempts before revealing hidden test cases
    'failed_attempts_threshold' => env('TEST_CASE_REVELATION_THRESHOLD', 3),

    // Enable/disable progressive test case revelation
    'enable_progressive_revelation' => env('TEST_CASE_REVELATION_ENABLED', true),
];
