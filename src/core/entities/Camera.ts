import { Entity, EntityOptions } from './Entity';

export interface CameraOptions extends EntityOptions { }

export class Camera extends Entity {
  public x = 0;
  public y = 0;
  public zoom = 1;

  constructor(opts: CameraOptions) {
    super(opts);
  }

  onUpdate(): void {
    const inputs = this.game.inputs

    const mouse = inputs.getMousePosition();

    const { canvas, player } = this.game;
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;
    const lookAhead = 0.9; // 0 = só segue player; 1 = leva mouse até o centro

    const dx = mouse.x - halfW;
    const dy = mouse.y - halfH;

    const targetX = player.x + dx * lookAhead;
    const targetY = player.y + dy * lookAhead;

    this.x = targetX - halfW;
    this.y = targetY - halfH;

    inputs.mouse.worldX = this.x + mouse.x;
    inputs.mouse.worldY = this.y + mouse.y;
  }
}