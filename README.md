# our-moon-gardens
Social Sticker Place

## Running the Application

- **Client**: `http://localhost:5173` (React + Vite)
- **Server**: `http://localhost:3001` (WebSocket)

`npm run dev`

---

🌙 Our Moon Gardens — System Anchor

Our Moon Gardens is a graph-based simulation of cultural expression in space and time.

### Core Model

| Concept | Description |
|---------|-------------|
| **Glyph** | Reusable symbolic identity (image + metadata) |
| **Sticker** | Glyph instantiated in space-time (position + decay) |
| **Plot** | Looping 2D spatial container (1000×1000 grid) |
| **World** | Graph of Plot nodes |

### Great Moon Hall

Linear graph of plots:
- `plot_0` is the center
- `plot_-1` to the left, `plot_1` to the right
- Length expands based on usage/population/uptake
- X-axis is fixed (not toroidal)
- Floor and back wall wrap at edges

### Architecture

```
api/src/
├── events/       # system-wide event bus
├── actions/      # state-changing verbs
├── world/        # simulation loop + decay logic
├── nodes/        # core data structures
├── plots/        # spatial topology
└── stickers/     # placement + lifecycle

client/           # React + Vite frontend
```

### Physics

- Time advances via ticks
- Stickers decay based on interaction and time
- Each cell is a stack of layered stickers
- Space behaves like a pressure field

### Visual Identity

- All display uses 3/4 top-down orthographic perspective on a grid
- Native stickers are grayscale, but personal real estate can be customized

---

*Culture emerges from repetition, density, and decay. The system is observable before it is controllable.*