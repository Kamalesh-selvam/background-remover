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

        console.log('Processing image...');

        // Make request to Remove.bg API using native fetch (Node 18+)
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                image_file_b64: image_file_b64,
                size: 'auto',
                format: 'png'
            })
        });

        console.log('API Response Status:', response.status);

        // Check if response is OK
        if (!response.ok) {
            let errorMessage = 'Failed to remove background';
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.errors?.[0]?.title || errorMessage;
                } else {
                    const textError = await response.text();
                    console.error('Non-JSON error response:', textError.substring(0, 200));
                    errorMessage = `API Error: ${response.status}`;
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }

            return res.status(response.status).json({ 
                success: false, 
                error: errorMessage 
            });
        }

        // Get the image buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        console.log('Image processed successfully');

        return res.status(200).json({ 
            success: true, 
            image: base64Image 
        });

    } catch (error) {
        console.error('Error in handler:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error' 
        });
    }
};