// Quick test file to verify API connectivity
// Run this in browser console or as a separate test

const testAPI = async () => {
    const url = 'https://ib7kg5hiy3.execute-api.us-east-1.amazonaws.com/dev/menu_test';
    
    try {
        console.log('Testing API:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers available');
        
        if (response.ok) {
            const data = await response.json();
            console.log('Success! Data received:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
    } catch (error) {
        console.error('Fetch error:', error);
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('❌ CORS Error detected! This usually means:');
            console.error('1. API Gateway does not have CORS enabled');
            console.error('2. CORS headers are not properly configured');
            console.error('3. OPTIONS preflight request is failing');
        }
        
        throw error;
    }
};

// Uncomment to run test
// testAPI();

export default testAPI;