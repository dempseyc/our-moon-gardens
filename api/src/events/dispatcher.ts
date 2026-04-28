import { GreatMoonHall } from "../plots/topology.js";

// Global Great Moon Hall instance
const moonHall = new GreatMoonHall();

export function dispatch(event: any, context: any) {
  switch (event.type) {
    case "TEST":
      console.log("TEST EVENT:", event.payload);
      return { type: "TEST_ACK", payload: event.payload };

    case "MOVE":
      console.log("MOVE EVENT:", event.payload);
      return { type: "MOVE_ACK", payload: event.payload };

    case "PLACE_STICKER":
      console.log("PLACE_STICKER EVENT:", event.payload);
      const { plotId, sticker, x, y } = event.payload;
      
      // Parse plotId like "plot_0" -> 0
      const plotNum = parseInt(plotId.replace("plot_", ""));
      
      // y is floor position, z is back wall position (default to 0)
      moonHall.placeSticker(sticker, plotNum, x, y, 0);
      
      console.log("Sticker placed in Great Moon Hall");
      
      // Return the placed sticker event to broadcast to all clients
      return { 
        type: "STICKER_PLACED", 
        payload: { plotId, sticker, x, y, placedAt: Date.now() } 
      };

    default:
      console.log("UNKNOWN EVENT:", event);
  }
}

// Broadcast message to all connected clients
export function broadcast(message: any, clients: Set<any>) {
  const msg = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(msg);
    }
  }
}