import { dispatch } from "./dispatcher.js";

export function attachEventSystem(socketServer, context) {
  socketServer.on("connection", (socket) => {
    socket.on("message", (msg) => {
      const event = JSON.parse(msg.toString());
      dispatch(event, context);
    });
  });
}