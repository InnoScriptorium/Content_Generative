const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Accessing API key from environment variable
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function makeRequestWithRetry(question) {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ "role": "user", "content": question }],
                max_tokens: 200
            });

            return response.choices[0].message.content;

        } catch (error) {
            if (error.code === 'insufficient_quota') {
                const waitTime = Math.pow(2, retries) * 1000;
                console.log(`Rate limit exceeded. Retrying in ${waitTime / 1000} seconds...`);
                await delay(waitTime);
                retries++;
            } else {
                console.error('Error:', error);
                throw new Error('Failed to make API request.');
            }
        }
    }

    throw new Error('Max retries exceeded. Unable to make API request.');
}

app.post('/getResponse', async (req, res) => {
    try {
        const question = req.body.question;
        if (!question) {
            throw new Error('Question is required in the request body.');
        }

        const response = await makeRequestWithRetry(question);
        res.json(response);
        console.log(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from OpenAI' });
    }
});

app.listen(4000, () => {
    console.log("Server Listening on port 4000");
});
