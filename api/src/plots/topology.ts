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
  plotId: number;      // -1, 0, 1, etc.
  x: number;         // 0-999 within plot
  y: number;         // floor position (0 = ground)
  z: number;         // back wall position (0 = wall)
}

export interface PlotNode {
  id: number;
  stickers: Map<string, StickerStack>;  // key: "x,y,z"
  population: number;
  lastActivity: number;
}

export interface StickerStack {
  stickers: PlacedSticker[];
}

export interface PlacedSticker {
  glyph: string;
  placedAt: number;
  decay: number;
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
  placeSticker(glyph: string, plotId: number, x: number, y: number, z: number): void {
    // Ensure plot exists
    this.ensurePlotExists(plotId);
    
    const plot = this.plots.get(plotId)!;
    const key = `${x},${y},${z}`;
    
    let stack = plot.stickers.get(key);
    if (!stack) {
      stack = { stickers: [] };
      plot.stickers.set(key, stack);
    }
    
    stack.stickers.push({
      glyph,
      placedAt: Date.now(),
      decay: 1.0
    });
    
    plot.population++;
    plot.lastActivity = Date.now();
    
    // Check if we need to expand
    this.checkExpansion();
  }
  
  /**
   * Get sticker at position, handling floor/back wall wrapping
   */
  getStickerAt(plotId: number, x: number, y: number, z: number): PlacedSticker | null {
    const plot = this.plots.get(plotId);
    if (!plot) return null;
    
    // Wrap floor (y) and back wall (z) within plot
    const wrappedY = ((y % 1000) + 1000) % 1000;
    const wrappedZ = ((z % 1000) + 1000) % 1000;
    
    const key = `${x},${wrappedY},${wrappedZ}`;
    const stack = plot.stickers.get(key);
    
    if (!stack || stack.stickers.length === 0) return null;
    return stack.stickers[stack.stickers.length - 1];  // top sticker
  }
  
  /**
   * Ensure plot exists, creating new ones if needed
   */
  private ensurePlotExists(plotId: number): void {
    if (!this.plots.has(plotId)) {
      this.plots.set(plotId, this.createPlot(plotId));
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