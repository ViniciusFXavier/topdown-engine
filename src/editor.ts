import './main.scss'

class Tile {
  color: string;

  constructor(color = "#FFFFFF") {
    this.color = color;
  }

  render(ctx: CanvasRenderingContext2D, x: any, y: any, tileSize: number) {
    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(x, y, tileSize, tileSize);
  }
}

class Chunk {
  x: number;
  y: number;
  size: number;
  tiles: Tile[][];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.tiles = [];

    for (let i = 0; i < this.size; i++) {
      this.tiles[i] = [];
      for (let j = 0; j < this.size; j++) {
        this.tiles[i][j] = new Tile();
      }
    }
  }

  getTile(x: number, y: number) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[y][x];
    }
    return null;
  }

  setTile(x: number, y: number, tile: Tile) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      this.tiles[y][x] = new Tile(tile.color);
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, tileSize: number) {
    const startX = this.x * this.size * tileSize - cameraX;
    const startY = this.y * this.size * tileSize - cameraY;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const tileX = startX + x * tileSize;
        const tileY = startY + y * tileSize;
        this.tiles[y][x].render(ctx, tileX, tileY, tileSize);
      }
    }
  }
}

interface Chunks {
  [x: string]: Chunk;
}

class TiledMap {
  chunks: Chunks;
  tileSize: number;

  constructor() {
    this.chunks = {};
    this.tileSize = 32;
  }

  getChunkKey(x: number, y: number) {
    return `${x},${y}`;
  }

  getChunk(x: number, y: number) {
    const key = this.getChunkKey(x, y);
    if (!this.chunks[key]) {
      this.chunks[key] = new Chunk(x, y);
    }
    return this.chunks[key];
  }

  getTileAtWorldPosition(worldX: number, worldY: number) {
    const chunkSize = 10 * this.tileSize;

    let chunkX = Math.floor(worldX / chunkSize);
    let chunkY = Math.floor(worldY / chunkSize);

    let localX = worldX - chunkX * chunkSize;
    let localY = worldY - chunkY * chunkSize;

    let tileX = Math.floor(localX / this.tileSize);
    let tileY = Math.floor(localY / this.tileSize);

    return {
      chunk: this.getChunk(chunkX, chunkY),
      tileX: tileX,
      tileY: tileY
    };
  }

  setTileAtWorldPosition(worldX: number, worldY: number, tile: Tile) {
    const tileInfo = this.getTileAtWorldPosition(worldX, worldY);
    if (tileInfo.chunk) {
      tileInfo.chunk.setTile(tileInfo.tileX, tileInfo.tileY, tile);
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
    const chunkSize = 10 * this.tileSize;

    const startChunkX = Math.floor(cameraX / chunkSize);
    const startChunkY = Math.floor(cameraY / chunkSize);
    const endChunkX = Math.ceil((cameraX + canvasWidth) / chunkSize);
    const endChunkY = Math.ceil((cameraY + canvasHeight) / chunkSize);

    for (let y = startChunkY; y < endChunkY; y++) {
      for (let x = startChunkX; x < endChunkX; x++) {
        const key = this.getChunkKey(x, y);
        if (this.chunks[key]) {
          this.chunks[key].render(ctx, cameraX, cameraY, this.tileSize);
        } else {
          this.getChunk(x, y).render(ctx, cameraX, cameraY, this.tileSize);
        }
      }
    }
  }
}

class Camera {
  x: number;
  y: number;
  speed: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.speed = 5;
  }

  move(direction: string) {
    switch (direction) {
      case 'w':
        this.y -= this.speed;
        break;
      case 's':
        this.y += this.speed;
        break;
      case 'a':
        this.x -= this.speed;
        break;
      case 'd':
        this.x += this.speed;
        break;
    }
  }
}

class TileSelector {
  tiles: Tile[];
  selectedTileIndex: number;

