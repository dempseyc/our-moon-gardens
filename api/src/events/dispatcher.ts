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
      const { glyph_name, sprites, source_type, position, footprint } = event.payload;
      const [plot_num, x, y, z] = position;

      // Create a sticker object to place in the Great Moon Hall
      const sticker = {
        glyph_name,
        sprites,
        source_type,
        position: [plot_num, x, y, z],
        footprint,
        placedAt: Date.now()
      };

      moonHall.placeSticker(sticker);

      console.log("Sticker placed in Great Moon Hall");

      // Return the placed sticker event to broadcast to all clients
      return {
        type: "STICKER_PLACED",
        payload: { sticker }
      };

    default:
      console.log("UNKNOWN EVENT:", event);
  }
}

export function getMoonHall() {
  return moonHall;
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