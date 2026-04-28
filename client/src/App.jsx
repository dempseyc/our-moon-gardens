// filepath: client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';

const STICKERS = [
  "ourmoongardens2.svg",
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

const PLOT_SIZE = 500;
const CELL_SIZE = 32;

function App() {
  const [ws, setWs] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [placedStickers, setPlacedStickers] = useState([]);
  const [log, setLog] = useState([]);
  const plotRef = useRef(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://127.0.0.1:3001");

    websocket.onopen = () => {
      addLog("WS OPEN");
    };

    websocket.onerror = (e) => {
      addLog("WS ERROR: " + e);
    };

    websocket.onclose = () => {
      addLog("WS CLOSED");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addLog("RECEIVED: " + JSON.stringify(data));
      
      // Handle broadcasted sticker placements
      if (data.type === "STICKER_PLACED") {
        const { sticker, x, y } = data.payload;
        setPlacedStickers(prev => [...prev, { sticker, x, y }]);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const addLog = (msg) => {
    setLog(prev => [...prev.slice(-20), msg]);
  };

  const handleStickerClick = (sticker) => {
    setSelectedSticker(sticker);
    addLog("Selected: " + sticker);
  };

  const handlePlotClick = (e) => {
    if (!selectedSticker) {
      alert("Select a sticker first!");
      return;
    }

    const rect = plotRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    // Add locally
    setPlacedStickers(prev => [...prev, { sticker: selectedSticker, x, y }]);

    // Send to backend
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "PLACE_STICKER",
        payload: {
          plotId: "plot_0",
          sticker: selectedSticker,
          x,
          y
        }
      }));
      addLog("Sent PLACE_STICKER: " + selectedSticker + " at (" + x + "," + y + ")");
    }
  };

  return (
    <div className="app">
      <h1>🌙 Our Moon Gardens</h1>
      
      <h2>Choose a Sticker</h2>
      <div className="sticker-picker">
        {STICKERS.map(name => (
          <img
            key={name}
            src={`/assets/native_stickers/${name}`}
            className={`sticker-thumb ${selectedSticker === name ? 'selected' : ''}`}
            onClick={() => handleStickerClick(name)}
            alt={name}
          />
        ))}
      </div>
      
      <h2>Plot 0 (click to place)</h2>
      <div 
        ref={plotRef}
        className="plot"
        onClick={handlePlotClick}
      >
        {placedStickers.map((s, i) => (
          <div
            key={i}
            className="placed-sticker"
            style={{
              left: s.x * CELL_SIZE,
              top: s.y * CELL_SIZE,
              backgroundImage: `url(/assets/native_stickers/${s.sticker})`
            }}
          />
        ))}
      </div>

      <div className="log">
        <h3>Log</h3>
        <pre>{log.join('\n')}</pre>
      </div>
    </div>
  );
}

export default App;
