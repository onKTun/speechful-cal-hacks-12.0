# AI Agent Instructions for Speechful

This document guides AI coding agents on effectively working with the Speechful codebase - a React-based speech coaching application that provides real-time feedback on public speaking practice.

## Project Architecture

- **Client (`/client`)**: React + TypeScript + Vite frontend
  - `src/WebcamCapture.tsx`: Main speech coaching interface
  - `src/components/SpeechCoach/`: Core coaching UI components
  - `src/hooks/useSentimentCapture.ts`: Custom hook for sentiment analysis
- **Server (`/server`)**: Express.js backend
  - `app.js`: API endpoints for sentiment analysis using GPT-4 Vision

## Key Workflows

### Development Setup

1. Start the server:

```bash
cd server
node app.js  # Runs on port 3000
```

2. Start the client:

```bash
cd client
npm run dev  # Development server with HMR
```

### Architecture Patterns

1. **Component Organization**:

   - Core speech coaching logic in `WebcamCapture.tsx`
   - Modular UI components in `components/SpeechCoach/`
   - Custom hooks in `hooks/` for reusable logic

2. **State Management**:

   - Component-local state for UI elements
   - Custom hooks for complex logic (e.g., `useSentimentCapture`)

3. **API Integration**:
   - Server endpoints at `http://localhost:3000`
   - Sentiment analysis uses base64 encoded webcam images

## Critical Integration Points

1. **Sentiment Analysis Flow**:

   - Webcam capture every 5 seconds (`useSentimentCapture.ts`)
   - Images sent to `/sentiment` endpoint
   - GPT-4 Vision analysis via LAVA proxy

2. **Speech Practice Modes**:
   - Learning mode: Delayed transcript display based on difficulty
   - Rehearsal mode: Immediate transcript display

## Project Conventions

1. **Component Structure**:

   ```tsx
   // Example from SessionScreen.tsx
   interface ComponentProps {
     // Props interface at top
   }

   export const Component: React.FC<ComponentProps> = ({}) => {
     // State/hooks
     // Effects
     // Event handlers
     // Render JSX
   };
   ```

2. **Theme Handling**:
   - Dark/light theme via `useTheme` hook
   - Theme-aware styles using Tailwind classes

## Common Tasks

1. **Adding New UI Components**:

   - Create in `components/SpeechCoach/`
   - Import and compose in `WebcamCapture.tsx`

2. **Modifying Sentiment Analysis**:

   - Update capture interval in `useSentimentCapture.ts`
   - Adjust prompt/scoring in server's `/sentiment` endpoint

3. **Extending Practice Modes**:
   - Add mode type in `types/index.ts`
   - Implement mode logic in `WebcamCapture.tsx`
