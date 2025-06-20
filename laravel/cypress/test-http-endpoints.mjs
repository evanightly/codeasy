import { execSync } from 'child_process';
import process from 'process';

console.log('Testing HTTP endpoint for database reset...');

// Test HTTP endpoint
async function testHttpReset() {
    try {
        console.log('Making HTTP request to reset endpoint...');
        
        // Use curl to test the endpoint
        const result = execSync('curl -X POST -H "X-Cypress-Test: true" -H "Content-Type: application/json" http://localhost/cypress/reset-database', {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 30000
        });
        
        console.log('HTTP Response:', result);
        
        const parsedResult = JSON.parse(result);
        
        if (parsedResult.success) {
            console.log('✅ HTTP reset successful!');
            console.log(`Duration: ${parsedResult.duration_ms}ms`);
            return true;
        } else {
            console.log('❌ HTTP reset failed:', parsedResult.error || parsedResult.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ HTTP request failed:', error.message);
        return false;
    }
}

// Test status endpoint
async function testStatusEndpoint() {
    try {
        console.log('Testing status endpoint...');
        
        const result = execSync('curl -H "X-Cypress-Test: true" http://localhost/cypress/status', {
            encoding: 'utf-8',
            stdio: 'pipe',
            timeout: 10000
        });
        
        console.log('Status Response:', result);
        
        const parsedResult = JSON.parse(result);
        
        if (parsedResult.success) {
            console.log('✅ Status endpoint working!');
            console.log('Table counts:', parsedResult.table_counts);
            return true;
        } else {
            console.log('❌ Status endpoint failed:', parsedResult.error || parsedResult.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Status request failed:', error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    console.log('=== HTTP Endpoint Tests ===\n');
    
    const statusOk = await testStatusEndpoint();
    console.log('\n---\n');
    
    const resetOk = await testHttpReset();
    console.log('\n---\n');
    
    if (statusOk && resetOk) {
        console.log('🎉 All HTTP endpoint tests passed!');
        process.exit(0);
    } else {
        console.log('💥 Some tests failed!');
        process.exit(1);
    }
}

runTests();
