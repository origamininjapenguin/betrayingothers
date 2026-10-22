# Betrayal: The House

## Run locally
npm install && npm start  ->  http://localhost:3000

## Deploy on Render
1. Push this folder to a GitHub/GitLab repo (zip contents at the repo root).
2. Render dashboard -> New -> Web Service -> pick the repo.
3. Build command: `npm install`  Start command: `npm start`  (render.yaml sets this automatically if you use a Blueprint).
4. Open the onrender.com URL. WebSockets work over wss:// automatically.
Note: the free tier sleeps after inactivity and game state lives in memory, so a restart resets the game.

## Playing
Host a public or private game from the start menu and share the 4-letter room code or the ?room=CODE link. The host can add bots, swap humans for bots, and start the game. Game state lives in memory, so it resets if the server restarts.
