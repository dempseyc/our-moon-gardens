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
      const { glyph_name, sprites, source_type, position, footprint, layer, displayWidth } = event.payload;
      const [plot_num, x, y, z] = position;

      // Create a sticker object to place in the Great Moon Hall
      const sticker = {
        glyph_name,
        sprites,
        source_type,
        position: [plot_num, x, y, z],
        footprint,
        layer,
        displayWidth,
        placedAt: Date.now()
      };

      const placedSticker = moonHall.placeSticker(sticker);

      console.log("Sticker placed in Great Moon Hall");

      // Return the placed sticker event to broadcast to all clients
      return {
        type: "STICKER_PLACED",
        payload: { sticker: placedSticker }
      };

    case "REMOVE_STICKER":
      console.log("REMOVE_STICKER EVENT:", event.payload);
      const removalSuccess = moonHall.removeSticker(event.payload.stickerId);
      if (removalSuccess) {
        console.log("Sticker removed from Great Moon Hall");
        return {
          type: "STICKER_REMOVED",
          payload: { stickerId: event.payload.stickerId }
        };
      }
      console.log("Sticker removal failed, not found:", event.payload.stickerId);
      return null;

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