export const handlers = {
  PLACE_STICKER: (event, ctx) => {
    const { nodes, edges, db } = ctx;

    // 1. create sticker node
    const sticker = nodes.create({
      type: "STICKER",
      data: event.payload
    });

    // 2. link to moon
    edges.create({
      from: event.payload.moonId,
      to: sticker.id,
      type: "CONTAINS"
    });

    // 3. persist action
    db.actions.insert(event);

    // 4. emit result
    ctx.broadcast({
      type: "STICKER_PLACED",
      payload: sticker
    });
  }
};