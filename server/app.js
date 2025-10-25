const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.post('/sentiment', async (req, res) => {
    const { base64Images } = req.body;
    
    try {
        const url = `${process.env.LAVA_BASE_URL}/forward?u=https://api.openai.com/v1/chat/completions`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LAVA_FORWARD_TOKEN}`,
        };

        const requestBody = {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text",
                            text: "Take the following images. Give some feedback regarding how well the user is practicing good public speaking. This means things like looking at the camera when talking and not fidgeting or looking distracted. Give one sentence of feedback and a score from 0 - 10, 0 being bad and 10 being good. Also tell me how many images you see" 
                        },
                        ...base64Images.map(image => ({
                            type: "image_url",
                            image_url: {
                                url: `data:image/webp;base64,${image.replace(/^data:image\/\w+;base64,/, '')}`
                            }
                        })),
                    ],
                },
            ],
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log(data);
        const result = data.choices[0].message.content;
        res.json({ result });
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