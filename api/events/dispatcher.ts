export function dispatch(event: any, context: any) {
  switch (event.type) {
    case "TEST":
      console.log("TEST EVENT:", event.payload);
      break;

    case "MOVE":
      console.log("MOVE EVENT:", event.payload);
      break;

    case "PLACE":
      console.log("PLACE EVENT:", event.payload);
      break;

    default:
      console.log("UNKNOWN EVENT:", event);
  }
}