import { execSync } from 'child_process';
import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://laravel:9001',
        viewportWidth: 1280,
        viewportHeight: 800,
        video: false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 10000,
        pageLoadTimeout: 30000,
        specPattern: 'e2e/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: 'support/e2e.ts',
        fixturesFolder: 'fixtures',
        screenshotsFolder: 'screenshots',
        videosFolder: 'videos',
        downloadsFolder: 'downloads',
        // Test results output configuration
        reporterOptions: {
            configFile: 'reporter-config.json',
        },
        // Disable Chrome web security for WebSocket handling
        chromeWebSecurity: false,
        setupNodeEvents(on, _config) {
            // Database reset task
            on('task', {
                resetDatabase() {
                    return new Promise((resolve) => {
                        try {
                            const startTime = Date.now();

                            console.log('Starting database reset...');

                            // Use Docker exec to run the command in the Laravel container
                            // Run from the project root where dc.sh is located
                            console.log('Running cypress:reset-db command via Docker...');
                            const result = execSync('./dc.sh artisan cypress:reset-db', {
                                cwd: '/home/evanity/Projects/codeasy',
                                encoding: 'utf-8',
                                stdio: 'pipe',
                            });

                            const duration = Date.now() - startTime;
                            console.log(`Database reset completed successfully in ${duration}ms`);
                            console.log('Command output:', result);

                            resolve({
                                success: true,
                                duration,
                                output: result,
                                message: 'Database reset completed successfully',
                            });
                        } catch (error) {
                            console.error('Database reset failed:', error);
                            const errorMessage =
                                error instanceof Error ? error.message : String(error);

                            resolve({
                                success: false,
                                error: errorMessage,
                                message: 'Database reset failed',
                            });
                        }
                    });
                },
            });
        },
    },
    component: {
        devServer: {
            framework: 'react',
            bundler: 'webpack',
        },
    },
    env: {
        // Environment variables for testing
        CYPRESS_baseUrl: 'http://laravel:9001',
        failOnStatusCode: false,
    },
    retries: {
        runMode: 2,
        openMode: 0,
    },
    experimentalStudio: true,
    watchForFileChanges: false,
});
