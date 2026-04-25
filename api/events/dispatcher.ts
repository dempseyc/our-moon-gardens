import { handlers } from "./handlers";
import { Event } from "./types";

export function dispatch(event: Event, context: any) {
  const handler = handlers[event.type];

  if (!handler) {
    console.warn("No handler for", event.type);
    return;
  }

  return handler(event, context);
}