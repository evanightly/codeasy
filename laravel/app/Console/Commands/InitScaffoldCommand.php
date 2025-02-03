<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class InitScaffoldCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scaffold:init';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize the scaffold for a service repository pattern';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->call('make:init-frontend');
        $this->call('make:init-backend');
    }
}
