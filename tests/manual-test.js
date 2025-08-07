const axios = require('axios');

async function testWebhookEndpoints() {
    const API_URL = 'http://localhost:5001';
    const WEBHOOK_URL = 'http://localhost:3001/webhook';

    console.log('🧪 Testing Webhook Endpoints Manually');
    console.log('━'.repeat(50));

    try {
        // Test 1: Add webhook
        console.log('1. Testing Add Webhook...');
        const addResponse = await axios.post(`${API_URL}/webhook/add`, {
            url: WEBHOOK_URL,
            events: ['message', 'qr', 'ready']
        });
        console.log('Add Response:', JSON.stringify(addResponse.data, null, 2));
        console.log('Status Code:', addResponse.status);
        console.log('');

        // Test 2: Get webhooks
        console.log('2. Testing Get Webhooks...');
        const getResponse = await axios.get(`${API_URL}/webhook/list`);
        console.log('Get Response:', JSON.stringify(getResponse.data, null, 2));
        console.log('Status Code:', getResponse.status);
        console.log('');

        // Test 3: Test webhook
        console.log('3. Testing Webhook Test...');
        const testResponse = await axios.post(`${API_URL}/webhook/test`, {
            url: WEBHOOK_URL
        });
        console.log('Test Response:', JSON.stringify(testResponse.data, null, 2));
        console.log('Status Code:', testResponse.status);
        console.log('');

        // Test 4: Enable webhooks
        console.log('4. Testing Enable Webhooks...');
        const enableResponse = await axios.post(`${API_URL}/webhook/toggle`, {
            enabled: true
        });
        console.log('Enable Response:', JSON.stringify(enableResponse.data, null, 2));
        console.log('Status Code:', enableResponse.status);
        console.log('');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        console.error('Status:', error.response ? error.response.status : 'No status');
    }
}

testWebhookEndpoints();
