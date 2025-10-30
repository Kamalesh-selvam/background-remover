module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const API_KEY = 'dteq3B4uyHZZ82e26nXoVg7w';

    try {
        const { image_file_b64 } = req.body;

        if (!image_file_b64) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        // Use native https module instead of node-fetch
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
            }
        };

        const makeRequest = () => {
            return new Promise((resolve, reject) => {
                const apiReq = https.request(options, (apiRes) => {
                    let data = [];

                    apiRes.on('data', (chunk) => {
                        data.push(chunk);
                    });

                    apiRes.on('end', () => {
                        const buffer = Buffer.concat(data);
                        
                        if (apiRes.statusCode !== 200) {
                            try {
                                const error = JSON.parse(buffer.toString());
                                reject(new Error(error.errors?.[0]?.title || 'Failed to remove background'));
                            } catch (e) {
                                reject(new Error(`HTTP Error ${apiRes.statusCode}`));
                            }
                        } else {
                            resolve(buffer);
                        }
                    });
                });

                apiReq.on('error', (error) => {
                    reject(error);
                });

                apiReq.write(postData);
                apiReq.end();
            });
        };

        const buffer = await makeRequest();
        const base64Image = buffer.toString('base64');

        res.status(200).json({ 
            success: true, 
            image: base64Image 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to process image' 
        });
    }
};