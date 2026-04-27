# our-moon-gardens
Social Sticker Place

## Running the Application

- **Client**: `http://localhost:8080`
- **Server**: `http://localhost:3001`

`npm run dev`

:

🌙 Our Moon Gardens — System Anchor

Our Moon Gardens is a graph-based simulation of cultural expression in space and time.

Core Model
Glyph = reusable symbolic identity (image + metadata)
Sticker = a Glyph instantiated in space-time (position + decay)
Plot = a looping 2D spatial container (1000×1000 grid)
World = a graph of Plot nodes
Physics
Time advances via ticks
Stickers decay based on interaction and time
Each (x, y) cell is a stack of layered stickers
Newer stickers sit on top; older ones fade into noise
Space behaves like a pressure field, not a static canvas
Architecture
events/ = system-wide event bus
actions/ = all state-changing verbs
world/ = simulation loop + decay logic
nodes/ = core data structures (Glyph, Sticker, Plot)
plots/ = spatial topology (looped 2D)
glyphs/ = registry of symbolic artifacts
stickers/ = placement + lifecycle
rules/ = configurable physics

Culture emerges from repetition, density, and decay
The system is observable before it is controllable