const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const API_KEY = 'dteq3B4uyHZZ82e26nXoVg7w';

    try {
        const { image_file_b64 } = req.body;

        if (!image_file_b64) {
            return res.status(400).json({ success: false, error: 'No image provided' });
        }

        console.log('Processing image...');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_file_b64: image_file_b64,
                size: 'auto'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errors?.[0]?.title || 'Failed to remove background');
        }

        const buffer = await response.buffer();
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