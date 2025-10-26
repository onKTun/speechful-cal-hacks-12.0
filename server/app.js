const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

// Checks validness of response from Claude (ideally, this should always return true, but we never know)
function isValidClaudeJsonResponse(str) {
    // Check if the response is a string and follows the expected format
    if (typeof str !== "string") return false;

    // Check the triple-backtick JSON block
    const regex = /^```json\s*\n(\{[\s\S]*\})\s*\n```$/;
    const match = str.match(regex);

    if (!match) return false;

    let obj;
    try {
        obj = JSON.parse(match[1]);
    } catch (e) {
        return false;
    }

    // Check the required fields and that their values are integers 1-10
    const keys = ['facial_expression', 'eyesight', 'focus'];
    for (const key of keys) {
        if (!(key in obj)) return false;
        if (
            typeof obj[key] !== 'number' ||
            !Number.isInteger(obj[key]) ||
            obj[key] < 1 ||
            obj[key] > 10
        ) {
            return false;
        }
    }
    return true;
}

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
            max_tokens: 200,
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
                            text: `For each of the following three following categories, give a score from 1 to 10 regarding how well the user is practicing good public speaking.
                            A 1 means poor performance (i.e. doesn't look like they're presenting or they're not on the screen) and 10 is good (don't be afraid to give 10s commonly).
                            This means like looking at the camera when talking (or at least looking near the camera; just as long as it's not far off), and
                            not fidgeting around or looking distracted. Also, do not deduct points for a slightly blurry camera (deduct if really blurry) or lighting (or anything beyond the user's control). Do not deduct
                            points for closed eyes (since they might be blinking).
                            1) Facial expression
                            2) Eyesight
                            3) Focus
                            Format the output as a JSON: {facial_expression: ___, rating: ___, focus: ___}. DO NOT SEND ANYTHING OTHER THAN THE JSON AND NO FORMATTING OUTSIDE OF THE OUTERMOST BRACES.`
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
        // if (!isValidClaudeJsonResponse(data.content[0].text)) {
        //     data.content[0].text = '```json\n{"facial_expression": 5, "eyesight": 5, "focus": 5}\n```'
        // }
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