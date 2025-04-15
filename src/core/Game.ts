import { EventHandler, IEventMap } from './EventHandler';
import { Scenario } from './entities/Scenario';
import { Camera } from './entities/Camera';
import { GameUI } from './entities/GameUI';
import { Player } from './entities/Player';
import { EntityManager, Layer } from './entities/EntityManager';
import { DOMOverlayUI } from './entities/DOMOverlayUI';
import { InputManager } from './InputManager';

export interface GameOptions {
  width?: number;
  height?: number;
  timeScale?: number;
}

export interface GameEvents extends IEventMap {
  'start': void;
  'pause': void;
  'resume': void;
  'update': number;
  'render': number;
}

export class Game extends EventHandler<GameEvents> {
  private lastFrameTime = 0;

  public running = false;
  public timeScale = 1;
  public camera: Camera;
  public readonly root: EntityManager;
  public readonly domOverlayUI: DOMOverlayUI;
  public readonly inputs: InputManager;
  public readonly player: Player;
  public readonly scenario: Scenario;
  public readonly gameUI: GameUI;
  public readonly canvas: HTMLCanvasElement;
  public readonly context: CanvasRenderingContext2D | null;

  constructor(opts: GameOptions = {}) {
    super();

    this.timeScale = opts.timeScale ?? 1;

    this.root = new EntityManager({ game: this });

    this.domOverlayUI = new DOMOverlayUI({ game: this, container: document.body });
    this.root.add(this.domOverlayUI, Layer.DOMOverlayUI);
    this.canvas = this.domOverlayUI.canvas;
    this.context = this.domOverlayUI.context;

    this.scenario = new Scenario({ game: this });
    this.root.add(this.scenario, Layer.Scenario);

    this.camera = new Camera({ game: this });
    this.root.add(this.camera, Layer.Actors);

    this.gameUI = new GameUI({ game: this, parent: this.camera });
    this.root.add(this.gameUI, Layer.GameUI);

    this.player = new Player({ game: this });
    this.root.add(this.player, Layer.Actors);

    this.inputs = new InputManager({ game: this });

    this.root.setup();
    this.inputs.setup();
    console.log('Game initialized', this);
  }

  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  pause(): void {
    this.running = false;
  }

  resume(): void {
    if (!this.running) {
      this.running = true;
      this.lastFrameTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  private loop(timestamp: number): void {
    if (!this.running) return;
    const rawDelta = (timestamp - this.lastFrameTime) / 1000;
    const deltaTime = rawDelta * this.timeScale;
    this.lastFrameTime = timestamp;

    this.root.update(deltaTime);

    this.root.render(deltaTime);

    requestAnimationFrame(this.loop.bind(this));
  }
}
