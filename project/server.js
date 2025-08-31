// server.js - FINAL CORRECT VERSION

require('dotenv').config();

// This is the special debug line we need to see the output of.
console.log(`🔑 Key being used by server: [${process.env.GEMINI_API_KEY}]`);

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors()); 
app.use(express.json());

// This line serves the frontend files
app.use(express.static(path.join(__dirname, 'public')));

// --- Mock Database ---
const mockProductDatabase = [
    { id: 1, name: 'Organic Gala Apples', brand: 'Farm Fresh', price: 4.50, tags: ['organic', 'fruit'] },
    { id: 2, name: 'Whole Milk', brand: 'DairyLand', price: 3.00, tags: ['dairy'] },
    { id: 3, name: 'Almond Milk', brand: 'NuttyCo', price: 4.25, tags: ['dairy-free', 'vegan'] },
    { id: 4, name: 'Sourdough Bread', brand: 'Bakery Bites', price: 5.50, tags: ['bakery'] },
    { id: 5, name: 'Colgate Toothpaste', brand: 'Colgate', price: 3.50, tags: ['personal-care'] },
    { id: 6, name: 'Crest Toothpaste', brand: 'Crest', price: 4.00, tags: ['personal-care'] },
    { id: 7, name: 'Organic Eggs', brand: 'Farm Fresh', price: 6.00, tags: ['organic', 'dairy'] },
    { id: 8, name: 'Generic Toothpaste', brand: 'Store Brand', price: 2.50, tags: ['personal-care'] }
];

// --- Gemini API Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;


// --- Generic function to call Gemini API ---
async function callGemini(prompt, schema) {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    };
    try {
        const response = await axios.post(GEMINI_API_URL, payload);
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            throw new Error("Invalid response structure from Gemini API");
        }
        return JSON.parse(text);
    } catch (error) {
        console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get response from AI.');
    }
}

// --- API Endpoints ---
app.post('/api/command', async (req, res) => {
    const { transcript } = req.body;
    if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
    }
    const prompt = `You are a shopping list assistant. Analyze the following command: "${transcript}". 
    Determine the intent: is it 'add', 'remove', 'clear', 'search', or 'unknown'?
    - For 'add', extract the item and quantity (default 1).
    - For 'remove', extract the item.
    - For 'clear', no item is needed.
    - For 'search', extract the main item, any descriptive tags (like 'organic'), a brand, and a max price if mentioned (e.g., 'under $5').`;
    const schema = {
        type: "OBJECT",
        properties: {
            command: { type: "STRING", enum: ["add", "remove", "clear", "search", "unknown"] },
            item: { type: "STRING" },
            quantity: { type: "NUMBER" },
            tags: { type: "ARRAY", items: { type: "STRING" } },
            brand: { type: "STRING" },
            maxPrice: { type: "NUMBER" }
        }
    };
    try {
        const result = await callGemini(prompt, schema);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/recipe', async (req, res) => {
    const { items } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Items list is required.' });
    }
    const prompt = `Based on these ingredients: ${items.join(', ')}, suggest a simple recipe. Provide the recipe name, a short description, an ingredients list, and step-by-step instructions.`;
    const schema = {
        type: "OBJECT",
        properties: {
            recipeName: { "type": "STRING" },
            description: { "type": "STRING" },
            ingredients: { type: "ARRAY", items: { type: "STRING" } },
            instructions: { type: "ARRAY", items: { type: "STRING" } }
        }
    };
    try {
        const result = await callGemini(prompt, schema);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suggestions', async (req, res) => {
    const { items } = req.body;
    const prompt = `Here is a shopping list: ${items.join(', ')}. Suggest 3 more items that would go well with these.`;
    const schema = { type: "ARRAY", items: { type: "STRING" } };
    try {
        const result = await callGemini(prompt, schema);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/search', (req, res) => {
    const criteria = req.body;
    const results = mockProductDatabase.filter(product => {
        let match = true;
        const productName = product.name.toLowerCase();
        const productBrand = product.brand.toLowerCase();
        if (criteria.item && !productName.includes(criteria.item.toLowerCase())) match = false;
        if (criteria.brand && !productBrand.includes(criteria.brand.toLowerCase())) match = false;
        if (criteria.maxPrice && product.price > criteria.maxPrice) match = false;
        if (criteria.tags && criteria.tags.length > 0) {
            if (!criteria.tags.every(tag => product.tags.includes(tag.toLowerCase()))) match = false;
        }
        return match;
    });
    res.json(results);
});


// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Frontend is available at http://localhost:${PORT}`);
});