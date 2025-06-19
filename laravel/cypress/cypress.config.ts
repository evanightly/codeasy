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
});
