<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class TestPasswordResetEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:password-reset-email {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test password reset email functionality with MailHog';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? 'test@example.com';
        
        // Find or create a test user
        $user = User::firstOrCreate([
            'email' => $email
        ], [
            'name' => 'Test User',
            'username' => 'testuser',
            'password' => bcrypt('password')
        ]);

        // Generate a dummy token
        $token = Str::random(64);

        $this->info("Sending password reset email to: {$email}");
        $this->info("Make sure MailHog is running at: http://localhost:8025");
        
        // Send the notification
        $user->notify(new ResetPasswordNotification($token));
        
        $this->info("✅ Password reset email sent successfully!");
        $this->info("📧 Check MailHog at http://localhost:8025 to see the email");
        
        return Command::SUCCESS;
    }
}
