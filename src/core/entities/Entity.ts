import { EventHandler, IEventMap } from '../EventHandler';
import { Game } from '../Game';
import { generateUUID } from '../utils';

export interface EntityOptions {
  game: Game;
  parent?: Entity;
}

export class Entity<Events extends IEventMap = IEventMap> extends EventHandler<Events> {
  public readonly id: string;
  public readonly game: Game;
  public readonly children: Entity[] = [];
  public parent: Entity | null;

  public x = 0;
  public y = 0;

  constructor({ game, parent }: EntityOptions) {
    super();
    this.id = generateUUID();
    this.game = game;
    this.parent = parent ?? null;
    if (parent) parent.addChild(this);
  }

  addChild(child: Entity): this {
    child.parent = this;
    this.children.push(child);
    return this;
  }

  removeChild(child: Entity): this {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
    return this;
  }

  setup(): void {
    this.onSetup();
    this.children.forEach(c => c.setup());
  }
  protected onSetup(): void { /* override */ }

  update(deltaTime: number): void {
    this.onUpdate(deltaTime);
    this.children.forEach(c => c.update(deltaTime));
  }
  protected onUpdate(_deltaTime: number): void { /* override */ }

  render(context: CanvasRenderingContext2D, deltaTime: number): void {
    this.onRender(context, deltaTime);
    this.children.forEach(c => c.render(context, deltaTime));
  }
  protected onRender(_context: CanvasRenderingContext2D, _deltaTime: number): void { /* override */ }

  destroy(): void {
    this.onDestroy();
    this.children.forEach(c => c.destroy());
    if (this.parent) this.parent.removeChild(this);
  }
  protected onDestroy(): void { /* override */ }

  get name(): string {
    return this.constructor.name;
  }
}
