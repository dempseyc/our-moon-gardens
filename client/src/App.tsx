// filepath: client/src/App.jsx
import { useState, useEffect, useRef } from 'react';
// @ts-ignore: allow import of CSS without declaration file
import './App.css';
// @ts-ignore: allow import of JSON without declaration file
import { NATIVE_GLYPHS } from '@shared/native_glyphs';

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
  const spriteHeight = sprites?.[0]?.h ?? 64;
  // console.log("Rendering sticker:", glyph_name, "at position", position);
  return (
    <div className='sticker with doubles'>

      <div className="sticker" style={{ position: 'absolute', left: position[1], top: position[2] * 0.75 + 128 - spriteHeight, zIndex: position[3] }}>
        <Glyph
          name={glyph_name}
          source_type={source_type}
          sprites={sprites}
          footprint={footprint}
        />
      </div>
      <div className="sticker double_left" style={{ position: 'absolute', left: position[1] - TOTAL_HALL_WIDTH, top: position[2] * 0.75 + 128 - spriteHeight, zIndex: position[3] }}>
        <Glyph
          name={glyph_name}
          source_type={source_type}
          sprites={sprites}
          footprint={footprint}
        />
      </div>
      <div className="sticker double_right" style={{ position: 'absolute', left: position[1] + TOTAL_HALL_WIDTH, top: position[2] * 0.75 + 128 - spriteHeight, zIndex: position[3] }}>
        <Glyph
          name={glyph_name}
          source_type={source_type}
          sprites={sprites}
          footprint={footprint}
        />
      </div>
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
          </div>
        );
      })
    }
    </>
  );
}

const CustomCursor = ({ selectedGlyph, selectedTool, mouseCoords }) => {
  if (!mouseCoords.isOverPlot) return null;

  const spriteWidth = selectedGlyph?.sprites?.[0]?.w ?? 64;
  const spriteHeight = selectedGlyph?.sprites?.[0]?.h ?? 64;
  const cursorStyle = {
    position: 'absolute' as const,
    left: (mouseCoords.localX ?? mouseCoords.clientX) - spriteWidth / 2,
    top: (mouseCoords.localY ?? mouseCoords.clientY) - (spriteHeight - 12),
    pointerEvents: 'none' as const,
    zIndex: 1000,
    opacity: 0.8,
    width: spriteWidth,
    height: spriteHeight,
  };

  if (selectedTool === "erase") {
    return (
      <div style={cursorStyle} className="custom-cursor eraser">
        🗑️
      </div>
    );
  }

  if (selectedTool === "select" && selectedGlyph) {
    return (
      <div style={cursorStyle} className="custom-cursor glyph">
        <Glyph {...selectedGlyph} />
      </div>
    );
  }

  return null;
};

const TOTAL_HALL_WIDTH = 512; // should match PLOT_SIZE in App and the width of the spritesheet for seamless looping
const PLOT_SIZE = 512; // in pixels, should match the size of the spritesheet for simplicity
const GRID_SIZE = 16; // allow placing stickers on a grid, default 16x16 pixels which matches the smallest possible footprint size
const LOOPING_SPEED = 0.01; // how fast plot rotates while viewing

