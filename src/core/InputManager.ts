import { EventHandler, IEventMap } from './EventHandler';
import { Game } from './Game';

export type Key = string;
export type MouseButton = number;

export interface InputManagerOptions {
  game: Game;
}

export interface MousePosition {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
}

export interface InputManagerEvents extends IEventMap {
  'scroll': WheelEvent;
}

export class InputManager extends EventHandler<InputManagerEvents> {
  public readonly game: Game;

  public keysDown = new Set<Key>();
  public mouseButtons = new Set<MouseButton>();
  // public mouseX = 0;
  // public mouseY = 0;
  public mouse: MousePosition = {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
  }
  public pointerLock = true;
  public isLocked = false;

  constructor(opts: InputManagerOptions) {
    super();
    this.game = opts.game;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onPointerlockChange = this.onPointerlockChange.bind(this);
    this.onPointerlockError = this.onPointerlockError.bind(this);
  }

  setup(): void {
    const canvas = this.game.canvas;

    window.addEventListener('keydown', e => this.keysDown.add(e.code));
    window.addEventListener('keyup', e => this.keysDown.delete(e.code));

    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mousemove', this.onMouseMove);

    canvas.addEventListener('wheel', this.onMouseWheel);

    document.addEventListener('pointerlockchange', this.onPointerlockChange);
    document.addEventListener('pointerlockerror', this.onPointerlockError);
  }

  onMouseWheel(e: WheelEvent): void {
    e.preventDefault();
    this.emit('scroll', e);
  }

  onMouseMove(e: MouseEvent): void {
    if (this.isLocked) {
      this.mouse.x += e.movementX;
      this.mouse.y += e.movementY;
    } else {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    }

    const { width, height } = this.game.canvas;
    this.mouse.x = Math.max(0, Math.min(width, this.mouse.x));
    this.mouse.y = Math.max(0, Math.min(height, this.mouse.y));
  }

  onMouseDown(e: MouseEvent): void {
    const { canvas } = this.game;
    if (this.pointerLock && !this.isLocked) {
      canvas.requestPointerLock();
    } else {
      this.mouseButtons.add(e.button);
    }
  }

  onMouseUp(e: MouseEvent): void {
    this.mouseButtons.delete(e.button);
  }

  onPointerlockChange(): void {
    const { canvas } = this.game;
    if (document.pointerLockElement === canvas) {
      this.isLocked = true;
    } else {
      this.isLocked = false;
    }
  }

  onPointerlockError(e: Event): void {
    console.error('PointerLockControls: Unable to use Pointer Lock API', e);
  }

  isKeyDown(key: Key): boolean { return this.keysDown.has(key); }
  isMouseButtonDown(b: MouseButton): boolean { return this.mouseButtons.has(b); }
  getMousePosition(): MousePosition { return this.mouse; }
}
