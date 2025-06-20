import { execSync } from 'child_process';
import process from 'process';

// Simulate the Cypress task
function resetDatabase() {
    return new Promise((resolve) => {
        try {
            const startTime = Date.now();

            console.log('Starting database reset...');
            
            // Use Docker exec to run the command in the Laravel container
            console.log('Running cypress:reset-db command via Docker...');
            const result = execSync('./dc.sh artisan cypress:reset-db', {
                cwd: '/home/evanity/Projects/codeasy',
                encoding: 'utf-8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            console.log(`Database reset completed successfully in ${duration}ms`);
            console.log('Command output:', result);

            resolve({
                success: true,
                duration,
                output: result,
                message: 'Database reset completed successfully'
            });
            
        } catch (error) {
            console.error('Database reset failed:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            resolve({
                success: false,
                error: errorMessage,
                message: 'Database reset failed'
            });
        }
    });
}

// Test the task
console.log('Testing Cypress database reset task...');
console.log('Current working directory:', process.cwd());
console.log('Target working directory: /home/evanity/Projects/codeasy');

resetDatabase().then((result) => {
    console.log('\n=== TASK RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
        console.log('\n✅ Task executed successfully!');
        process.exit(0);
    } else {
        console.log('\n❌ Task failed!');
        process.exit(1);
    }
}).catch((error) => {
    console.error('\n💥 Task threw an error:', error);
    process.exit(1);
});
