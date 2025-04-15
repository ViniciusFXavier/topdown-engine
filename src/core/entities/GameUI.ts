import { Entity, EntityOptions } from './Entity';

export interface GameUIOptions extends EntityOptions { }

export class GameUI extends Entity {
  public x = 0;
  public y = 0;
  public zoom = 1;

  constructor(opts: GameUIOptions) {
    super(opts);
  }

  onRender(context: CanvasRenderingContext2D): void {
    const { height } = this.game.canvas;
    const { curentSpeed, speedSteps } = this.game.player
    for (let i = 0; i < speedSteps.length; i++) {
      const step = speedSteps[i];
      const x = this.x + 15;
      const y = height - 100 + this.y + (i * 15);
      context.fillStyle = curentSpeed >= step ? 'green' : 'red';
      context.fillRect(x, y, 10, 10);
    }
  }

  onUpdate(): void {
    if (!this.parent) return
    this.x = this.parent.x
    this.y = this.parent.y
  }
}