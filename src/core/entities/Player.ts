import { Entity, EntityOptions } from './Entity';

export interface PlayerOptions extends EntityOptions {
  x?: number;
  y?: number;

  aimLength?: number;
}

export class Player extends Entity {
  public x = 0;
  public y = 0;

  public speedSteps = [1, 1.5, 2, 2.5, 3];
  public curentSpeed = 2;

  public aimLength = 1000;

  constructor(opts: PlayerOptions) {
    super(opts);

    this.aimLength = opts.aimLength ?? 1000;
  }

  onSetup(): void {
    const { canvas } = this.game

    this.x = canvas.width / 2;
    this.y = canvas.height / 2;

    this.game.inputs.on('scroll', this.handleScroll.bind(this));
  }

  onRender(context: CanvasRenderingContext2D): void {
    this.renderPlayer(context);
    this.renderAim(context);
  }

  onUpdate(deltaTime: number): void {
    const inputs = this.game.inputs

    inputs.isKeyDown('KeyW') && (this.y -= (this.curentSpeed * 100) * deltaTime);
    inputs.isKeyDown('KeyS') && (this.y += (this.curentSpeed * 100) * deltaTime);
    inputs.isKeyDown('KeyA') && (this.x -= (this.curentSpeed * 100) * deltaTime);
    inputs.isKeyDown('KeyD') && (this.x += (this.curentSpeed * 100) * deltaTime);
  }

  renderPlayer(context: CanvasRenderingContext2D) {
    const { x, y } = this;

    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2);
    context.fillStyle = 'yellow';
    context.fill();
  }

  renderAim(context: CanvasRenderingContext2D) {
    const inputs = this.game.inputs;
    const { x, y } = this;

    const mouse = inputs.getMousePosition();
    const worldMouseX = mouse.worldX;
    const worldMouseY = mouse.worldY;

    const dx = worldMouseX - x;
    const dy = worldMouseY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const dirX = dx / distance;
    const dirY = dy / distance;

    const gradEndX = x + dirX * this.aimLength;
    const gradEndY = y + dirY * this.aimLength;

    const gradient = context.createLinearGradient(x, y, gradEndX, gradEndY);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(worldMouseX, worldMouseY);
    context.strokeStyle = gradient;
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.arc(worldMouseX, worldMouseY, 5, 0, Math.PI * 2);
    context.fillStyle = 'blue';
    context.fill();

    context.beginPath();
    context.arc(x, y, 3, 0, Math.PI * 2);
    context.fillStyle = 'green';
    context.fill();
  }

  private handleScroll(e: WheelEvent): void {
    const idx = this.speedSteps.indexOf(this.curentSpeed);
    if (idx === -1) return;

    let newIdx = idx;
    if (e.deltaY > 0) {
      newIdx = Math.max(0, idx - 1);
    } else if (e.deltaY < 0) {
      newIdx = Math.min(this.speedSteps.length - 1, idx + 1);
    }

    if (newIdx !== idx) {
      this.curentSpeed = this.speedSteps[newIdx];
    }
  }
}