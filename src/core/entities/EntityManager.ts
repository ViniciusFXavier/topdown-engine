import { EventHandler, IEventMap } from '../EventHandler';
import { Game } from '../Game';
import { Entity } from './Entity';

export enum Layer {
  DOMOverlayUI = 0,
  Background = 1,
  Scenario = 2,
  Props = 3,
  Actors = 4,
  Effects = 5,
  Debug =6,
  GameUI = 7,
}

export interface EntityManagerOptions {
  game: Game;
}

interface Entities {
  [key: string]: Entity;
}

export class EntityManager<Events extends IEventMap = IEventMap> extends EventHandler<Events> {
  public readonly game: Game;
  private readonly entities: Entities = {};
  private readonly entitiesByLayer = new Map<Layer, Entity[]>();

  constructor({ game }: EntityManagerOptions) {
    super();
    this.game = game;
  }

  getEntity(id: string): Entity | undefined {
    return this.entities[id];
  }

  add(entity: Entity, layer: Layer): void {
    this.entities[entity.id] = entity;
    const list = this.entitiesByLayer.get(layer) ?? [];
    list.push(entity);
    this.entitiesByLayer.set(layer, list);
  }

  remove(entityOrId: Entity | string): void {
    const entity = typeof entityOrId === 'string' ? this.entities[entityOrId] : entityOrId;
    if (!entity) return;

    for (const [layer, list] of this.entitiesByLayer.entries()) {
      const index = list.indexOf(entity);
      if (index !== -1) {
        list.splice(index, 1);
        if (list.length === 0) {
          this.entitiesByLayer.delete(layer);
        } else {
          this.entitiesByLayer.set(layer, list);
        }
        break;
      }
    }

    delete this.entities[entity.id];
  }

  setup(): void {
    for (const layer of Object.values(Layer).filter(v => typeof v === 'number').sort() as Layer[]) {
      const list = this.entitiesByLayer.get(layer) ?? [];
      list.forEach(e => e.setup());
    }
  }

  update(deltaTime: number): void {
    for (const layer of Object.values(Layer).filter(v => typeof v === 'number').sort() as Layer[]) {
      const list = this.entitiesByLayer.get(layer) ?? [];
      list.forEach(e => e.update(deltaTime));
    }
  }

  render(deltaTime: number): void {
    const { context, camera } = this.game;
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.save();

    const { x, y } = camera;
    context.translate(-x, -y);

    for (const layer of Object.values(Layer).filter(v => typeof v === 'number').sort() as Layer[]) {
      const list = this.entitiesByLayer.get(layer) ?? [];
      list.forEach(e => e.render(context, deltaTime));
    }
    context.restore();
  }

  destroy(): void {
    for (const list of this.entitiesByLayer.values()) {
      list.forEach(e => e.destroy());
    }
  }
}
