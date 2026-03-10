const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
const crypto = require("crypto");

const app = express();
app.use(cors());

const API_KEY = "devkey";
const API_SECRET = "secret";
const LIVEKIT_WS = "ws://localhost:7880";

app.get("/token", async (req, res) => {
  const { room, role } = req.query;

  if (!room) {
    return res.status(400).json({ error: "room is required" });
  }

  const identity =
    req.query.identity ||
    `user_${crypto.randomUUID().slice(0, 8)}`;

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity,
    metadata: role === "host" ? "host" : "viewer",
  });

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: role === "host",
    canPublishData: true,
    canSubscribe: true,
  });

  // ✅ THIS IS THE FIX
  const jwt = await at.toJwt();

  res.json({
    room,
    identity,
    role: role || "viewer",
    wsUrl: LIVEKIT_WS,
    token: jwt,
  });
});

app.listen(3000, () => {
  console.log("✅ LiveKit backend running on http://localhost:3000");
});
