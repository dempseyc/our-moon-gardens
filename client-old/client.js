// filepath: client/client.js
const STICKERS = [
  "stepstone.png",
  "squarehedges.png",
  "horizontalbarrier.png",
  "verticalbarrier.png",
  "shrubbery.png",
  "puddle.png",
  "birdbath.png",
  "masonry.png",
  "bigrocks.png"
];

let selectedSticker = null;
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

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("RECEIVED:", data);
  document.getElementById("log").textContent += "\n" + JSON.stringify(data);
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM ready, setting up...");

  // Load sticker picker
  const picker = document.getElementById("sticker-picker");
  STICKERS.forEach((name) => {
    const img = document.createElement("img");
    img.src = `assets/native_stickers/${name}`;
    img.className = "sticker-thumb";
    img.onclick = () => {
      console.log("Selected sticker:", name);
      document.querySelectorAll(".sticker-thumb").forEach((el) => el.classList.remove("selected"));
      img.classList.add("selected");
      selectedSticker = name;
    };
    picker.appendChild(img);
  });

  // Plot click to place
  const plot = document.getElementById("plot");
  plot.onclick = (e) => {
    console.log("Plot clicked at", e.clientX, e.clientY);
    if (!selectedSticker) {
      alert("Select a sticker first!");
      return;
    }
    const rect = plot.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 32);
    const y = Math.floor((e.clientY - rect.top) / 32);
    
    // Show locally
    const el = document.createElement("div");
    el.className = "placed-sticker";
    el.style.left = x * 32 + "px";
    el.style.top = y * 32 + "px";
    el.style.backgroundImage = `url(assets/native_stickers/${selectedSticker})`;
    el.style.backgroundSize = "cover";
    plot.appendChild(el);
    
    // Send to backend
    ws.send(JSON.stringify({
      type: "PLACE_STICKER",
      payload: {
        plotId: "plot_0",
        sticker: selectedSticker,
        x: x,
        y: y
      }
    }));
  };
});

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