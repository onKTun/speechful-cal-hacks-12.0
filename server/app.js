const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const ws = require("ws");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const PORT = 3000;

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.post("/sentiment", async (req, res) => {
  const { base64Image } = req.body;

  // Check if environment variables are set
  if (!process.env.LAVA_BASE_URL || !process.env.LAVA_FORWARD_TOKEN) {
    return res.json({
      result:
        "Environment variables not configured. Please set LAVA_BASE_URL and LAVA_FORWARD_TOKEN in your .env file. Simulated feedback: Good posture and eye contact detected. Score: 7/10",
    });
  }

  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const url = `${process.env.LAVA_BASE_URL}/forward?u=https://api.openai.com/v1/chat/completions`;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LAVA_FORWARD_TOKEN}`,
    };

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Take the following image. Give some feedback regarding how well the user is practicing good public speaking. This means things like looking at the camera when talking and not fidgeting or looking distracted. Give one sentence of feedback and a score from 0 - 10, 0 being bad and 10 being good.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${cleanBase64}`,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;
    res.json({ result });
  } catch (err) {
    console.error(err);
  }
});

app.post("/audio-sentiment", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file provided" });
  }

  try {
    // For now, we'll simulate audio analysis since the current API doesn't support audio
    // In a real implementation, you would use a speech-to-text service or audio analysis API
    const audioSize = req.file.buffer.length;
    const duration = audioSize / 16000; // Rough estimate based on typical audio bitrate

    // Simulate analysis based on audio characteristics
    let score = 5; // Base score
    let feedback = "Audio analysis not fully implemented. ";

    if (audioSize > 1000) {
      // If there's substantial audio data
      score += 2;
      feedback += "Good audio presence detected. ";
    }

    if (duration > 2) {
      // If speaking for more than 2 seconds
      score += 1;
      feedback += "Sustained speech detected. ";
    }

    // Add some randomness to make it more realistic
    score += Math.floor(Math.random() * 3) - 1;
    score = Math.max(0, Math.min(10, score));

    if (score >= 8) {
      feedback += "Excellent audio quality and delivery!";
    } else if (score >= 6) {
      feedback += "Good audio quality with room for improvement.";
    } else if (score >= 4) {
      feedback += "Audio quality needs improvement.";
    } else {
      feedback +=
        "Audio quality is poor, consider speaking louder and clearer.";
    }

    const result = `${feedback} Score: ${score}/10`;
    res.json({ result });
  } catch (err) {
    console.error("Audio sentiment error:", err);
    res.status(500).json({ error: "Failed to process audio" });
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(JSON.stringify(process.env.LAVA_FORWARD_TOKEN));
    console.log(`Server is running on https://localhost:${PORT}`);
  } else console.log("Error occured, ", error);
});

//deepgram and learning mode backend

const wss = new ws.WebSocketServer({ port: 8080 });

// Connect to Deepgram Live Transcription websocket
const apiKey = process.env.DEEPGRAM_API_KEY;
const headers = {
  Authorization: `Token ${apiKey}`,
};

const deepgram = new ws.WebSocket(`wss://api.deepgram.com/v1/listen`, headers);

deepgram.on("open", ()=>{
    console.log("Deepgram WebSocket connection established.");
} )

wss.on("connection", async (client) => {
  console.log("Client connected");

  client.on("message", (audioChunk) => {
    if (deepgram.readyState === WebSocket.OPEN) {
      deepgram.send(audioChunk);
    }
  });

  deepgram.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.channel?.alternatives[0]?.transcript) {
      client.send(data.channel.alternatives[0].transcript);
    }
  });

  //client.on("message",()=>{client.send("audio recieved");} )
});
