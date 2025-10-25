const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.post('/sentiment', async (req, res) => {
    const { base64Image } = req.body;
    
    try {
        const url = `${process.env.LAVA_BASE_URL}/forward?u=${process.env.MODEL_URL}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.LAVA_FORWARD_TOKEN,
            'anthropic-version': '2023-06-01'
        };
 
        const requestBody = {
            model: 'claude-haiku-4-5',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: 'image/webp',
                                data: base64Image.split(',')[1]
                            }
                        },
                        {
                            type: 'text',
                            text: 'Take the following image. Give some feedback regarding how well the user is practicing good public speaking. This means things like looking at the camera when talking and not fidgeting or looking distracted. Give one sentence of feedback and a score from 0 - 10, 0 being bad and 10 being good.'
                        },
                    ],
                },
            ],
            system: 'You are a helpful assistant.'
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log(data);
        //const result = data.choices[0].message.content;
        res.json({ data });
    } catch (err) {
        console.error(err);
    }
});

app.listen(PORT, (error) =>{
    if(!error) {
        console.log(`Server is running on https://localhost:${PORT}`);}
    else
        console.log("Error occured, ", error);
});