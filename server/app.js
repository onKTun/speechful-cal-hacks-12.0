const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const multer = require("multer");
const WebSocket = require("ws");
const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const server = http.createServer(app); // Wrap it in HTTP server
const wss = new WebSocket.WebSocketServer({ server });

const PORT = 3000;

const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);
let keepAlive;

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Checks validness of response from Claude (ideally, this should always return true, but we never know)
function getValues(str) {
    try {
        // Check if the response is a string and follows the expected format
        if (!str || !str.content || !str.content[0] || !str.content[0].text) {
            console.error("Invalid response structure:", str);
            return [-1, -1, -1];
        }
        
        const text = str.content[0].text;
        // Try to match JSON in code blocks first
        let match = text.match(/```json\s*([\s\S]*?)\s*```/);
        let jsonString = match ? match[1] : text.trim();
        
        const data = JSON.parse(jsonString);
        
        // Validate required fields exist and are numbers
        if (typeof data.facial_expression !== 'number' || 
            typeof data.eye_contact !== 'number' || 
            typeof data.focus !== 'number') {
            console.error("Missing or invalid fields in response:", data);
            return [-1, -1, -1];
        }
        
        return [data.facial_expression, data.eye_contact, data.focus];
    } catch (e) {
        console.error("Error parsing sentiment response:", e.message);
        console.log("Raw response text:", str?.content?.[0]?.text);
        return [-1, -1, -1];
    }
}

app.post('/sentiment/visual', async (req, res) => {
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
                            text: `For each of the following three following categories, give a score from 1 to 10 regarding how well the user is practicing good public speaking.
                            A 1 means poor performance (i.e. doesn't look like they're presenting or they're not on the screen) and 10 is good (don't be afraid to give 10s commonly).
                            This means like looking at the camera when talking (or at least looking near the camera; just as long as it's not far off), and
                            not fidgeting around or looking distracted. Also, do not deduct points for a slightly blurry camera (deduct if really blurry) or lighting (or anything beyond the user's control).
                            Be more extreme with your judgements (both positive and negative).
                            1) Facial expression - how friendly and engaged they appear
                            2) Eye contact - how well they look at the camera/audience
                            3) Focus - how still and attentive they are (not fidgeting)
                            Format the output as a JSON: {facial_expression: ___, eye_contact: ___, focus: ___}. DO NOT SEND ANYTHING OTHER THAN THE JSON AND NO FORMATTING OUTSIDE OF THE OUTERMOST BRACES.`
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
        const result = getValues(data);
        console.log(result);
        //const result = data.choices[0].message.content;
        // if (!isValidClaudeJsonResponse(data.content[0].text)) {
        //     data.content[0].text = '```json\n{"facial_expression": 5, "eye_contact": 5, "focus": 5}\n```'
        // }
        res.json({ result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to analyze visual sentiment', details: err.message });
    }
});

// Handle stt websocket/deppgram connection
const setupDeepgram = (ws) => {
  const deepgram = deepgramClient.listen.live({
    smart_format: false,
    interim_results:true,
    utterance_end_ms: 1000,
    vad_events: true,
    endpointing: 300,
    model: "nova-3",
  });

  if (keepAlive) clearInterval(keepAlive);
  keepAlive = setInterval(() => {
    console.log("deepgram: keepalive");
    deepgram.keepAlive();
  }, 10 * 1000);

  deepgram.addListener(LiveTranscriptionEvents.Open, async () => {
    console.log("deepgram: connected");

    deepgram.addListener(LiveTranscriptionEvents.Transcript, (data) => {
      console.log(
        "deepgram: transcript received: " +
          data.channel.alternatives[0].transcript
      );
      console.log("ws: transcript sent to client");
      ws.send(JSON.stringify(data));
    });

    deepgram.addListener(LiveTranscriptionEvents.Close, async () => {
      console.log("deepgram: disconnected");
      clearInterval(keepAlive);
      deepgram.finish();
    });

    deepgram.addListener(LiveTranscriptionEvents.Error, async (error) => {
      console.log("deepgram: error received");
      console.error(error);
    });

    deepgram.addListener(LiveTranscriptionEvents.Warning, async (warning) => {
      console.log("deepgram: warning received");
      console.warn(warning);
    });

    deepgram.addListener(LiveTranscriptionEvents.Metadata, (data) => {
      console.log("deepgram: metadata received");
      console.log("ws: metadata sent to client");
      ws.send(JSON.stringify({ metadata: data }));
    });
  });

  return deepgram;
};

wss.on("connection", (ws) => {
  console.log("ws: client connected");
  let deepgram = setupDeepgram(ws);

  ws.on("message", (message) => {
    console.log("ws: client data received");

    if (deepgram.getReadyState() === 1 /* OPEN */) {
      console.log("ws: data sent to deepgram");
      deepgram.send(message);
    } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
      console.log("ws: data couldn't be sent to deepgram");
      console.log("ws: retrying connection to deepgram");
      /* Attempt to reopen the Deepgram connection */
      deepgram.finish();
      deepgram.removeAllListeners();
      deepgram = setupDeepgram(ws);
    } else {
      console.log("ws: data couldn't be sent to deepgram");
    }
  });

  ws.on("close", () => {
    console.log("ws: client disconnected");
    deepgram.finish();
    deepgram.removeAllListeners();
    deepgram = null;
  });
});

