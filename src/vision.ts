import './main.scss'

type Point = { x: number; y: number };

class Segment {
  a: Point;
  b: Point;
  constructor(a: Point, b: Point) {
    this.a = a;
    this.b = b;
  }
}

class Ray {
  a: Point;
  b: Point;
  constructor(a: Point, b: Point) {
    this.a = a;
    this.b = b;
  }
}

class Intersection {
  x: number;
  y: number;
  param: number;
  angle?: number;
  constructor(x: number, y: number, param: number, angle: number) {
    this.x = x;
    this.y = y;
    this.param = param;
    this.angle = angle;
  }
}

class FieldOfView {
  segments: Segment[];
  constructor(segments: Segment[]) {
    this.segments = segments;
  }

  normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  getIntersection(ray: Ray, segment: Segment): Intersection | null {
    let r_px = ray.a.x;
    let r_py = ray.a.y;
    let r_dx = ray.b.x - ray.a.x;
    let r_dy = ray.b.y - ray.a.y;
    let s_px = segment.a.x;
    let s_py = segment.a.y;
    let s_dx = segment.b.x - segment.a.x;
    let s_dy = segment.b.y - segment.a.y;
    let r_mag = Math.hypot(r_dx, r_dy);
    let s_mag = Math.hypot(s_dx, s_dy);
    if (r_dx / r_mag === s_dx / s_mag && r_dy / r_mag === s_dy / s_mag) return null;
    if (Math.abs(r_dx) < 1e-3) r_dx = 1e-3;
    if (Math.abs(s_dx * r_dy - s_dy * r_dx) < 1e-3) return null;
    const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / (s_dx * r_dy - s_dy * r_dx);
    const T1 = (s_px + s_dx * T2 - r_px) / r_dx;
    if (T1 < 0 || T2 < 0 || T2 > 1) return null;
    const x = r_px + r_dx * T1;
    const y = r_py + r_dy * T1;
    const angle = Math.atan2(r_dy, r_dx);
    return new Intersection(x, y, T1, angle);
  }

  getPolygon(pivot: Point, direction: Point, fovDeg: number): Point[] {
    const dirAng = Math.atan2(direction.y - pivot.y, direction.x - pivot.x);
    const halfFOV = (fovDeg * Math.PI / 180) / 2;
    const startAng = dirAng - halfFOV;
    const endAng = dirAng + halfFOV;
    const pts: Point[] = [];
    this.segments.forEach(s =>
      [s.a, s.b].forEach(p => {
        if (!pts.some(u => u.x === p.x && u.y === p.y)) pts.push(p);
      })
    );
    const rayAngles = [startAng, endAng];
    pts.forEach(p => {
      const ang = Math.atan2(p.y - pivot.y, p.x - pivot.x);
      const diff = this.normalizeAngle(ang - dirAng);
      if (Math.abs(diff) <= halfFOV) {
        rayAngles.push(ang - 1e-4, ang, ang + 1e-4);
      }
    });
    const intersects = rayAngles
      .map(ang => {
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        const ray = new Ray(pivot, { x: pivot.x + dx, y: pivot.y + dy });
        let closest: Intersection | null = null;
        this.segments.forEach((seg: Segment) => {
          const intr = this.getIntersection(ray, seg);
          if (intr && (!closest || intr.param < closest.param)) closest = intr;
        });
        if (closest) (closest as Intersection).angle = ang;
        return closest;
      })
      .filter((i) => i !== null)
      .sort((a: Intersection, b: Intersection) => {
        return this.normalizeAngle((a.angle ?? 0) - startAng) - this.normalizeAngle((b.angle ?? 0) - startAng)
      });
    const poly: Point[] = [pivot, ...intersects.map((i: Intersection) => ({ x: i.x, y: i.y })), pivot];
    return poly;
  }
}

class Renderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  render(polygon: Point[], segments: Segment[], pivot: Point, mouse: Point): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.moveTo(polygon[0].x, polygon[0].y);
    polygon.forEach(p => this.ctx.lineTo(p.x, p.y));
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = "#00f";
    segments.forEach(s => {
      this.ctx.beginPath();
      this.ctx.moveTo(s.a.x, s.a.y);
      this.ctx.lineTo(s.b.x, s.b.y);
      this.ctx.stroke();
    });
    this.ctx.fillStyle = "#00f";
    this.ctx.beginPath();
    this.ctx.arc(pivot.x, pivot.y, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = "#ff0";
    this.ctx.beginPath();
    this.ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#dd3838";
    this.ctx.fillStyle = "#dd3838";
    for (let i = 1; i < polygon.length - 1; i++) {
      const p = polygon[i];
      this.ctx.beginPath();
      this.ctx.moveTo(pivot.x, pivot.y);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

class App {
  canvas: HTMLCanvasElement;
  slider: HTMLInputElement;
  angleValue: HTMLElement;
  pivot: Point;
  mouse: Point;
  fovDeg: number;
  update: boolean;
  segments: Segment[];
  fov: FieldOfView;
  renderer: Renderer;

  constructor() {
    document.body.innerHTML = `
      <div>
        <canvas id="canvas" width="840" height="360"></canvas>
        <div style="margin: 10px;">
          <label for="angleRange">Field of View (degrees): </label>
          <input type="range" id="angleRange" min="10" max="175" value="45" step="5">
          <span id="angleValue">45°</span>
        </div>
      </div>
    `;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.slider = document.getElementById("angleRange") as HTMLInputElement;
    this.angleValue = document.getElementById("angleValue")!;
    this.pivot = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
    this.mouse = { ...this.pivot };
    this.fovDeg = 45;
    this.update = true;
    this.segments = this.initSegments();
    this.fov = new FieldOfView(this.segments);
    this.renderer = new Renderer(this.canvas);
    this.bindEvents();
    this.loop();
  }

  initSegments(): Segment[] {
    const pts: [number, number][][] = [
      [[0, 0], [840, 0]], [[840, 0], [840, 360]], [[840, 360], [0, 360]], [[0, 360], [0, 0]], // Border
      [[100, 150], [120, 50]], [[120, 50], [200, 80]], [[200, 80], [140, 210]], [[140, 210], [100, 150]], // Polygon #1
      [[100, 200], [120, 250]], [[120, 250], [60, 300]], [[60, 300], [100, 200]], // Polygon #2
      [[200, 260], [220, 150]], [[220, 150], [300, 200]], [[300, 200], [350, 320]], [[350, 320], [200, 260]], // Polygon #3
      [[540, 60], [560, 40]], [[560, 40], [570, 70]], [[570, 70], [540, 60]], // Polygon #4
      [[650, 190], [760, 170]], [[760, 170], [740, 270]], [[740, 270], [630, 290]], [[630, 290], [650, 190]], // Polygon #5
      [[600, 95], [780, 50]], [[780, 50], [680, 150]], [[680, 150], [600, 95]] // Polygon #6
    ];
    return pts.map(p => new Segment({ x: p[0][0], y: p[0][1] }, { x: p[1][0], y: p[1][1] }));
  }

  bindEvents(): void {
    this.slider.oninput = () => {
      this.fovDeg = parseInt(this.slider.value);
      this.angleValue.textContent = `${this.fovDeg}°`;
      this.update = true;
    };
    this.canvas.onmousemove = e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.update = true;
    };
  }

  draw(): void {
    const polygon = this.fov.getPolygon(this.pivot, this.mouse, this.fovDeg);
    this.renderer.render(polygon, this.segments, this.pivot, this.mouse);
  }

  loop(): void {
    requestAnimationFrame(() => this.loop());
    if (this.update) {
      this.draw();
      this.update = false;
    }
  }
}

window.onload = () => {
  new App();
}
