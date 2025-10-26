# Speechful: Cal Hacks 12.0

## Inspiration

Public speaking can be intimidating, and practicing alone often lacks meaningful feedback. We wanted to create a tool that provides real-time, personalized coaching, helping users improve confidence, clarity, and engagement.

## What it does

Speechful is a public speaking coaching app that analyzes your speech in real-time and gives personalized feedback. It evaluates factors like sentiment, confidence, and speech familiarity, helping users refine both content and delivery.

## How we built it

- Frontend: React + TypeScript for a clean and responsive interface where users can record speeches and see feedback.
- Backend: Node.js + Express to handle API requests, process data, and return actionable insights.
- Speech Analysis:
  - Claude API and Lava API for sentiment analysis, scoring the speaker’s confidence and engagement.
  - Voice detection AI APIs to track how well the user is familiar with their speech (intonation, pauses, and fluency).
- Live Feedback: Combines the above metrics to provide personalized advice on pacing, clarity, and emotional impact.

## Challenges we ran into

- Integrating multiple AI APIs and ensuring their outputs were consistent and interpretable.
- Real-time processing: delivering feedback without noticeable lag.
- Designing actionable feedback, presenting insights in a way that’s easy for users to act on without overwhelming them.

## Accomplishments that we're proud of

- Successfully integrated Claude and Lava APIs for sentiment scoring and personalized feedback.
- Built a working prototype that tracks speech familiarity and provides actionable coaching.
- Designed a real-time dashboard that gives intuitive, immediate insights during practice sessions.

## What we learned

- Combining multiple AI APIs can create rich, multidimensional feedback for users.
- Real-time processing requires careful optimization to maintain responsiveness.
- Personalized feedback is far more effective than generic tips as users respond better when advice is tailored to their own performance.

## What's next for Speechful

- Add tone and emotion detection to give more nuanced feedback.
- Introduce progress tracking over multiple sessions to help users see improvement over time.
- Expand multilingual support for non-English speakers.
- Build a mobile version for on-the-go practice.

## Running Speechful Locally

To run Speechful on your local machine, follow these steps:

1. **Start the server**  
   ```bash
   cd server
   npm install
   node app.js
2. **Start the client**
   ```bash
   cd ../client
   npm install
   npm run dev
3. **Open the app**
   Once both server & client are up, open your browser and navigate to URL shown.