  constructor() {
    this.tiles = [
      new Tile("#FF0000"), // Red
      new Tile("#00FF00"), // Green
      new Tile("#0000FF"), // Blue
      new Tile("#FFFF00"), // Yellow
      new Tile("#FF00FF"), // Magenta
      new Tile("#00FFFF"), // Cyan
      new Tile("#FFFFFF"), // White
      new Tile("#000000"), // Black
      new Tile("#888888"), // Gray
      new Tile("#8B4513"), // Brown
      new Tile("#FFA500"), // Orange
      new Tile("#800080"), // Purple
      new Tile("#FFC0CB"), // Pink
      new Tile("#00CED1"), // DarkTurquoise
      new Tile("#A52A2A"), // DarkRed
      new Tile("#228B22"), // ForestGreen
      new Tile("#F5DEB3"), // Wheat
      new Tile("#B22222"), // FireBrick
      new Tile("#7FFFD4"), // Aquamarine
      new Tile("#6495ED"), // CornflowerBlue
      new Tile("#DC143C"), // Crimson
      new Tile("#2E8B57"), // SeaGreen
      new Tile("#FFD700"), // Gold
      new Tile("#ADFF2F"), // GreenYellow
      new Tile("#5F9EA0"), // CadetBlue
      new Tile("#FF1493"), // DeepPink
      new Tile("#4682B4"), // SteelBlue
      new Tile("#D2691E")  // Chocolate
    ];

    this.selectedTileIndex = 0;
  }

  get selectedTile() {
    return this.tiles[this.selectedTileIndex];
  }

  selectTile(index: number) {
    if (index >= 0 && index < this.tiles.length) {
      this.selectedTileIndex = index;
    }
  }

  render(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
    const tileSize = 40;
    const padding = 5;
    const tilesPerRow = 2;

    ctx.fillStyle = "#DDDDDD";
    ctx.fillRect(x, y, width, (Math.ceil(this.tiles.length / tilesPerRow) * (tileSize + padding)) + padding);

    for (let i = 0; i < this.tiles.length; i++) {
      const tileX = x + padding + (i % tilesPerRow) * (tileSize + padding);
      const tileY = y + padding + Math.floor(i / tilesPerRow) * (tileSize + padding);

      this.tiles[i].render(ctx, tileX, tileY, tileSize);

      if (i === this.selectedTileIndex) {
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 3;
        ctx.strokeRect(tileX - 2, tileY - 2, tileSize + 4, tileSize + 4);
        ctx.lineWidth = 1;
      }
    }
  }

  handleClick(x: number, y: number, selectorX: number, selectorY: number, selectorWidth: number) {
    const tileSize = 40;
    const padding = 5;
    const tilesPerRow = 2;

    if (x < selectorX || x > selectorX + selectorWidth) return false;

    for (let i = 0; i < this.tiles.length; i++) {
      const tileX = selectorX + padding + (i % tilesPerRow) * (tileSize + padding);
      const tileY = selectorY + padding + Math.floor(i / tilesPerRow) * (tileSize + padding);

      if (x >= tileX && x < tileX + tileSize &&
        y >= tileY && y < tileY + tileSize) {
        this.selectTile(i);
        return true;
      }
    }

    return false;
  }
}

class TiledMapEditor {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  map: TiledMap;
  camera: Camera;
  tileSelector: TileSelector;
  selectorWidth: number;

  constructor(canvasId: string) {
    const canvasElement = document.getElementById(canvasId);
    this.canvas = canvasElement as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) throw new Error("Failed to get canvas context");

    this.map = new TiledMap();
    this.camera = new Camera();
    this.tileSelector = new TileSelector();

    this.selectorWidth = 100;
  }

  start() {
    this.setupEventListeners();
    this.startGameLoop();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (['w', 'a', 's', 'd'].includes(e.key)) {
        this.camera.move(e.key);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX > this.canvas.width - this.selectorWidth) {
        this.tileSelector.handleClick(
          mouseX,
          mouseY,
          this.canvas.width - this.selectorWidth,
          0,
          this.selectorWidth
        );
        return;
      }

      const worldX = mouseX + this.camera.x;
      const worldY = mouseY + this.camera.y;

      this.map.setTileAtWorldPosition(worldX, worldY, this.tileSelector.selectedTile);
    });

    window.addEventListener('resize', () => this.resizeCanvas());
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startGameLoop() {
    const gameLoop = () => {
      this.update();
      this.render();
      requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }

  update() { }

  render() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.map.render(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);

    this.tileSelector.render(this.ctx, this.canvas.width - this.selectorWidth, 0, this.selectorWidth);

    this.ctx.fillStyle = "#000000";
    this.ctx.font = "12px Arial";
    this.ctx.fillText(`Camera: ${this.camera.x}, ${this.camera.y}`, 10, 20);
  }
}

document.body.innerHTML = `
<canvas id="tiledMapEditor" style="display: block; margin: 0; padding: 0;"></canvas>
<style>
  body, html {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
  }
</style>
`;

// Inicializa o editor quando a página carregar
window.onload = () => {
  const editor = new TiledMapEditor("tiledMapEditor");
  editor.start();
};
