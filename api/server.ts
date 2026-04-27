import { dispatch } from "./src/events/dispatcher.js";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (socket) => {
  console.log("client connected");

  // socket.on("message", (msg) => {
  //   console.log("RAW:", msg.toString());
  //   try {
  //     const data = JSON.parse(msg.toString());
  //     console.log("PARSED:", data);
  //   } catch (e) {
  //     console.log("NOT JSON"); //   }
  // });
  socket.on("message", (msg) => {
    const event = JSON.parse(msg.toString());
    dispatch(event, {});
  });
});

console.log("Moon Gardens WS running on 3001");