app.post('/feedback', async(req, res) => {
    const averagedRatings = req.body.averagedRatings;
    console.log("Received averaged ratings:", averagedRatings);

    // Validate the input data
    if (!averagedRatings || !Array.isArray(averagedRatings) || averagedRatings.length !== 3) {
        console.error("Invalid averagedRatings format:", averagedRatings);
        return res.status(400).json({ error: 'Invalid data format', details: 'Expected averagedRatings to be an array of 3 categories' });
    }

    for (let i = 0; i < averagedRatings.length; i++) {
        if (!Array.isArray(averagedRatings[i]) || averagedRatings[i].length !== 3) {
            console.error(`Invalid category ${i} format:`, averagedRatings[i]);
            return res.status(400).json({ error: 'Invalid data format', details: `Category ${i} must be an array of 3 values [avg, min, max]` });
        }
        // Check for NaN or invalid numbers
        if (averagedRatings[i].some(val => typeof val !== 'number' || isNaN(val))) {
            console.error(`Invalid values in category ${i}:`, averagedRatings[i]);
            return res.status(400).json({ error: 'Invalid data format', details: `Category ${i} contains invalid numbers` });
        }
    }

    try {
        const url = `${process.env.LAVA_BASE_URL}/forward?u=${process.env.MODEL_URL}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.LAVA_FORWARD_TOKEN,
            'anthropic-version': '2023-06-01'
        };
 
        const requestBody = {
            model: 'claude-haiku-4-5',
            max_tokens: 500,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `You are a presentation coach analyzing a speaker's performance metrics.

                                    Here are the speaker's ratings (each category has: average, minimum, maximum - in this order - on a 1-10 scale):
                                    - Facial Expression (friendliness & engagement): [${averagedRatings[0].join(', ')}]
                                    - Eye Contact: [${averagedRatings[1].join(', ')}]
                                    - Focus (fidgeting & engagement): [${averagedRatings[2].join(', ')}]

                                    Based on these metrics, provide feedback in this exact format:
                                    1. One bullet point highlighting what the speaker does well
                                    2. Three bullet points on areas to improve

                                    Each point should be 1-2 sentences, written directly to the speaker, and include specific, actionable advice. For example: "You're fidgeting too much, which makes you appear less confident. Try keeping your hands visible and still, or use controlled gestures to emphasize key points."

                                    Focus on translating the metrics into tangible, observable behaviors the speaker can work on. Do not mention scores anywhere, as the feedback should be primarily qualitative. Jump straight into the bullet points, no need to preface with something like "Your presentation feedback" It
                                    is good to separate the bullet points with "What you do well:" and "Areas to Improve", though.`
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
        console.log("AI API response:", data);
        
        // Handle the response structure
        if (!data || !data.content || !data.content[0] || !data.content[0].text) {
            console.error("Invalid API response structure:", data);
            return res.status(500).json({ error: 'Invalid API response format', details: 'Missing content.text in response' });
        }
        
        const result = data.content[0].text;
    
        res.json({ result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate feedback', details: err.message });
    }

});


server.listen(PORT, (error) =>{
    if(!error) {
        console.log(`Server is running on https://localhost:${PORT}`);}
    else
        console.log("Error occured, ", error);
}); 