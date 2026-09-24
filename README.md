# AImong Us

A small web app for running the "AImong Us" party game: one round-question, one player secretly asks a real LLM, everyone else mimics an AI, and the group votes on who's who.

## Running locally

Two terminals, from the project root:

```bash
npm install
npm run dev            # starts the server on http://localhost:3001
```

```bash
cd client
npm install
npm run dev            # starts the Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in multiple browser tabs/windows to simulate multiple players. The dev server proxies `/socket.io` to the backend on port 3001.

## Building for production

```bash
npm run build           # installs client deps and builds client/dist
npm start               # serves client/dist + the Socket.io server from one process
```

## Deploying (Render)

`render.yaml` defines a single free-tier Render web service — connect the repo and Render will run `npm install && npm run build` then `npm start`. No database or extra services needed.

Render's free tier spins down after ~15 minutes idle with a cold start of 30-60s on the next request — open the app URL a minute or two before inviting players to a game night to avoid that delay.

## How a round works

1. From the lobby, the host assigns one connected player as "the AI" for the round and picks (or randomizes) a question.
2. Writing phase: the round's answerers type their answer; the AI-assigned player should paste in a real LLM's response instead of writing their own.
3. Discussion & voting phase: everyone chats and votes for who they think the AI is (can't vote for yourself).
4. Reveal: the AI is revealed and points are calculated automatically.

Settings (answerers per round, phase durations) are configurable from the host control panel in the lobby.
