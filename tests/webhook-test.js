const axios = require('axios');

// Konfigurasi
const WHATSAPP_API_URL = 'http://localhost:5001';
const WEBHOOK_TEST_URL = 'http://localhost:3001/webhook';

class WebhookTester {
    constructor() {
        this.testResults = [];
    }

    // Helper function untuk menampilkan hasil test
    logResult(testName, success, message, data = null) {
        const result = {
            test: testName,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        this.testResults.push(result);

        const status = success ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
        if (data && success) {
            console.log('   Response:', JSON.stringify(data, null, 2));
        }
        console.log('');
    }

    // Test 1: Add webhook URL
    async testAddWebhook() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/add`, {
                url: WEBHOOK_TEST_URL,
                events: ['message', 'qr', 'ready', 'disconnected']
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Add Webhook', true, response.data.message, response.data);
            } else {
                this.logResult('Add Webhook', false, 'Unexpected response format');
            }
        } catch (error) {
            this.logResult('Add Webhook', false, `Error: ${error.message}`);
        }
    }

    // Test 2: Get all webhooks
    async testGetWebhooks() {
        try {
            const response = await axios.get(`${WHATSAPP_API_URL}/webhook/list`);

            if (response.status === 200 && response.data.data) {
                this.logResult('Get Webhooks', true, 'Retrieved webhooks successfully', response.data.data);
            } else {
                this.logResult('Get Webhooks', false, 'Failed to get webhooks');
            }
        } catch (error) {
            this.logResult('Get Webhooks', false, `Error: ${error.message}`);
        }
    }

    // Test 3: Test webhook endpoint
    async testWebhookEndpoint() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/test`, {
                url: WEBHOOK_TEST_URL
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Test Webhook', true, response.data.message, response.data);
            } else {
                this.logResult('Test Webhook', false, 'Unexpected response format');
            }
        } catch (error) {
            this.logResult('Test Webhook', false, `Error: ${error.message}`);
        }
    }

    // Test 4: Enable webhooks
    async testEnableWebhooks() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/toggle`, {
                enabled: true
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Enable Webhooks', true, response.data.message, response.data);
            } else {
                this.logResult('Enable Webhooks', false, 'Failed to enable webhooks');
            }
        } catch (error) {
            this.logResult('Enable Webhooks', false, `Error: ${error.message}`);
        }
    }

    // Test 5: Add duplicate webhook (should fail)
    async testAddDuplicateWebhook() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/add`, {
                url: WEBHOOK_TEST_URL
            });

            // Jika berhasil, ini adalah masalah
            if (response.status === 200 && response.data.message) {
                this.logResult('Duplicate Webhook Prevention', false, 'Should not allow duplicate webhooks!');
            } else {
                this.logResult('Duplicate Webhook Prevention', true, 'Correctly prevented duplicate webhook');
            }
        } catch (error) {
            // Error 400 adalah yang diharapkan untuk duplicate
            if (error.response && error.response.status === 400) {
                this.logResult('Duplicate Webhook Prevention', true, 'Correctly prevented duplicate webhook');
            } else {
                this.logResult('Duplicate Webhook Prevention', false, `Unexpected error: ${error.message}`);
            }
        }
    }

    // Test 6: Add invalid URL (should fail)
    async testAddInvalidWebhook() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/add`, {
                url: 'invalid-url'
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Invalid URL Prevention', false, 'Should not allow invalid URLs!');
            } else {
                this.logResult('Invalid URL Prevention', true, 'Correctly rejected invalid URL');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                this.logResult('Invalid URL Prevention', true, 'Correctly rejected invalid URL');
            } else {
                this.logResult('Invalid URL Prevention', false, `Unexpected error: ${error.message}`);
            }
        }
    }

    // Test 7: Check if webhook test server is running
    async testWebhookServer() {
        try {
            const response = await axios.get('http://localhost:3001/test');
            this.logResult('Webhook Server Check', true, 'Webhook test server is running', response.data);
        } catch (error) {
            this.logResult('Webhook Server Check', false, 'Webhook test server is not running. Please start it first!');
        }
    }

    // Test 8: Remove webhook
    async testRemoveWebhook() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/remove`, {
                url: WEBHOOK_TEST_URL
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Remove Webhook', true, response.data.message, response.data);
            } else {
                this.logResult('Remove Webhook', false, 'Failed to remove webhook');
            }
        } catch (error) {
            this.logResult('Remove Webhook', false, `Error: ${error.message}`);
        }
    }

    // Test 9: Remove non-existent webhook (should fail)
    async testRemoveNonExistentWebhook() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/remove`, {
                url: 'http://non-existent-webhook.com'
            });

            if (response.status === 200 && response.data.message) {
                this.logResult('Remove Non-existent Webhook', false, 'Should not remove non-existent webhook!');
            } else {
                this.logResult('Remove Non-existent Webhook', true, 'Correctly failed to remove non-existent webhook');
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                this.logResult('Remove Non-existent Webhook', true, 'Correctly failed to remove non-existent webhook');
            } else {
                this.logResult('Remove Non-existent Webhook', false, `Unexpected error: ${error.message}`);
            }
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting Webhook Tests');
        console.log('━'.repeat(60));
        console.log('');

        // Pre-test: Check if servers are running
        await this.testWebhookServer();

        // Clear existing webhooks first
        await this.clearWebhooks();

        // Main tests
        await this.testAddWebhook();
        await this.testGetWebhooks();
        await this.testEnableWebhooks();
        await this.testWebhookEndpoint();
        await this.testAddDuplicateWebhook();
        await this.testAddInvalidWebhook();
        await this.testRemoveNonExistentWebhook();
        await this.testRemoveWebhook();

        // Summary
        console.log('━'.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('━'.repeat(60));

        const successCount = this.testResults.filter(r => r.success).length;
        const totalCount = this.testResults.length;

        console.log(`✅ Passed: ${successCount}/${totalCount}`);
        console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);

        if (successCount === totalCount) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the results above.');
        }

        console.log('');
        console.log('📋 Detailed Results:');
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}`);
        });
    }

    // Helper method to clear webhooks
    async clearWebhooks() {
        try {
            const response = await axios.post(`${WHATSAPP_API_URL}/webhook/clear`);
            if (response.status === 200 && response.data.message) {
                this.logResult('Clear Webhooks', true, response.data.message);
            } else {
                this.logResult('Clear Webhooks', false, 'Failed to clear webhooks');
            }
        } catch (error) {
            this.logResult('Clear Webhooks', false, `Error: ${error.message}`);
        }
    }
}

// Instructions
console.log('🎣 Webhook Testing Script');
console.log('━'.repeat(60));
console.log('');
console.log('📋 Prerequisites:');
console.log('1. WhatsApp API server should be running on localhost:5001');
console.log('2. Webhook test server should be running on localhost:3001');
console.log('');
console.log('🚀 To start webhook test server:');
console.log('   node tests/webhook-test-server.js');
console.log('');
console.log('▶️  Starting tests in 3 seconds...');
console.log('');

// Start tests after delay
setTimeout(async () => {
    const tester = new WebhookTester();
    await tester.runAllTests();
}, 3000);
