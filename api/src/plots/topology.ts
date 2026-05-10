// filepath: api/src/plots/topology.ts

/**
 * Great Moon Hall - linear graph of Plot nodes
 * 
 * plot_0 is the center
 * plot_-1 is to the left, plot_1 is to the right
 * 
 * Length is dynamic based on usage/population/uptake
 * 
 * Each plot has:
 * - x: fixed horizontal axis (not toroidal)
 * - floor: extends left/right, loops at edges
 * - back wall: extends left/right, loops at edges
 */

export interface PlotPosition {
  plot_id: number;      // -1, 0, 1, etc.
  x: number;         // 0-999 within plot
  y: number;         // floor position (0 = ground)
  z: number;         // back wall position (0 = wall)
}

// A node in the Great Moon Hall graph
export interface PlotNode {
  id: number;
  stickers: Map<string, StickerStack>;  // key: "x,y,z"
  population: number;
  lastActivity: number;
}

// A stack of stickers at a specific position (x,y,z) in a plot
export interface StickerStack {
  stickers: PlacedSticker[];
}

// A sticker that has been placed in the Great Moon Hall
export interface PlacedSticker {
  glyph_name: string;
  sprites: any[];
  source_type: string;
  position: [number, number, number, number];
  footprint: [number, number, number];
  tick: number;
}

// The Great Moon Hall
export class GreatMoonHall {
  private plots: Map<number, PlotNode> = new Map();
  private minPlot: number = 0;
  private maxPlot: number = 0;

  // Thresholds for expanding the hall
  private readonly EXPAND_THRESHOLD = 100;  // population to add new plot
  private readonly CONTRACT_THRESHOLD = 10;  // population to remove plot

  constructor() {
    // Initialize with plot_0
    this.plots.set(0, this.createPlot(0));
  }

  private createPlot(id: number): PlotNode {
    return {
      id,
      stickers: new Map(),
      population: 0,
      lastActivity: Date.now()
    };
  }

  /**
   * Place a sticker in the Great Moon Hall
   * Handles wrapping on floor and back wall
   */
  placeSticker(sticker): void {
    const { glyph_name, sprites, source_type, position, footprint } = sticker;
    const [plot_id, x, y, z] = position;
    // Ensure plot exists
    this.ensurePlotExists(plot_id);

    const plot = this.plots.get(plot_id)!;
    const id = `plot${plot_id}_${Date.now()}_${Math.random()}`;
    const stackKey = `${x},${y},${z},${glyph_name}`;
    if (!plot.stickers.has(stackKey)) {
      plot.stickers.set(stackKey, { stickers: [] });
    }
    const stack = plot.stickers.get(stackKey)!;
    stack.stickers.push({
      glyph_name: glyph_name,
      sprites,
      source_type,
      position: [plot_id, x, y, z],
      footprint,
      tick: Date.now()
    });

    plot.population++;
    plot.lastActivity = Date.now();

    // Check if we need to expand
    this.checkExpansion();
  }

  /**
   * Get all stickers in the hall
   */
  getAllStickers(): PlacedSticker[] {
    const allStickers: PlacedSticker[] = [];
    for (const plot of this.plots.values()) {
      for (const stack of plot.stickers.values()) {
        allStickers.push(...stack.stickers);
      }
    }
    return allStickers;
  }

  /**
   * Ensure plot exists, creating new ones if needed
   */
  private ensurePlotExists(plot_id: number): void {
    if (!this.plots.has(plot_id)) {
      this.plots.set(plot_id, this.createPlot(plot_id));
    }
  }

  /**
   * Check if hall needs to expand based on population
   */
  private checkExpansion(): void {
    const totalPopulation = Array.from(this.plots.values())
      .reduce((sum, p) => sum + p.population, 0);

    const plotCount = this.plots.size;
    const avgPopulation = totalPopulation / plotCount;

    // Expand right if rightmost plot is popular
    const rightPlot = this.plots.get(this.maxPlot);
    if (rightPlot && rightPlot.population > this.EXPAND_THRESHOLD) {
      this.maxPlot++;
      this.plots.set(this.maxPlot, this.createPlot(this.maxPlot));
    }

    // Expand left if leftmost plot is popular
    const leftPlot = this.plots.get(this.minPlot);
    if (leftPlot && leftPlot.population > this.EXPAND_THRESHOLD) {
      this.minPlot--;
      this.plots.set(this.minPlot, this.createPlot(this.minPlot));
    }
  }

  /**
   * Get all plots in the hall
   */
  getPlots(): PlotNode[] {
    return Array.from(this.plots.values()).sort((a, b) => a.id - b.id);
  }

  /**
   * Get plot range
   */
  getPlotRange(): { min: number; max: number } {
    return { min: this.minPlot, max: this.maxPlot };
  }

  /**
   * Get plot by ID
   */
  getPlot(id: number): PlotNode | undefined {
    return this.plots.get(id);
  }
}