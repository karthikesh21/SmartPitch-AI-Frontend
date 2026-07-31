# SmartPitch AI

SmartPitch AI is a full stack sales pitch generator that combines a React frontend with an Express backend powered by Firebase and the Groq AI SDK. The app helps users generate email, LinkedIn, cold call, and ad copy pitches from product and audience inputs.

## Project Structure

- `frontend/client/` — React application
  - Components, pages, services, and styles for the UI
  - Uses `axios` to call the API via `REACT_APP_API_URL`
- `backend/sales-pitch-generator/server/` — Express API server
  - Routes for pitch generation and cold email/copy generation
  - Firebase admin integration and optional auth
  - Uses `groq-sdk` for AI completions

## Features

- Generate sales pitches using product + audience data
- Supports multiple output formats: email, LinkedIn, cold call, ad copy
- Optional Firebase-authenticated pitch history storage
- Separate frontend and backend for clear local development

## Getting Started

### 1. Install frontend dependencies

```bash
cd "frontend/client"
npm install
```

### 2. Install backend dependencies

```bash
cd "backend/sales-pitch-generator/server"
npm install
```

## Environment Variables

### Frontend

Create a `.env` file inside `frontend/client/` with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

This should point to the backend API root, because the frontend calls endpoints like `/pitch/generate` on top of this base URL.

### Backend

Create a `.env` file inside `backend/sales-pitch-generator/server/` with the following values:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
GROQ_API_KEY=your-groq-api-key
PORT=5000
NODE_ENV=development
```

> Do not commit secrets to source control.

## Running Locally

### Backend

```bash
cd "backend/sales-pitch-generator/server"
npm run dev
```

This starts the Express server on the configured `PORT` (default `5000`).

### Frontend

```bash
cd "frontend/client"
npm start
```

The React app starts in development mode and uses `REACT_APP_API_URL` to connect to the backend.

## API Endpoints

The backend exposes these routes under `/api/pitch`:

- `POST /api/pitch/generate`
  - Request body: `{ product, audience, framework }`
  - Generates a full sales pitch using the selected framework
- `POST /api/pitch/cold-mail`
  - Request body: `{ productName, productDescription, targetRole, problem, valueProposition }`
  - Returns structured cold outreach copy in JSON

## Frontend Routes

- `/` — Home page
- `/generator` — Protected pitch generator page
- `/linkedin` — LinkedIn sales flow page
- `/login` — Login page
- `/signup` — Signup page
- `/terms` — Terms & Conditions
- `/privacy` — Privacy Policy

## Notes

- The backend uses Firebase Admin SDK for optional token verification.
- The AI service currently uses the `groq-sdk` and a `llama-3.3-70b-versatile` model.
- The frontend uses `react-router-dom` for routing and `axios` for API calls.

## Troubleshooting

- If the frontend cannot reach the backend, verify `REACT_APP_API_URL` in `frontend/client/.env`.
- If the backend fails to initialize Firebase, verify the three Firebase env vars and ensure `FIREBASE_PRIVATE_KEY` preserves line breaks.
- For CORS issues, confirm the backend server is running and accepting requests from the frontend origin.

## License

This repository does not include a license file.
