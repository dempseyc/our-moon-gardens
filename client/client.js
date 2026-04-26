const ws = new WebSocket("ws://127.0.0.1:3001");

ws.onopen = () => {
  console.log("WS OPEN");
};

ws.onerror = (e) => {
  console.log("WS ERROR", e);
};

ws.onclose = () => {
  console.log("WS CLOSED");
};

function sendTest() {
  ws.send(JSON.stringify({
    type: "TEST",
    payload: { msg: "hello" }
  }));
}

function sendMove() {
  ws.send(JSON.stringify({
    type: "MOVE",
    payload: { x: Math.random(), y: Math.random() }
  }));
}

window.sendTest = sendTest;
window.sendMove = sendMove;