import { dispatch, broadcast, getMoonHall } from "./src/events/dispatcher.js";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

// Track all connected clients
const clients = new Set();

wss.on("connection", (socket) => {
  console.log("client connected");
  clients.add(socket);

  // Send current stickers to new client
  const moonHall = getMoonHall();
  const stickers = moonHall.getAllStickers();
  if (stickers.length > 0) {
    socket.send(JSON.stringify({
      type: "STICKERS_UPDATE",
      payload: stickers
    }));
  }

  socket.on("message", (msg) => {
    const event = JSON.parse(msg.toString());
    const result = dispatch(event, {});

    // Broadcast to all clients (including sender for sync)
    if (result) {
      broadcast(result, clients);
    }
  });

  socket.on("close", () => {
    console.log("client disconnected");
    clients.delete(socket);
  });
});

console.log("Moon Gardens WS running on 3001");