function App() {
  const [ws, setWs] = useState(null);
  const [selectedGlyph, setSelectedGlyph] = useState(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [stickers, setStickers] = useState([]);
  const [log, setLog] = useState([]);
  const plotRef = useRef(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const looperContext = useRef({ xShift: 0, lastTime: Date.now() });
  const [xShift, setYShift] = useState(0);

  // Mouse tracking state
  const [mouseCoords, setMouseCoords] = useState({
    clientX: 0,
    clientY: 0,
    localX: 0,
    localY: 0,
    plotX: 0,
    plotY: 0,
    cellX: 0,
    cellY: 0,
    isOverPlot: false
  });

  // set up animation loop to shift plot left/right for seamless looping
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const delta = now - looperContext.current.lastTime;
      looperContext.current.lastTime = now;
      looperContext.current.xShift += delta * LOOPING_SPEED;
      if (looperContext.current.xShift > TOTAL_HALL_WIDTH / 2) {
        looperContext.current.xShift -= TOTAL_HALL_WIDTH;
      }
      setYShift(looperContext.current.xShift);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, []);

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

      if (data.type === "STICKER_REMOVED") {
        setStickers(prev => prev.filter(s => s.id !== data.payload.stickerId));
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  // Mouse tracking for plot coordinates
  useEffect(() => {
    const plotElement = plotRef.current;
    if (!plotElement) return;

    const handleMouseMove = (e) => {
      const rect = plotElement.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Check if mouse is over the plot
      const isOverPlot = clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom;

      if (isOverPlot) {
        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        // Calculate plot coordinates (relative to plot element)
        let plot_x = localX - 32 - xShift;
        let plot_y = (localY - 128 - 24) * 1.33;

        // Calculate grid cell coordinates
        const cellX = Math.floor((plot_x + 32) / GRID_SIZE);
        const cellY = Math.floor((plot_y + 24) / GRID_SIZE);

        setMouseCoords({
          clientX,
          clientY,
          localX,
          localY,
          plotX: plot_x,
          plotY: plot_y,
          cellX,
          cellY,
          isOverPlot: true
        });
      } else {
        setMouseCoords(prev => ({ ...prev, isOverPlot: false }));
      }
    };

    const handleMouseLeave = () => {
      setMouseCoords(prev => ({ ...prev, isOverPlot: false }));
    };

    plotElement.addEventListener('mousemove', handleMouseMove);
    plotElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      plotElement.removeEventListener('mousemove', handleMouseMove);
      plotElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [xShift]);

  const addLog = (msg) => {
    setLog(prev => [...prev.slice(-20), msg]);
  };

  const findStickerAtPlotPosition = (plot_x, plot_y) => {
    return stickers.find((sticker) => {
      const left = sticker.position[1];
      const top = sticker.position[2];
      const width = sticker.footprint?.[0] ?? 64;
      const height = sticker.footprint?.[1] ?? 64;
      console.log("Checking sticker at", sticker.position, "with footprint", width, height); // fine
      // also return a sticker at position 512 to left or right of mouse click to allow erasing by clicking on the double of a sticker that is wrapping around the plot
      const condition_double_left = plot_x + TOTAL_HALL_WIDTH >= left && plot_x + TOTAL_HALL_WIDTH <= left + width && plot_y >= top && plot_y <= top + height;
      const condition_double_right = plot_x - TOTAL_HALL_WIDTH >= left && plot_x - TOTAL_HALL_WIDTH <= left + width && plot_y >= top && plot_y <= top + height;
      const condition_original = plot_x >= left && plot_x <= left + width && plot_y >= top && plot_y <= top + height;
      return condition_original || condition_double_left || condition_double_right;
    });
  };

  const handlePlotClick = (e) => {
    const rect = plotRef.current.getBoundingClientRect();
    let plot_x = e.clientX - rect.left - 32 - xShift;
    let plot_y = (e.clientY - rect.top - 128 - 24) * 1.33;
    const grid_x = Math.floor((plot_x + 32) / GRID_SIZE);
    const grid_y = Math.floor((plot_y + 24) / GRID_SIZE);

    if (snapToGrid) {
      plot_x = grid_x * GRID_SIZE;
      plot_y = grid_y * GRID_SIZE;
    }

    if (plot_x + xShift < 0 || plot_x + xShift > PLOT_SIZE || plot_y < 0 || plot_y > PLOT_SIZE) {
      console.log("Clicked outer space");
      return;
    }

    if (selectedTool === "erase") {
      const stickerToRemove = findStickerAtPlotPosition(plot_x, plot_y);
      if (!stickerToRemove) {
        addLog("No sticker found under eraser");
        return;
      }

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "REMOVE_STICKER",
          payload: {
            stickerId: stickerToRemove.id
          }
        }));
        setStickers(prev => prev.filter((sticker) => sticker.id !== stickerToRemove.id));
        addLog("Sent REMOVE_STICKER: " + stickerToRemove.id);
      }
      return;
    }

    if (!selectedGlyph) {
      console.log("Select a sticker first!");
      return;
    }

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
    <div className="app" >
      <h1>🌙 Our Moon Gardens</h1>

      <h2>Choose a Glyph</h2>
      <div className="sticker-picker">
        {<GlyphBox onSelect={setSelectedGlyph} />}
      </div>

      <h2>ToolBox</h2>
      <div className="toolbox">
        <button className={selectedTool === "select" ? "tool selected" : "tool"} onClick={() => setSelectedTool("select")}>Select</button>
        <button className={selectedTool === "erase" ? "tool selected" : "tool"} onClick={() => setSelectedTool("erase")}>Erase</button>
      </div>

      {selectedTool === "erase" && (
        <p>Click a sticker on the plot to remove it.</p>
      )}

      <div className="controls">
        <label>
          <input type="checkbox" checked={snapToGrid} onChange={() => setSnapToGrid(!snapToGrid)} />
          Snap to Grid
        </label>
      </div>

      <h2>
        Plot 0 (click to place)
        {mouseCoords.isOverPlot && (
          <span className="coords">
            | Client: ({Math.round(mouseCoords.clientX)}, {Math.round(mouseCoords.clientY)})
            | Plot: ({Math.round(mouseCoords.plotX)}, {Math.round(mouseCoords.plotY)})
            | Cell: ({mouseCoords.cellX}, {mouseCoords.cellY})
          </span>
        )}
      </h2>
      <div className="plot" ref={plotRef} onClick={handlePlotClick} style={{ margin: '0 auto', width: PLOT_SIZE, height: PLOT_SIZE, overflow: 'hidden', position: 'relative' }}>

        <div className="plot-contents" style={{ width: PLOT_SIZE, height: PLOT_SIZE, position: 'absolute', left: xShift }}>
          {stickers && stickers.length > 0 && stickers.map((sticker, i) => (
            <Sticker key={i} {...sticker} />
          ))}
        </div>

        <CustomCursor
          selectedGlyph={selectedGlyph}
          selectedTool={selectedTool}
          mouseCoords={mouseCoords}
        />
      </div>

      <div className="log">
        <h3>Log</h3>
        <pre>{log.join('\n')}</pre>
      </div>
    </div>
  );
}

export default App;
