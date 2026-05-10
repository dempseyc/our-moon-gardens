// filepath: client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
// @ts-ignore: allow import of CSS without declaration file
import './App.css';
// @ts-ignore: allow import of JSON without declaration file
import { NATIVE_GLYPHS } from '@shared/native_glyphs';
import { on } from 'ws';

// component for displaying a sticker, consuming a spritesheet and coordinates, or an image url
const Glyph = (props) => {
  const { name, source_type, sprites, footprint } = props;

  if (source_type === "spritesheet") {
    const backgroundSize = '512px 512px'; // size of the entire spritesheet
    const x = sprites[0].x + 1; // add 1px padding to avoid bleeding from adjacent sprites
    const y = sprites[0].y;
    const w = sprites[0].w;
    const h = sprites[0].h;
    const backgroundPosition = `-${x}px -${y}px`;
    return (
      <div className="sticker" style={{ backgroundImage: `url(${NATIVE_GLYPHS.meta.sprite_sheet})`, backgroundSize, backgroundPosition, width: w, height: h, backgroundRepeat: 'no-repeat' }} />
    );
  }
  else if (source_type === "file" || source_type === "link") {

    const [imgSize, setImgSize] = useState({ width: 64, height: 64 });
    useEffect(() => {
      const img = new Image();
      img.onload = () => {
        setImgSize({ width: img.width, height: img.height });
      };
      img.src = sprites[0];
    }, [sprites]);

    return (
      <div className="sticker" style={{ backgroundImage: `url(${sprites[0]})`, width: imgSize.width, height: imgSize.height, backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />
    );
  }
  else console.error("Unknown source_type for glyph: " + name);
  return null;
};

// a placed sticker, which has a glyph, and x,y, z coordinates for layering
const Sticker = (props) => {
  const { glyph_name, sprites, source_type, position, footprint } = props;
  // console.log("Rendering sticker:", glyph_name, "at position", position);
  return (
    <div className="sticker" style={{ position: 'absolute', left: position[1], top: position[2] * 0.75 + 48, zIndex: position[3] }}>
      <Glyph
        name={glyph_name}
        source_type={source_type}
        sprites={sprites}
        footprint={footprint}
      />
    </div>
  );
}


const GlyphBox = ({ onSelect }) => {
  return (
    <>{
      NATIVE_GLYPHS.glyphs.map((glyph, i) => {
        const { name, source_type, sprites, footprint } = glyph;
        return (
          < div key={i} >
            <div onClick={() => onSelect(glyph)}>
              <Glyph
                name={name}
                source_type={source_type}
                sprites={sprites}
                footprint={footprint} />
            </div>
            <div className="sticker-label">{glyph.name}</div>
          </div>
        );
      })
    }
    </>
  );
}


const PLOT_SIZE = 512; // in pixels, should match the size of the spritesheet for simplicity  
const CELL_SIZE = 64; // 20x20 grid in each plot

function App() {
  const [ws, setWs] = useState(null);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [log, setLog] = useState([]);
  const plotRef = useRef(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

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

      // Handle initial stickers load
      if (data.type === "STICKERS_UPDATE") {
        console.log("Received initial stickers:", data.payload);
        setStickers(data.payload)
      }

      // Handle broadcasted sticker placements
      if (data.type === "STICKER_PLACED") {
        // console.log("Received sticker placement:", data.payload);
        setStickers(prev => [...prev, data.payload.sticker]);
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

  const handlePlotClick = (e) => {
    if (!selectedGlyph) {
      console.log("Select a sticker first!");
      return;
    }

    const rect = plotRef.current.getBoundingClientRect();
    let plot_x = e.clientX - rect.left - 32;
    let plot_y = (e.clientY - rect.top - 128 - 24) * 1.33;
    const grid_x = Math.floor(plot_x / CELL_SIZE);
    const grid_y = Math.floor(plot_y / CELL_SIZE);

    if (snapToGrid) {
      plot_x = grid_x * CELL_SIZE;
      plot_y = grid_y * CELL_SIZE;
    }

    if (plot_x < 0 || plot_x > PLOT_SIZE || plot_y < 0 || plot_y > PLOT_SIZE) {
      console.log("Clicked outer space");
      return;
    }

    // Add locally to indicate sticker placement immediately, before backend confirmation
    // setStickers(prev => [...prev, {
    //   glyph_name: selectedGlyph.name,
    //   sprites: selectedGlyph.sprites,
    //   source_type: selectedGlyph.source_type,
    //   position: [0, x, y, 0],
    //   footprint: selectedGlyph.footprint
    // }]);

    // Send to backend
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("Placing sticker:", selectedGlyph.name, "at plot 0, x:", grid_x, "y:", grid_y);
      let plot = 0; // for now we only have one plot, but this could be dynamic in the future
      ws.send(JSON.stringify({
        type: "PLACE_STICKER",
        payload: {
          glyph_name: selectedGlyph.name,
          sprites: selectedGlyph.sprites,
          source_type: selectedGlyph.source_type,
          position: [plot, plot_x, plot_y, 0],
          footprint: selectedGlyph.footprint
        }
      }));
      addLog("Sent PLACE_STICKER: " + selectedGlyph.name + " at (" + plot_x + "," + plot_y + ")");
    }
  };

  return (
    <div className="app">
      <h1>🌙 Our Moon Gardens</h1>

      <h2>Choose a Glyph</h2>
      <div className="sticker-picker">
        {<GlyphBox onSelect={setSelectedGlyph} />}
      </div>
      <div className="controls">
        <label>
          <input type="checkbox" checked={snapToGrid} onChange={() => setSnapToGrid(!snapToGrid)} />
          Snap to Grid
        </label>
      </div>

      <h2>Plot 0 (click to place)</h2>
      <div className="plot" ref={plotRef} onClick={handlePlotClick} style={{ width: PLOT_SIZE, height: PLOT_SIZE }}>
        {stickers && stickers.length > 0 && stickers.map((sticker, i) => (
          <Sticker key={i} {...sticker} />
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
