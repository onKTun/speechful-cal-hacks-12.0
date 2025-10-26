# Server Setup Guide

## Environment Variables

To enable AI feedback and visual sentiment analysis, you need to create a `.env` file in the `server/` directory with the following variables:

```env
# Deepgram API Key for speech-to-text transcription
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Lava API Configuration for AI model access (Claude API)
LAVA_BASE_URL=your_lava_base_url_here
MODEL_URL=your_model_url_here
LAVA_FORWARD_TOKEN=your_lava_forward_token_here
```

## Getting API Keys

### Deepgram API Key
1. Sign up at https://deepgram.com/
2. Navigate to your dashboard
3. Generate an API key
4. Copy the key to `DEEPGRAM_API_KEY`

### Lava API Configuration
These variables are for accessing the Claude AI model through a forward proxy.
Contact your API provider for:
- `LAVA_BASE_URL` - The base URL for the API endpoint
- `MODEL_URL` - The specific model endpoint URL
- `LAVA_FORWARD_TOKEN` - Your authentication token

## Quick Setup

1. Create the `.env` file:
   ```bash
   cd server
   touch .env
   ```

2. Add your API keys to the `.env` file

3. Restart your server:
   ```bash
   npm start
   ```

## Testing

Once configured, you can test the endpoints:

- **Visual Sentiment**: `POST http://localhost:3000/sentiment/visual`
- **AI Feedback**: `POST http://localhost:3000/feedback`

Check the server console for any API errors.

