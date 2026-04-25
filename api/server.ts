import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

const ws = new WebSocket("ws://localhost:3001");

ws.onopen = () => console.log("OPEN");
ws.onerror = (e) => console.log("ERROR", e);
ws.onmessage = (m) => console.log("MESSAGE", m.data);

const context = {
  // empty for now (you fill later)
};

console.log("Moon Gardens socket running on ws://localhost:3001");


wss.on("listening", () => {
  console.log("WebSocket is listening");
});