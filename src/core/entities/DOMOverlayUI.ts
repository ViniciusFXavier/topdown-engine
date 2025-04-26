import { Entity, EntityOptions } from './Entity';

export interface DOMOverlayUIOptions extends EntityOptions {
  container: HTMLElement;
}

export class DOMOverlayUI extends Entity {
  public readonly container: HTMLElement;
  public app!: HTMLDivElement;
  public canvas!: HTMLCanvasElement;
  public context!: CanvasRenderingContext2D | null;

  constructor(opts: DOMOverlayUIOptions) {
    super(opts);
    this.container = opts.container;

    this.createElements();
  }

  private createElements() {
    this.app = document.createElement('div');
    this.app.id = 'app';
    this.container.appendChild(this.app);

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.app.appendChild(this.canvas);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.context = this.canvas.getContext('2d');
  }
}