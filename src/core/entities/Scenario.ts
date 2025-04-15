import { Entity, EntityOptions } from './Entity';

export interface ScenarioOptions extends EntityOptions { }

export class Scenario extends Entity {
  public x = 0;
  public y = 0;

  constructor(opts: ScenarioOptions) {
    super(opts);
  }

  onSetup(): void { }

  onRender(context: CanvasRenderingContext2D): void {
    var bw = 400;
    var bh = 400;
    var p = 10;

    for (var x = 0; x <= bw; x += 40) {
      context.moveTo(0.5 + x + p, p);
      context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 40) {
      context.moveTo(p, 0.5 + x + p);
      context.lineTo(bw + p, 0.5 + x + p);
    }
    context.strokeStyle = "black";
    context.stroke();
  }
}