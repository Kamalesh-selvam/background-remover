const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const API_KEY = 'dteq3B4uyHZZ82e26nXoVg7w';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API endpoint to remove background
app.post('/api/remove-bg', async (req, res) => {
    try {
        const { image_file_b64 } = req.body;

        if (!image_file_b64) {
            return res.status(400).json({ error: 'No image provided' });
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
        
        // Send image as base64
        const base64Image = buffer.toString('base64');
        res.json({ success: true, image: base64Image });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to process image' 
        });
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📸 Background Remover is ready!`);
});