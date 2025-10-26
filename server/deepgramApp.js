const dotenv = require("dotenv");
const ws = require("ws");

dotenv.config();

// Start a local WebSocket server for browsers to connect to
const wss = new ws.WebSocketServer({ port: 8080 }, () => {
  console.log("✅ Local WebSocket server listening on ws://localhost:8080");
});

const DEEPGRAM_URL = "wss://api.deepgram.com/v1/listen";
const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY;

if (!DEEPGRAM_KEY) {
  console.error("❌ Missing DEEPGRAM_API_KEY in .env");
  process.exit(1);
}

// Handle client connections
wss.on("connection", (client) => {
  console.log("🎙️ New client connected");

  // Create a Deepgram connection for this client
  const deepgram = new ws.WebSocket(DEEPGRAM_URL, {
    headers: { Authorization: `Token ${DEEPGRAM_KEY}` },
  });

  deepgram.on("open", () => {
    console.log("🔗 Connected to Deepgram");
  });

  deepgram.on("error", (err) => {
    console.error("❌ Deepgram connection error:", err);
  });

  // Forward client audio → Deepgram
  client.on("message", (audioChunk) => {
    if (deepgram.readyState === ws.WebSocket.OPEN) {
      deepgram.send(audioChunk);
    }
  });

  // Forward Deepgram transcripts → client
  deepgram.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      const transcript = data?.channel?.alternatives?.[0]?.transcript;
      if (transcript && transcript.length > 0) {
        client.send(transcript);
      }
    } catch (e) {
      console.error("Failed to parse Deepgram message:", e);
    }
  });

  // Cleanup when either side disconnects
  const closeAll = () => {
    if (deepgram.readyState === ws.WebSocket.OPEN) deepgram.close();
    if (client.readyState === ws.WebSocket.OPEN) client.close();
  };

  client.on("close", () => {
    console.log("🔌 Client disconnected");
    closeAll();
  });


  deepgram.on("close", (code, reason) => {
    console.log(`Deepgram closed connection: ${code} - ${reason}`);
    closeAll();
    // Optional: try reconnecting here
  });
 
});
