console.log('Simple test starting...');

import { execSync } from 'child_process';

try {
    console.log('About to run command...');
    const result = execSync('./dc.sh artisan --version', {
        cwd: '/home/evanity/Projects/codeasy',
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 10000
    });
    console.log('Command result:', result);
} catch (error) {
    console.error('Command failed:', error.message);
}

console.log('Test complete.');
