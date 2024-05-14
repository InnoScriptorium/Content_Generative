const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const docx = require('docx');
const { Document, Paragraph, TextRun } = docx;



require('dotenv').config();
 
const app = express();
app.use(express.json());
 
app.use(cors());








const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Accessing API key from environment variable
});
 
 
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
 
// Array to store responses
const responsesArray = [];
let documentContent = '';
 
async function makeRequestWithRetry(question) {
    const maxRetries = 3;
    let retries = 0;
 
    while (retries < maxRetries) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ "role": "user", "content": question }],
                max_tokens: 500
            });
 
            // Push response to the array
            responsesArray.push(response.choices[0].message.content);
 
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
 
// Route to get the array of responses
app.get('/responsesArray', (req, res) => {
    res.json(responsesArray);
});




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

app.post('/addToDocument', (req, res) => {
    const { question, responseArray,fullResponseArray } = req.body;

    // Construct content to add to the document
    let contentToAdd = `${question.toUpperCase()}\n\n`;
    contentToAdd += responseArray.map((response) => ` ${response}`).join('\n\n');
    contentToAdd+='\n\n'+fullResponseArray;
    

    // Append content to the existing documentContent
    documentContent = contentToAdd;

    console.log('Content added to document:', contentToAdd);

    res.status(200).send('Content added to document successfully');
});

app.get('/generate-document', async (req, res) => {
    try {
        // Create paragraphs for each line of content
        const paragraphs = documentContent.split('\n\n').map((text, index) => {
            let children = [
                new TextRun({
                    text: text,
                    bold: true,
                    size: index === 0 ? 44 : 32
                })
            ];

            if (index === 0) {
                // Add double line after the first question
                children.push(new TextRun({
                    text: "\n\n",
                    bold: true,
                    size: 24 // Adjust size of double line as needed
                }));
            }

            return new Paragraph({
                alignment: index === 0 ? "center" : "left", // Center align first question
                children: children,
                break: true 
            });
        });

        // Create a new document with the paragraphs
        const doc = new Document({
            sections: [{ children: paragraphs }]
        });

        // Generate the DOCX file
        const buffer = await docx.Packer.toBuffer(doc);

        // Send the document
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename=document.docx',
        });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating or sending document:', error);
        res.status(500).send('Error generating or sending document');
    }
});


app.get('/getDocumentContent', (req, res) => {
    try {
        res.status(200).send(documentContent);
    } catch (error) {
        console.error('Error fetching document content:', error);
        res.status(500).send('Error fetching document content');
    }
});
 

 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});