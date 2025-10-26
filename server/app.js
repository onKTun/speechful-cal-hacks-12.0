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
    // Check if the response is a string and follows the expected format
    const text = str.content[0].text;

    const match = text.match(/```json\s*([\s\S]*?)\s*```/);

    if (match) {
        const jsonString = match[1];
        const data = JSON.parse(jsonString);
        return [data.facial_expression, data.eyesight, data.focus];
    }
    console.log(text);
    return [-1, -1, -1];
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
                            not fidgeting around or looking distracted. Also, do not deduct points for a slightly blurry camera (deduct if really blurry) or lighting (or anything beyond the user's control).
                            Be more extreme with your judgements (both positive and negative).
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
        const result = getValues(data);
        console.log(result);
        //const result = data.choices[0].message.content;
        // if (!isValidClaudeJsonResponse(data.content[0].text)) {
        //     data.content[0].text = '```json\n{"facial_expression": 5, "eyesight": 5, "focus": 5}\n```'
        // }
        res.json({ result });
    } catch (err) {
        console.error(err);
    }
});

// Handle stt websocket/deppgram connection
const setupDeepgram = (ws) => {
  const deepgram = deepgramClient.listen.live({
    smart_format: true,
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
      console.log("deepgram: transcript received");
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


server.listen(PORT, (error) =>{
    if(!error) {
        console.log(`Server is running on https://localhost:${PORT}`);}
    else
        console.log("Error occured, ", error);
});