module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only POST allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    const API_KEY = 'dteq3B4uyHZZ82e26nXoVg7w';

    try {
        const { image_file_b64 } = req.body;

        if (!image_file_b64) {
            return res.status(400).json({ 
                success: false, 
                error: 'No image provided' 
            });
        }

        console.log('Processing image... Image size:', image_file_b64.length);

        // Use native https module for better reliability
        const https = require('https');
        
        const postData = JSON.stringify({
            image_file_b64: image_file_b64,
            size: 'auto'
        });

        const options = {
            hostname: 'api.remove.bg',
            port: 443,
            path: '/v1.0/removebg',
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };

        const makeRequest = () => {
            return new Promise((resolve, reject) => {
                const apiReq = https.request(options, (apiRes) => {
                    console.log('API Response Status:', apiRes.statusCode);
                    console.log('API Response Headers:', apiRes.headers);

                    let data = [];

                    apiRes.on('data', (chunk) => {
                        data.push(chunk);
                    });

                    apiRes.on('end', () => {
                        const buffer = Buffer.concat(data);
                        
                        if (apiRes.statusCode !== 200) {
                            // Try to parse error as JSON
                            try {
                                const errorText = buffer.toString();
                                console.error('Error response:', errorText.substring(0, 500));
                                
                                const error = JSON.parse(errorText);
                                reject(new Error(error.errors?.[0]?.title || `API Error: ${apiRes.statusCode}`));
                            } catch (e) {
                                reject(new Error(`API returned status ${apiRes.statusCode}`));
                            }
                        } else {
                            resolve(buffer);
                        }
                    });
                });

                apiReq.on('error', (error) => {
                    console.error('Request error:', error);
                    reject(error);
                });

                apiReq.on('timeout', () => {
                    apiReq.destroy();
                    reject(new Error('Request timeout'));
                });

                apiReq.write(postData);
                apiReq.end();
            });
        };

        const buffer = await makeRequest();
        const base64Image = buffer.toString('base64');

        console.log('Image processed successfully. Size:', base64Image.length);

        return res.status(200).json({ 
            success: true, 
            image: base64Image 
        });

    } catch (error) {
        console.error('Error in handler:', error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to process image. Please try again.' 
        });
    }
};