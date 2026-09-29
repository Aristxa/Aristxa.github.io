/* NeuroDrive engine (https://github.com/Aristxa/neurodrive @ 6de0700), MIT, Aristea Gjokthomi.
   Its DOM-free core, world, ai and sim files plus the pretrained brains, concatenated
   unmodified inside one closure so their globals don't leak into AristeaOS.
   Rebuilt with the script in README.md. */
(function () {
// ---- core/math.js


/**
 * Core math helpers.
 *
 * Everything under js/core, js/world, js/ai and js/sim is DOM-free so the full
 * engine can also run headless in Node (see tools/train.js).
 */
const TAU = Math.PI * 2;

const MathUtil = {
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  },

  /** Wraps an angle into (-PI, PI]. */
  wrapAngle(a) {
    return Math.atan2(Math.sin(a), Math.cos(a));
  },

  approach(value, target, maxDelta) {
    if (value < target) return Math.min(value + maxDelta, target);
    return Math.max(value - maxDelta, target);
  },

  /**
   * Intersection of segment AB with segment CD.
   * Returns the parameter t along AB in [0, 1], or -1 when they don't cross.
   * This is the hottest function in the simulation (ray casting + collisions),
   * so it works on raw numbers and never allocates.
   */
  segmentIntersectT(ax, ay, bx, by, cx, cy, dx, dy) {
    const rx = bx - ax, ry = by - ay;
    const sx = dx - cx, sy = dy - cy;
    const denom = rx * sy - ry * sx;
    if (denom === 0) return -1;
    const qx = cx - ax, qy = cy - ay;
    const t = (qx * sy - qy * sx) / denom;
    if (t < 0 || t > 1) return -1;
    const u = (qx * ry - qy * rx) / denom;
    if (u < 0 || u > 1) return -1;
    return t;
  },

  distToSegmentSq(px, py, ax, ay, bx, by) {
    const vx = bx - ax, vy = by - ay;
    const lenSq = vx * vx + vy * vy;
    let t = lenSq > 0 ? ((px - ax) * vx + (py - ay) * vy) / lenSq : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const qx = ax + vx * t - px, qy = ay + vy * t - py;
    return qx * qx + qy * qy;
  },
};

/**
 * Seedable PRNG (mulberry32). Worlds and traffic scenarios are generated from
 * seeds so every generation of the population faces the exact same situation,
 * which makes fitness comparisons fair and training reproducible.
 */
class Random {
  constructor(seed = 1) {
    this.state = (seed >>> 0) || 1;
    this._spare = null;
  }

  next() {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + (max - min) * this.next();
  }

  int(n) {
    return Math.floor(this.next() * n);
  }

  pick(arr) {
    return arr[this.int(arr.length)];
  }

  /** Standard normal sample (Box–Muller). */
  gaussian() {
    return Random.boxMuller(() => this.next(), this);
  }

  static boxMuller(rand, holder) {
    if (holder._spare !== null) {
      const s = holder._spare;
      holder._spare = null;
      return s;
    }
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    const mag = Math.sqrt(-2 * Math.log(u));
    holder._spare = mag * Math.sin(TAU * v);
    return mag * Math.cos(TAU * v);
  }
}

/** Unseeded gaussian used by the genetic operators. */
const gaussianHolder = { _spare: null };
Random.gaussianUnseeded = () => Random.boxMuller(Math.random, gaussianHolder);

// ---- core/geometry.js


/**
 * 2D geometry primitives used to turn a road graph into drivable geometry:
 * points, segments, polygons, polygon union and "envelopes" (the rounded
 * capsule shape around a road skeleton).
 */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(p) {
    return this.x === p.x && this.y === p.y;
  }
}

const Vec = {
  add: (a, b) => new Point(a.x + b.x, a.y + b.y),
  sub: (a, b) => new Point(a.x - b.x, a.y - b.y),
  scale: (a, s) => new Point(a.x * s, a.y * s),
  dot: (a, b) => a.x * b.x + a.y * b.y,
  cross: (a, b) => a.x * b.y - a.y * b.x,
  length: (a) => Math.hypot(a.x, a.y),
  distance: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  angle: (a) => Math.atan2(a.y, a.x),
  lerp: (a, b, t) => new Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t),
  average: (a, b) => new Point((a.x + b.x) / 2, (a.y + b.y) / 2),
  translate: (p, angle, d) => new Point(p.x + Math.cos(angle) * d, p.y + Math.sin(angle) * d),
  normalize(a) {
    const l = Math.hypot(a.x, a.y) || 1;
    return new Point(a.x / l, a.y / l);
  },
  /** Right-hand normal in screen space (y axis points down). */
  perp: (a) => new Point(-a.y, a.x),
};

/** Segment/segment intersection with both parameters (t on AB, u on CD). */
function getIntersection(A, B, C, D) {
  const rx = B.x - A.x, ry = B.y - A.y;
  const sx = D.x - C.x, sy = D.y - C.y;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const qx = C.x - A.x, qy = C.y - A.y;
  const t = (qx * sy - qy * sx) / denom;
  const u = (qx * ry - qy * rx) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { x: A.x + rx * t, y: A.y + ry * t, t, u };
}

/**
 * Pseudo-3D projection: lifts a ground point "towards the camera" so extruded
 * shapes (buildings, trees) get perspective without a 3D pipeline.
 */
function fake3d(p, viewPoint, height) {
  const dx = p.x - viewPoint.x, dy = p.y - viewPoint.y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6) return new Point(p.x, p.y);
  const s = ((Math.atan(d / 300) / (Math.PI / 2)) * height) / d;
  return new Point(p.x + dx * s, p.y + dy * s);
}

class Segment {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  length() {
    return Vec.distance(this.p1, this.p2);
  }

  direction() {
    return Vec.normalize(Vec.sub(this.p2, this.p1));
  }

  includes(p) {
    return this.p1.equals(p) || this.p2.equals(p);
  }

  equals(seg) {
    return this.includes(seg.p1) && this.includes(seg.p2);
  }

  projectPoint(p) {
    const a = Vec.sub(p, this.p1);
    const b = Vec.sub(this.p2, this.p1);
    const lenSq = Vec.dot(b, b);
    const t = lenSq > 0 ? Vec.dot(a, b) / lenSq : 0;
    return { point: Vec.add(this.p1, Vec.scale(b, t)), offset: t };
  }

  distanceToPoint(p) {
    return Math.sqrt(MathUtil.distToSegmentSq(p.x, p.y, this.p1.x, this.p1.y, this.p2.x, this.p2.y));
  }
}

class Polygon {
  constructor(points) {
    this.points = points;
    this.segments = points.map((p, i) => new Segment(p, points[(i + 1) % points.length]));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    this.bounds = { minX, minY, maxX, maxY };
  }

  static boundsOverlap(a, b, margin = 0) {
    return (
      a.minX - margin <= b.maxX && a.maxX + margin >= b.minX &&
      a.minY - margin <= b.maxY && a.maxY + margin >= b.minY
    );
  }

  /**
   * Union of polygons, returned as the outline segments.
   * 1. split every edge wherever it crosses an edge of another polygon
   * 2. keep only the pieces that are not inside any other polygon
   */
  static union(polys) {
    Polygon.multiBreak(polys);
    const kept = [];
    for (let i = 0; i < polys.length; i++) {
      for (const seg of polys[i].segments) {
        const mid = Vec.average(seg.p1, seg.p2);
        let inside = false;
        for (let j = 0; j < polys.length; j++) {
          if (i !== j && polys[j].containsPoint(mid)) {
            inside = true;
            break;
          }
        }
        if (!inside) kept.push(seg);
      }
    }
    return kept;
  }

  static multiBreak(polys) {
    for (let i = 0; i < polys.length - 1; i++) {
      for (let j = i + 1; j < polys.length; j++) {
        Polygon.break(polys[i], polys[j]);
      }
    }
  }

  static break(poly1, poly2) {
    if (!Polygon.boundsOverlap(poly1.bounds, poly2.bounds, 1)) return;
    const segs1 = poly1.segments, segs2 = poly2.segments;
    const EPS = 1e-7;
    for (let i = 0; i < segs1.length; i++) {
      for (let j = 0; j < segs2.length; j++) {
        const hit = getIntersection(segs1[i].p1, segs1[i].p2, segs2[j].p1, segs2[j].p2);
        if (!hit) continue;
        const split1 = hit.t > EPS && hit.t < 1 - EPS;
        const split2 = hit.u > EPS && hit.u < 1 - EPS;
        if (!split1 && !split2) continue;
        const point = new Point(hit.x, hit.y);
        if (split1) {
          const aux = segs1[i].p2;
          segs1[i].p2 = point;
          segs1.splice(i + 1, 0, new Segment(point, aux));
        }
        if (split2) {
          const aux = segs2[j].p2;
          segs2[j].p2 = point;
          segs2.splice(j + 1, 0, new Segment(point, aux));
        }
      }
    }
  }

  /** Even-odd ray casting against the original vertices. */
  containsPoint(p) {
    const b = this.bounds;
    if (p.x < b.minX || p.x > b.maxX || p.y < b.minY || p.y > b.maxY) return false;
    const pts = this.points;
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], c = pts[j];
      if ((a.y > p.y) !== (c.y > p.y) && p.x < ((c.x - a.x) * (p.y - a.y)) / (c.y - a.y) + a.x) {
        inside = !inside;
      }
    }
    return inside;
  }

  distanceToPoint(p) {
    let min = Infinity;
    for (const s of this.segments) {
      const d = s.distanceToPoint(p);
      if (d < min) min = d;
    }
    return min;
  }

  distanceToPoly(poly) {
    let min = Infinity;
    for (const p of this.points) {
      const d = poly.distanceToPoint(p);
      if (d < min) min = d;
    }
    return min;
  }

  intersectsPoly(poly) {
    if (!Polygon.boundsOverlap(this.bounds, poly.bounds)) return false;
    for (const s1 of this.segments) {
      for (const s2 of poly.segments) {
        if (getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)) return true;
      }
    }
    return false;
  }

  centroid() {
    let x = 0, y = 0;
    for (const p of this.points) {
      x += p.x;
      y += p.y;
    }
    return new Point(x / this.points.length, y / this.points.length);
  }
}

/**
 * Capsule polygon around a skeleton segment: two half-circles joined by the
 * road sides. roundness = number of steps per half circle (1 => rectangle).
 */
function createEnvelope(skeleton, width, roundness = 1) {
  const { p1, p2 } = skeleton;
  const radius = width / 2;
  const alpha = Vec.angle(Vec.sub(p1, p2));
  const alphaCw = alpha + Math.PI / 2;
  const alphaCcw = alpha - Math.PI / 2;
  const step = Math.PI / Math.max(1, roundness);
  const eps = step / 2;
  const points = [];
  for (let a = alphaCcw; a <= alphaCw + eps; a += step) points.push(Vec.translate(p1, a, radius));
  for (let a = alphaCcw; a <= alphaCw + eps; a += step) points.push(Vec.translate(p2, Math.PI + a, radius));
  return new Polygon(points);
}

/** Writes the 4 corners of an oriented box into `out` (Float64Array(8)). */
function writeBoxCorners(out, x, y, angle, length, width) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const hl = length / 2, hw = width / 2;
  const lx = [hl, hl, -hl, -hl];
  const ly = [hw, -hw, -hw, hw];
  for (let i = 0; i < 4; i++) {
    out[i * 2] = x + c * lx[i] - s * ly[i];
    out[i * 2 + 1] = y + s * lx[i] + c * ly[i];
  }
  return out;
}

// ---- core/spatial-grid.js


/**
 * Uniform spatial hash.
 *
 * Every car casts ~9 rays and tests 4 hull edges each tick. Without a broad
 * phase that is O(cars × borders); with the grid each car only sees the handful
 * of border segments in its neighbourhood, which is what lets a population of
 * hundreds run at 10–30× real time.
 */
class SpatialGrid {
  constructor(cellSize = 128) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this.size = 0;
    this._stamp = 0;
  }

  _key(ix, iy) {
    return (ix + 32768) * 65536 + (iy + 32768);
  }

  insert(item, minX, minY, maxX, maxY) {
    const cs = this.cellSize;
    const x0 = Math.floor(minX / cs), x1 = Math.floor(maxX / cs);
    const y0 = Math.floor(minY / cs), y1 = Math.floor(maxY / cs);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iy = y0; iy <= y1; iy++) {
        const key = this._key(ix, iy);
        let cell = this.cells.get(key);
        if (!cell) {
          cell = [];
          this.cells.set(key, cell);
        }
        cell.push(item);
      }
    }
    item._stamp = 0;
    this.size++;
  }

  /** Segments are stored as flat {ax, ay, bx, by} records for fast access. */
  insertSegment(seg) {
    this.insert(seg, Math.min(seg.ax, seg.bx), Math.min(seg.ay, seg.by), Math.max(seg.ax, seg.bx), Math.max(seg.ay, seg.by));
  }

  insertPoint(item) {
    this.insert(item, item.x, item.y, item.x, item.y);
  }

  /** Collects unique items whose cells overlap the box. Reuses `out`. */
  query(minX, minY, maxX, maxY, out = []) {
    out.length = 0;
    const stamp = ++this._stamp;
    const cs = this.cellSize;
    const x0 = Math.floor(minX / cs), x1 = Math.floor(maxX / cs);
    const y0 = Math.floor(minY / cs), y1 = Math.floor(maxY / cs);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iy = y0; iy <= y1; iy++) {
        const cell = this.cells.get(this._key(ix, iy));
        if (!cell) continue;
        for (let k = 0; k < cell.length; k++) {
          const item = cell[k];
          if (item._stamp !== stamp) {
            item._stamp = stamp;
            out.push(item);
          }
        }
      }
    }
    return out;
  }
}

// ---- core/graph.js


/** The road network: nodes (intersections / bends) and undirected segments (roads). */
class Graph {
  constructor(points = [], segments = []) {
    this.points = points;
    this.segments = segments;
  }

  static fromJSON(json) {
    const points = (json.points || []).map(([x, y]) => new Point(x, y));
    const segments = [];
    for (const [i, j] of json.segments || []) {
      if (points[i] && points[j] && i !== j) segments.push(new Segment(points[i], points[j]));
    }
    return new Graph(points, segments);
  }

  toJSON() {
    const index = new Map(this.points.map((p, i) => [p, i]));
    return {
      points: this.points.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
      segments: this.segments.map((s) => [index.get(s.p1), index.get(s.p2)]),
    };
  }

  addPoint(p) {
    this.points.push(p);
    return p;
  }

  removePoint(p) {
    for (const seg of this.getSegmentsWithPoint(p)) this.removeSegment(seg);
    this.points.splice(this.points.indexOf(p), 1);
  }

  containsSegment(seg) {
    return this.segments.some((s) => s.equals(seg));
  }

  tryAddSegment(seg) {
    if (seg.p1.equals(seg.p2) || this.containsSegment(seg)) return false;
    this.segments.push(seg);
    return true;
  }

  removeSegment(seg) {
    const i = this.segments.indexOf(seg);
    if (i >= 0) this.segments.splice(i, 1);
  }

  getSegmentsWithPoint(p) {
    return this.segments.filter((s) => s.includes(p));
  }

  /** Inserts `point` into `seg`, turning one road into two (used to create T-junctions). */
  splitSegment(seg, point) {
    this.removeSegment(seg);
    this.addPoint(point);
    this.segments.push(new Segment(seg.p1, point), new Segment(point, seg.p2));
    return point;
  }

  /** Removes nodes no road uses. */
  prune() {
    const used = new Set();
    for (const s of this.segments) {
      used.add(s.p1);
      used.add(s.p2);
    }
    this.points = this.points.filter((p) => used.has(p));
  }

  clear() {
    this.points.length = 0;
    this.segments.length = 0;
  }
}

// ---- core/theme.js


/** Visual language: a dark, minimal "autonomy visualisation" look. */
const THEME = {
  ground: '#16191e',
  groundGrid: 'rgba(255,255,255,0.028)',
  sidewalk: '#262a31',
  road: '#353a42',
  roadBorder: 'rgba(222,228,236,0.85)',
  laneMarking: 'rgba(240,244,248,0.55)',
  crosswalk: 'rgba(220,226,234,0.22)',

  accent: '#3d8bfd',
  accentSoft: 'rgba(61,139,253,0.32)',
  danger: '#ff4d6a',
  amber: '#c27a22',

  population: 'rgba(61,139,253,0.22)',
  populationStroke: 'rgba(122,176,255,0.55)',
  crashed: 'rgba(255,77,106,0.16)',
  trafficPalette: ['#8d96a3', '#a3abb6', '#6f7884', '#b8a58c', '#8a9bb0', '#9b8f9f'],

  sensorRay: 'rgba(96,200,255,0.55)',
  sensorHit: '#ffb547',
};

// ---- world/items.js


function tracePolygon(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

/** Extruded building with a pseudo-3D projection relative to the camera. */
class Building {
  constructor(base, height, tint) {
    this.base = base;
    this.height = height;
    this.tint = tint;
    this.center = base.centroid();
    this.radius = Math.max(...base.points.map((p) => Vec.distance(p, this.center)));
    this._faces = this._computeFaces();
  }

  _computeFaces() {
    const pts = this.base.points;
    const light = Vec.normalize(new Point(-0.55, -0.85));
    return pts.map((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const mid = Vec.average(a, b);
      let n = Vec.normalize(Vec.perp(Vec.sub(b, a)));
      if (Vec.dot(n, Vec.sub(mid, this.center)) < 0) n = Vec.scale(n, -1);
      const lit = (Vec.dot(n, light) + 1) / 2; // 0 (shadow) .. 1 (lit)
      return { a, b, mid, lightness: 14 + lit * 14 + this.tint * 4 };
    });
  }

  draw(ctx, viewPoint) {
    const pts = this.base.points;
    const top = pts.map((p) => fake3d(p, viewPoint, this.height));

    // contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    tracePolygon(ctx, pts);
    ctx.fill();

    const faces = this._faces
      .map((f, i) => ({ f, i, d: Vec.distance(f.mid, viewPoint) }))
      .sort((x, y) => y.d - x.d);
    ctx.lineWidth = 1;
    for (const { f, i } of faces) {
      const j = (i + 1) % pts.length;
      ctx.fillStyle = `hsl(216, 13%, ${f.lightness}%)`;
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      tracePolygon(ctx, [f.a, f.b, top[j], top[i]]);
      ctx.fill();
      ctx.stroke();
    }

    // roof
    ctx.fillStyle = `hsl(216, 14%, ${30 + this.tint * 6}%)`;
    tracePolygon(ctx, top);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // rooftop unit (small inset block) for a bit of detail
    const c = fake3d(this.center, viewPoint, this.height);
    const inset = top.map((p) => Vec.lerp(c, p, 0.42));
    ctx.fillStyle = `hsl(216, 12%, ${36 + this.tint * 6}%)`;
    tracePolygon(ctx, inset);
    ctx.fill();
  }
}

/** Layered, slightly irregular canopy. */
class Tree {
  constructor(center, size, rng) {
    this.center = center;
    this.size = size;
    this.radius = size / 2;
    this.height = size * rng.range(0.55, 0.85);
    this.hue = 150 + rng.range(-12, 10);
    const LEVELS = 6, SIDES = 14;
    this.levels = [];
    for (let i = 0; i < LEVELS; i++) {
      const noise = new Float32Array(SIDES);
      for (let k = 0; k < SIDES; k++) noise[k] = rng.range(0.78, 1.06);
      this.levels.push(noise);
    }
  }

  draw(ctx, viewPoint) {
    const top = fake3d(this.center, viewPoint, this.height);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, this.radius * 0.9, 0, TAU);
    ctx.fill();

    const L = this.levels.length;
    for (let i = 0; i < L; i++) {
      const t = i / (L - 1);
      const cx = MathUtil.lerp(this.center.x, top.x, t);
      const cy = MathUtil.lerp(this.center.y, top.y, t);
      const r = MathUtil.lerp(this.radius, this.radius * 0.28, t);
      const noise = this.levels[i];
      ctx.fillStyle = `hsl(${this.hue}, 24%, ${MathUtil.lerp(14, 34, t)}%)`;
      ctx.beginPath();
      for (let k = 0; k < noise.length; k++) {
        const a = (k / noise.length) * TAU;
        const x = cx + Math.cos(a) * r * noise[k];
        const y = cy + Math.sin(a) * r * noise[k];
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
}

// ---- world/world.js


/**
 * Turns a road Graph into a drivable, renderable world:
 *   graph ─► road envelopes ─► polygon union ─► road borders (collision + sensors)
 *         ─► lane markings, crosswalks
 *         ─► checkpoints (progress measure for the fitness function)
 *         ─► procedural buildings and trees
 */
class World {
  static DEFAULTS = {
    roadWidth: 100,
    roadRoundness: 10,
    sidewalk: 12,
    buildingWidth: 95,
    buildingMinLength: 100,
    buildingHeight: [110, 260],
    spacing: 30,
    treeSize: 90,
    checkpointSpacing: 35,
    seed: 7,
  };

  constructor(graph, options = {}, start = null) {
    this.graph = graph;
    this.options = Object.assign({}, World.DEFAULTS, options);
    this.start = start;
    this.version = 0;
    this.detailed = false;
    this.envelopes = [];
    this.sidewalks = [];
    this.roadBorders = [];
    this.laneLines = [];
    this.crosswalks = [];
    this.checkpoints = [];
    this.buildings = [];
    this.trees = [];
    this.adjacency = new Map();
    this.bounds = { minX: -500, minY: -500, maxX: 500, maxY: 500 };
  }

  get laneOffset() {
    return this.options.roadWidth / 4;
  }

  generate({ detail = true } = {}) {
    const o = this.options;
    const segs = this.graph.segments;
    this.envelopes = segs.map((s) => createEnvelope(s, o.roadWidth, o.roadRoundness));
    this.sidewalks = segs.map((s) => createEnvelope(s, o.roadWidth + o.sidewalk * 2, o.roadRoundness));
    this.roadBorders = Polygon.union(this.envelopes);

    this._buildAdjacency();
    this._buildMarkings();
    this._buildCheckpoints();
    this._buildBorderGrid();

    this.detailed = detail;
    this.buildings = detail ? this._generateBuildings() : [];
    this.trees = detail ? this._generateTrees() : [];

    this._computeBounds();
    this.start = this.isOnRoad(this.start) ? this.start : this.defaultStart();
    this._paths = null;
    this.version++;
    return this;
  }

  // ---------------------------------------------------------------- topology

  _buildAdjacency() {
    this.adjacency = new Map();
    for (const p of this.graph.points) this.adjacency.set(p, []);
    for (const s of this.graph.segments) {
      this.adjacency.get(s.p1)?.push(s.p2);
      this.adjacency.get(s.p2)?.push(s.p1);
    }
  }

  degree(p) {
    return this.adjacency.get(p)?.length ?? 0;
  }

  // ---------------------------------------------------------------- markings

  _buildMarkings() {
    const rw = this.options.roadWidth;
    this.laneLines = [];
    this.crosswalks = [];
    for (const s of this.graph.segments) {
      const len = s.length();
      if (len < 1) continue;
      const dir = s.direction();
      const trim1 = this.degree(s.p1) >= 3 ? rw * 0.6 : 0;
      const trim2 = this.degree(s.p2) >= 3 ? rw * 0.6 : 0;
      if (len > trim1 + trim2 + 10) {
        this.laneLines.push([Vec.add(s.p1, Vec.scale(dir, trim1)), Vec.sub(s.p2, Vec.scale(dir, trim2))]);
      }
      if (len < rw * 2.2) continue;
      for (const [node, outward] of [[s.p1, dir], [s.p2, Vec.scale(dir, -1)]]) {
        if (this.degree(node) < 3) continue;
        this._addCrosswalk(node, outward);
      }
    }
  }

  _addCrosswalk(node, outward) {
    const rw = this.options.roadWidth;
    const side = Vec.perp(outward);
    const d0 = rw * 0.6 + 4, d1 = d0 + 18;
    for (let o = -rw / 2 + 9; o <= rw / 2 - 12; o += 11) {
      const a = Vec.add(node, Vec.add(Vec.scale(outward, d0), Vec.scale(side, o)));
      const b = Vec.add(node, Vec.add(Vec.scale(outward, d1), Vec.scale(side, o)));
      const c = Vec.add(b, Vec.scale(side, 5));
      const d = Vec.add(a, Vec.scale(side, 5));
      this.crosswalks.push([a, b, c, d]);
    }
  }

  // ------------------------------------------------------------ checkpoints

  /** Points sampled along every road. A car's progress = unique checkpoints reached. */
  _buildCheckpoints() {
    const spacing = this.options.checkpointSpacing;
    this.checkpointRadius = this.options.roadWidth / 2;
    this.checkpointGrid = new SpatialGrid(128);
    this.checkpoints = [];
    const tooClose = (x, y) => {
      const near = this.checkpointGrid.query(x - 8, y - 8, x + 8, y + 8, []);
      return near.some((c) => Math.hypot(c.x - x, c.y - y) < spacing * 0.3);
    };
    for (const s of this.graph.segments) {
      const n = Math.max(1, Math.round(s.length() / spacing));
      for (let k = 0; k <= n; k++) {
        const p = Vec.lerp(s.p1, s.p2, k / n);
        if (tooClose(p.x, p.y)) continue;
        const cp = { x: p.x, y: p.y, i: this.checkpoints.length };
        this.checkpoints.push(cp);
        this.checkpointGrid.insertPoint(cp);
      }
    }
  }

  _buildBorderGrid() {
    this.borderGrid = new SpatialGrid(128);
    for (const s of this.roadBorders) {
      this.borderGrid.insertSegment({ ax: s.p1.x, ay: s.p1.y, bx: s.p2.x, by: s.p2.y });
    }
  }

  // ------------------------------------------------------- procedural decor

  _generateBuildings() {
    const o = this.options;
    const rng = new Random(o.seed * 7919 + 1);
    const guideWidth = o.roadWidth + o.sidewalk * 2 + o.buildingWidth + o.spacing * 2;
    const guides = Polygon.union(this.graph.segments.map((s) => createEnvelope(s, guideWidth, o.roadRoundness)));

    const supports = [];
    for (const seg of guides) {
      const len = seg.length() + o.spacing;
      const count = Math.floor(len / (o.buildingMinLength + o.spacing));
      if (count < 1) continue;
      const bl = len / count - o.spacing;
      const dir = seg.direction();
      let q1 = seg.p1;
      let q2 = Vec.add(q1, Vec.scale(dir, bl));
      supports.push(new Segment(q1, q2));
      for (let i = 2; i <= count; i++) {
        q1 = Vec.add(q2, Vec.scale(dir, o.spacing));
        q2 = Vec.add(q1, Vec.scale(dir, bl));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = supports.map((s) => createEnvelope(s, o.buildingWidth, 1));
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          Polygon.boundsOverlap(bases[i].bounds, bases[j].bounds, o.spacing) &&
          (bases[i].intersectsPoly(bases[j]) || bases[i].distanceToPoly(bases[j]) < o.spacing - 0.001)
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }
    return bases
      .filter((b) => !this.sidewalks.some((e) => e.intersectsPoly(b) || e.containsPoint(b.points[0])))
      .map((b) => new Building(b, rng.range(o.buildingHeight[0], o.buildingHeight[1]), rng.next()));
  }

  _generateTrees() {
    const o = this.options;
    const rng = new Random(o.seed * 104729 + 3);
    const illegal = [...this.buildings.map((b) => b.base), ...this.sidewalks];
    if (!illegal.length) return [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of illegal) {
      minX = Math.min(minX, p.bounds.minX);
      minY = Math.min(minY, p.bounds.minY);
      maxX = Math.max(maxX, p.bounds.maxX);
      maxY = Math.max(maxY, p.bounds.maxY);
    }
    const pad = o.treeSize;
    const trees = [];
    const MAX_TREES = 450;
    let tries = 0;
    while (tries < 150 && trees.length < MAX_TREES) {
      tries++;
      const p = new Point(rng.range(minX - pad, maxX + pad), rng.range(minY - pad, maxY + pad));
      let ok = true, near = false;
      for (const poly of illegal) {
        const b = poly.bounds, m = o.treeSize * 1.6;
        if (p.x < b.minX - m || p.x > b.maxX + m || p.y < b.minY - m || p.y > b.maxY + m) continue;
        if (poly.containsPoint(p)) { ok = false; break; }
        const d = poly.distanceToPoint(p);
        if (d < o.treeSize / 2) { ok = false; break; }
        if (d < m) near = true;
      }
      if (!ok || !near) continue;
      if (trees.some((t) => Vec.distance(t.center, p) < o.treeSize * 0.95)) continue;
      trees.push(new Tree(p, o.treeSize * rng.range(0.8, 1.1), rng));
      tries = 0;
    }
    return trees;
  }

  _computeBounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const grow = (b) => {
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    };
    for (const p of this.sidewalks) grow(p.bounds);
    for (const b of this.buildings) grow(b.base.bounds);
    for (const t of this.trees) grow({ minX: t.center.x - t.radius, minY: t.center.y - t.radius, maxX: t.center.x + t.radius, maxY: t.center.y + t.radius });
    this.bounds = minX === Infinity ? { minX: -500, minY: -500, maxX: 500, maxY: 500 } : { minX, minY, maxX, maxY };
  }

  // -------------------------------------------------------------- spawning

  isOnRoad(p) {
    return !!p && this.envelopes.some((e) => e.containsPoint(p));
  }

  /** Pose in the right-hand lane of `seg`, facing from `from` to the other end. */
  poseOnSegment(seg, from, along = 70) {
    const to = seg.p1 === from ? seg.p2 : seg.p1;
    const len = Vec.distance(from, to);
    const dir = Vec.normalize(Vec.sub(to, from));
    const p = Vec.add(Vec.add(from, Vec.scale(dir, Math.min(along, len / 2))), Vec.scale(Vec.perp(dir), this.laneOffset));
    return { x: p.x, y: p.y, angle: Vec.angle(dir) };
  }

  defaultStart() {
    const seg = this.graph.segments.find((s) => s.length() > 1);
    return seg ? this.poseOnSegment(seg, seg.p1) : null;
  }

  /** Snaps an arbitrary point to the nearest lane, facing the lane's travel direction. */
  laneFromPoint(p, maxDist = Infinity) {
    let best = null, bestD = maxDist;
    for (const s of this.graph.segments) {
      const d = s.distanceToPoint(p);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    if (!best) return null;
    const proj = best.projectPoint(p);
    const t = MathUtil.clamp(proj.offset, 0, 1);
    const on = Vec.lerp(best.p1, best.p2, t);
    let dir = best.direction();
    if (Vec.cross(dir, Vec.sub(p, on)) < 0) dir = Vec.scale(dir, -1);
    const pos = Vec.add(on, Vec.scale(Vec.perp(dir), this.laneOffset));
    return { x: pos.x, y: pos.y, angle: Vec.angle(dir) };
  }

  // --------------------------------------------------------------- serialize

  toJSON(name = 'Custom world') {
    return {
      version: 1,
      name,
      graph: this.graph.toJSON(),
      start: this.start ? { x: Math.round(this.start.x), y: Math.round(this.start.y), angle: +this.start.angle.toFixed(4) } : null,
      options: { roadWidth: this.options.roadWidth, seed: this.options.seed },
    };
  }

  static fromJSON(data) {
    return new World(Graph.fromJSON(data.graph || {}), data.options || {}, data.start || null);
  }

  // ------------------------------------------------------------------ render

  _ensurePaths() {
    if (this._paths || typeof Path2D === 'undefined') return;
    const polyPath = (polys) => {
      const path = new Path2D();
      for (const poly of polys) {
        const pts = poly.points || poly;
        path.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) path.lineTo(pts[i].x, pts[i].y);
        path.closePath();
      }
      return path;
    };
    const linePath = (lines) => {
      const path = new Path2D();
      for (const [a, b] of lines) {
        path.moveTo(a.x, a.y);
        path.lineTo(b.x, b.y);
      }
      return path;
    };
    this._paths = {
      sidewalk: polyPath(this.sidewalks),
      road: polyPath(this.envelopes),
      crosswalks: polyPath(this.crosswalks),
      lanes: linePath(this.laneLines),
      borders: linePath(this.roadBorders.map((s) => [s.p1, s.p2])),
    };
  }

  drawRoads(ctx) {
    this._ensurePaths();
    const p = this._paths;
    ctx.fillStyle = THEME.sidewalk;
    ctx.fill(p.sidewalk);
    ctx.fillStyle = THEME.road;
    ctx.fill(p.road);
    ctx.fillStyle = THEME.crosswalk;
    ctx.fill(p.crosswalks);

    ctx.lineCap = 'butt';
    ctx.strokeStyle = THEME.laneMarking;
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 18]);
    ctx.stroke(p.lanes);
    ctx.setLineDash([]);

    ctx.lineCap = 'round';
    ctx.strokeStyle = THEME.roadBorder;
    ctx.lineWidth = 3;
    ctx.stroke(p.borders);
  }

  /** Buildings and trees, painter-sorted from the viewer outwards, culled to the view. */
  drawItems(ctx, viewPoint, view) {
    const margin = 300;
    const items = [];
    for (const list of [this.buildings, this.trees]) {
      for (const it of list) {
        const c = it.center;
        if (c.x < view.minX - margin || c.x > view.maxX + margin || c.y < view.minY - margin || c.y > view.maxY + margin) continue;
        items.push(it);
      }
    }
    items.sort((a, b) => Vec.distance(b.center, viewPoint) - b.radius - (Vec.distance(a.center, viewPoint) - a.radius));
    for (const it of items) it.draw(ctx, viewPoint);
  }
}

// ---- world/presets.js


/** Hand-designed and procedurally generated starter worlds. */
const Presets = (() => {
  function pack(name, points, edges, startEdge = 0, options = {}) {
    const graph = Graph.fromJSON({ points, segments: edges });
    const world = new World(graph, options);
    world._buildAdjacency();
    const seg = graph.segments[startEdge];
    const start = seg ? world.poseOnSegment(seg, seg.p1, 90) : null;
    return { version: 1, name, graph: graph.toJSON(), start, options };
  }

  function downtown() {
    const cols = 5, rows = 4, dx = 480, dy = 430;
    const points = [];
    const idx = (c, r) => r * cols + c;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) points.push([c * dx, r * dy]);
    const removed = new Set(['v1,1', 'h2,2', 'v3,0']);
    const edges = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < cols - 1 && !removed.has(`h${c},${r}`)) edges.push([idx(c, r), idx(c + 1, r)]);
        if (r < rows - 1 && !removed.has(`v${c},${r}`)) edges.push([idx(c, r), idx(c, r + 1)]);
      }
    }
    // curved ring road on the east side
    const cx = (cols - 1) * dx, cy = ((rows - 1) * dy) / 2, ry = cy, rx = 420;
    let prev = idx(cols - 1, 0);
    const STEPS = 8;
    for (let k = 1; k < STEPS; k++) {
      const a = -Math.PI / 2 + (k / STEPS) * Math.PI;
      points.push([Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry)]);
      edges.push([prev, points.length - 1]);
      prev = points.length - 1;
    }
    edges.push([prev, idx(cols - 1, rows - 1)]);
    return pack('Downtown', points, edges, 0);
  }

  function circuit() {
    const N = 34, points = [], edges = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * TAU;
      const r = 1 + 0.2 * Math.sin(3 * a + 0.6) + 0.1 * Math.sin(5 * a + 1.4) + 0.07 * Math.cos(2 * a);
      points.push([Math.round(Math.cos(a) * 1150 * r), Math.round(Math.sin(a) * 760 * r)]);
      edges.push([i, (i + 1) % N]);
    }
    return pack('Grand Prix circuit', points, edges, 0);
  }

  function ringRoad() {
    const points = [], edges = [];
    const OUT = 20, IN = 10;
    for (let i = 0; i < OUT; i++) {
      const a = (i / OUT) * TAU;
      points.push([Math.round(Math.cos(a) * 1200), Math.round(Math.sin(a) * 950)]);
      edges.push([i, (i + 1) % OUT]);
    }
    for (let i = 0; i < IN; i++) {
      const a = (i / IN) * TAU;
      points.push([Math.round(Math.cos(a) * 480), Math.round(Math.sin(a) * 400)]);
      edges.push([OUT + i, OUT + ((i + 1) % IN)]);
    }
    for (let k = 0; k < 5; k++) edges.push([OUT + k * 2, k * 4]);
    return pack('Ring & spokes', points, edges, 0);
  }

  function blank() {
    return { version: 1, name: 'Blank canvas', graph: { points: [], segments: [] }, start: null, options: {} };
  }

  const list = [
    { id: 'downtown', name: 'Downtown grid', build: downtown },
    { id: 'circuit', name: 'Grand Prix circuit', build: circuit },
    { id: 'ring', name: 'Ring & spokes', build: ringRoad },
    { id: 'blank', name: 'Blank canvas', build: blank },
  ];

  return {
    list,
    get: (id) => list.find((p) => p.id === id) || list[0],
  };
})();

// ---- ai/network.js


/**
 * Minimal fully-connected feed-forward network with tanh activations.
 * Weights live in Float32Arrays so forward passes for hundreds of cars per
 * tick stay cheap and allocation-free. Trained by neuro-evolution, not backprop.
 */
class Level {
  constructor(inputCount, outputCount, randomize = true) {
    this.inputCount = inputCount;
    this.outputCount = outputCount;
    this.inputs = new Float32Array(inputCount);
    this.outputs = new Float32Array(outputCount);
    this.biases = new Float32Array(outputCount);
    // row-major: weights[j * inputCount + i] connects input i -> output j
    this.weights = new Float32Array(inputCount * outputCount);
    if (randomize) {
      // Xavier-ish uniform init keeps early activations out of tanh saturation
      const limit = Math.sqrt(6 / (inputCount + outputCount));
      for (let k = 0; k < this.weights.length; k++) this.weights[k] = (Math.random() * 2 - 1) * limit;
      for (let j = 0; j < outputCount; j++) this.biases[j] = (Math.random() * 2 - 1) * 0.2;
    }
  }

  forward(input) {
    const nIn = this.inputCount, w = this.weights;
    this.inputs.set(input);
    for (let j = 0; j < this.outputCount; j++) {
      let sum = this.biases[j];
      const row = j * nIn;
      for (let i = 0; i < nIn; i++) sum += input[i] * w[row + i];
      this.outputs[j] = Math.tanh(sum);
    }
    return this.outputs;
  }
}

class NeuralNetwork {
  constructor(sizes, randomize = true) {
    this.sizes = sizes.slice();
    this.levels = [];
    for (let i = 0; i < sizes.length - 1; i++) this.levels.push(new Level(sizes[i], sizes[i + 1], randomize));
  }

  forward(inputs) {
    let out = inputs;
    for (const level of this.levels) out = level.forward(out);
    return out;
  }

  get parameterCount() {
    return this.levels.reduce((n, l) => n + l.weights.length + l.biases.length, 0);
  }

  clone() {
    const copy = new NeuralNetwork(this.sizes, false);
    copy.levels.forEach((l, i) => {
      l.weights.set(this.levels[i].weights);
      l.biases.set(this.levels[i].biases);
    });
    return copy;
  }

  /** Gaussian perturbation of a random subset of parameters. */
  mutate(rate, strength) {
    const perturb = (arr) => {
      for (let k = 0; k < arr.length; k++) {
        if (Math.random() < rate) {
          arr[k] = MathUtil.clamp(arr[k] + Random.gaussianUnseeded() * strength, -4, 4);
        }
      }
    };
    for (const l of this.levels) {
      perturb(l.weights);
      perturb(l.biases);
    }
    return this;
  }

  /**
   * Neuron-level crossover: each neuron (its bias + incoming weights) is inherited
   * as a unit from one parent, which preserves learned feature detectors far
   * better than mixing individual weights.
   */
  static crossover(a, b) {
    const child = new NeuralNetwork(a.sizes, false);
    child.levels.forEach((l, li) => {
      const la = a.levels[li], lb = b.levels[li];
      for (let j = 0; j < l.outputCount; j++) {
        const src = Math.random() < 0.5 ? la : lb;
        l.biases[j] = src.biases[j];
        const row = j * l.inputCount;
        l.weights.set(src.weights.subarray(row, row + l.inputCount), row);
      }
    });
    return child;
  }

  toJSON() {
    return {
      type: 'neurodrive-brain',
      version: 1,
      sizes: this.sizes,
      levels: this.levels.map((l) => ({
        biases: Array.from(l.biases, (v) => +v.toFixed(5)),
        weights: Array.from(l.weights, (v) => +v.toFixed(5)),
      })),
    };
  }

  static fromJSON(json, expectedSizes = null) {
    if (!json || !Array.isArray(json.sizes) || !Array.isArray(json.levels)) throw new Error('Not a NeuroDrive brain file');
    if (expectedSizes && json.sizes.join() !== expectedSizes.join()) {
      throw new Error(`Brain topology ${json.sizes.join('-')} does not match ${expectedSizes.join('-')}`);
    }
    const net = new NeuralNetwork(json.sizes, false);
    net.levels.forEach((l, i) => {
      l.biases.set(json.levels[i].biases);
      l.weights.set(json.levels[i].weights);
    });
    return net;
  }
}

// ---- ai/evolution.js


/**
 * Genetic algorithm over NeuralNetwork genomes.
 *
 *   evaluate ─► rank ─► elitism (top k survive unchanged)
 *                     ─► tournament selection ─► neuron crossover ─► gaussian mutation
 */
class Evolution {
  static DEFAULTS = {
    populationSize: 150,
    layers: [10, 12, 8, 2],
    mutationRate: 0.1,
    mutationStrength: 0.3,
    eliteRatio: 0.04,
    tournamentSize: 4,
    crossoverRate: 0.7,
  };

  constructor(options = {}, seedBrain = null) {
    Object.assign(this, Evolution.DEFAULTS, options);
    this.generation = 1;
    this.history = [];
    this.bestEver = null;
    this.bestEverFitness = -Infinity;
    this.bestEverGeneration = 0;
    this.brains = this._initialPopulation(seedBrain);
  }

  _initialPopulation(seed) {
    const brains = [];
    if (seed) {
      brains.push(seed.clone());
      while (brains.length < this.populationSize) {
        // spread the seeded population: some near-copies, some bolder variants
        const t = brains.length / this.populationSize;
        brains.push(seed.clone().mutate(this.mutationRate + 0.2 * t, this.mutationStrength * (0.3 + t)));
      }
    } else {
      while (brains.length < this.populationSize) brains.push(new NeuralNetwork(this.layers));
    }
    return brains;
  }

  /** Re-seeds the whole population around a known brain (e.g. a saved or pretrained one). */
  seed(brain) {
    this.brains = this._initialPopulation(brain);
  }

  _tournament(order, fitnesses) {
    let best = -1;
    for (let k = 0; k < this.tournamentSize; k++) {
      // bias sampling towards the top half so weak genomes rarely reproduce
      const idx = order[Math.floor(Math.pow(Math.random(), 1.5) * order.length)];
      if (best < 0 || fitnesses[idx] > fitnesses[best]) best = idx;
    }
    return this.brains[best];
  }

  /** Consumes the fitness of every genome and produces the next generation. */
  evolve(fitnesses) {
    const n = this.brains.length;
    const order = [...Array(n).keys()].sort((a, b) => fitnesses[b] - fitnesses[a]);
    const best = fitnesses[order[0]];
    const avg = fitnesses.reduce((s, f) => s + f, 0) / n;
    const summary = { generation: this.generation, best, avg, median: fitnesses[order[Math.floor(n / 2)]] };
    this.history.push(summary);

    if (best > this.bestEverFitness) {
      this.bestEverFitness = best;
      this.bestEver = this.brains[order[0]].clone();
      this.bestEverGeneration = this.generation;
      summary.record = true;
    }

    const next = [];
    const elites = Math.max(1, Math.round(this.populationSize * this.eliteRatio));
    for (let k = 0; k < elites && k < n; k++) next.push(this.brains[order[k]].clone());
    if (this.bestEver && best < this.bestEverFitness) next.push(this.bestEver.clone());

    while (next.length < this.populationSize) {
      const a = this._tournament(order, fitnesses);
      const child = Math.random() < this.crossoverRate
        ? NeuralNetwork.crossover(a, this._tournament(order, fitnesses))
        : a.clone();
      next.push(child.mutate(this.mutationRate, this.mutationStrength));
    }

    this.brains = next.slice(0, this.populationSize);
    this.generation++;
    return summary;
  }
}

// ---- sim/sensor.js


/**
 * Ray-cast "lidar". Each ray reports proximity in [0, 1]
 * (0 = nothing within range, 1 = touching), against road borders and traffic.
 */
class Sensor {
  static DEFAULTS = { rayCount: 9, rayLength: 220, raySpread: Math.PI * 0.85 };

  constructor(options = {}) {
    Object.assign(this, Sensor.DEFAULTS, options);
    this.readings = new Float32Array(this.rayCount);
    // per ray: end x, end y, hit t (or 1)
    this.rays = new Float32Array(this.rayCount * 3);
  }

  update(car, borders, traffic) {
    const n = this.rayCount, len = this.rayLength;
    for (let i = 0; i < n; i++) {
      const offset = n === 1 ? 0 : MathUtil.lerp(-this.raySpread / 2, this.raySpread / 2, i / (n - 1));
      const a = car.angle + offset;
      const ax = car.x, ay = car.y;
      const bx = ax + Math.cos(a) * len, by = ay + Math.sin(a) * len;
      let minT = 2;

      for (let k = 0; k < borders.length; k++) {
        const s = borders[k];
        const t = MathUtil.segmentIntersectT(ax, ay, bx, by, s.ax, s.ay, s.bx, s.by);
        if (t >= 0 && t < minT) minT = t;
      }

      for (let k = 0; k < traffic.length; k++) {
        const o = traffic[k];
        if (Math.abs(o.x - ax) > len + 30 || Math.abs(o.y - ay) > len + 30) continue;
        const p = o.poly;
        for (let e = 0; e < 4; e++) {
          const f = (e + 1) & 3;
          const t = MathUtil.segmentIntersectT(ax, ay, bx, by, p[e * 2], p[e * 2 + 1], p[f * 2], p[f * 2 + 1]);
          if (t >= 0 && t < minT) minT = t;
        }
      }

      this.readings[i] = minT <= 1 ? 1 - minT : 0;
      this.rays[i * 3] = bx;
      this.rays[i * 3 + 1] = by;
      this.rays[i * 3 + 2] = minT <= 1 ? minT : 1;
    }
  }

  draw(ctx, car) {
    ctx.lineWidth = 2;
    for (let i = 0; i < this.rayCount; i++) {
      const bx = this.rays[i * 3], by = this.rays[i * 3 + 1], t = this.rays[i * 3 + 2];
      const hx = car.x + (bx - car.x) * t, hy = car.y + (by - car.y) * t;
      ctx.strokeStyle = THEME.sensorRay;
      ctx.beginPath();
      ctx.moveTo(car.x, car.y);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      if (t < 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.fillStyle = THEME.sensorHit;
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, TAU);
        ctx.fill();
      }
    }
  }
}

// ---- sim/car.js


/**
 * Vehicle with a kinematic bicycle model:
 *   yaw rate = v / wheelbase · tan(δ), capped by a lateral-grip limit
 * Controls are continuous (throttle, steering ∈ [-1, 1]) and come either from
 * the keyboard or from the car's neural network.
 */
class Car {
  static PHYSICS = {
    length: 40,
    width: 20,
    maxSpeed: 260, // px/s  (HUD shows px/s × 0.36 as km/h)
    maxReverse: 60,
    acceleration: 300,
    braking: 520,
    friction: 80,
    maxSteerAngle: 0.6, // rad
    maxLateralAccel: 900, // px/s² – grip limit
  };

  /** Network topology: rays + speed in, throttle + steering out. */
  static brainLayout() {
    return [Sensor.DEFAULTS.rayCount + 1, 12, 8, 2];
  }

  constructor(x, y, angle, { brain = null, autopilot = !!brain, sensor = true } = {}) {
    Object.assign(this, Car.PHYSICS);
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 0;
    this.throttle = 0;
    this.steer = 0;
    this.brain = brain;
    this.autopilot = autopilot;
    this.sensor = sensor ? new Sensor() : null;
    this.inputs = new Float32Array(Sensor.DEFAULTS.rayCount + 1);
    this.poly = new Float64Array(8);
    this.alive = true;
    this.status = 'driving';
    this.distance = 0;
    this.fitness = 0;
    this.updatePolygon();
  }

  update(dt, env) {
    if (!this.alive) return;
    const R = (this.sensor ? this.sensor.rayLength : 0) + this.length;
    const borders = env.borderGrid ? env.borderGrid.query(this.x - R, this.y - R, this.x + R, this.y + R, env.buf) : [];

    if (this.sensor) {
      this.sensor.update(this, borders, env.traffic);
      this.inputs.set(this.sensor.readings);
      this.inputs[this.inputs.length - 1] = this.speed / this.maxSpeed;
    }

    if (this.autopilot && this.brain) {
      const out = this.brain.forward(this.inputs);
      this.throttle = out[0];
      this.steer = out[1];
    } else if (env.input) {
      const k = env.input;
      this.throttle = (k.up ? 1 : 0) - (k.down ? 1 : 0);
      const target = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      this.steer = MathUtil.approach(this.steer, target, dt * 4);
    }

    this._integrate(dt);
    this.updatePolygon();
    if (this._collides(borders, env.traffic)) {
      this.alive = false;
      this.status = 'crashed';
      this.speed = 0;
    }
  }

  _integrate(dt) {
    let acc;
    if (this.throttle >= 0) acc = this.throttle * this.acceleration;
    else acc = this.speed > 0 ? this.throttle * this.braking : this.throttle * this.acceleration * 0.5;
    this.speed += acc * dt;

    const f = this.friction * dt;
    this.speed = Math.abs(this.speed) <= f ? 0 : this.speed - Math.sign(this.speed) * f;
    this.speed = MathUtil.clamp(this.speed, -this.maxReverse, this.maxSpeed);

    const wheelbase = this.length * 0.65;
    let yawRate = (this.speed / wheelbase) * Math.tan(this.steer * this.maxSteerAngle);
    const gripLimit = this.maxLateralAccel / Math.max(Math.abs(this.speed), 1);
    yawRate = MathUtil.clamp(yawRate, -gripLimit, gripLimit);

    this.angle += yawRate * dt;
    this.x += Math.cos(this.angle) * this.speed * dt;
    this.y += Math.sin(this.angle) * this.speed * dt;
    this.distance += Math.abs(this.speed) * dt;
  }

  updatePolygon() {
    writeBoxCorners(this.poly, this.x, this.y, this.angle, this.length, this.width);
  }

  _collides(borders, traffic) {
    const p = this.poly;
    for (let e = 0; e < 4; e++) {
      const f = (e + 1) & 3;
      const ax = p[e * 2], ay = p[e * 2 + 1], bx = p[f * 2], by = p[f * 2 + 1];
      for (let k = 0; k < borders.length; k++) {
        const s = borders[k];
        if (MathUtil.segmentIntersectT(ax, ay, bx, by, s.ax, s.ay, s.bx, s.by) >= 0) return true;
      }
      for (let k = 0; k < traffic.length; k++) {
        const o = traffic[k];
        if (Math.abs(o.x - this.x) > 50 || Math.abs(o.y - this.y) > 50) continue;
        const q = o.poly;
        for (let g = 0; g < 4; g++) {
          const h = (g + 1) & 3;
          if (MathUtil.segmentIntersectT(ax, ay, bx, by, q[g * 2], q[g * 2 + 1], q[h * 2], q[h * 2 + 1]) >= 0) return true;
        }
      }
    }
    return false;
  }

  /** Rolls a ghost copy forward with the same brain to preview the planned trajectory. */
  predictPath(env, steps = 36, dt = 1 / 18) {
    const ghost = new Car(this.x, this.y, this.angle, { brain: this.brain, autopilot: true });
    ghost.speed = this.speed;
    const pts = [this.x, this.y];
    for (let i = 0; i < steps; i++) {
      ghost.update(dt, env);
      if (!ghost.alive) break;
      pts.push(ghost.x, ghost.y);
    }
    return pts;
  }

  // ----------------------------------------------------------------- render

  draw(ctx, style = 'population') {
    const L = this.length, W = this.width;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    if (style === 'population') {
      ctx.fillStyle = THEME.population;
      roundRect(ctx, -L / 2, -W / 2, L, W, 5);
      ctx.fill();
    } else if (style === 'crashed') {
      ctx.fillStyle = THEME.crashed;
      roundRect(ctx, -L / 2, -W / 2, L, W, 5);
      ctx.fill();
    } else {
      Car.drawBody(ctx, L, W, style === 'hero' ? null : this.color, style === 'hero' ? this.throttle < -0.1 : false);
    }
    ctx.restore();
  }

  /** Detailed body shared by the hero car and traffic. Assumes a car-local transform. */
  static drawBody(ctx, L, W, color, braking) {
    const hero = !color;
    if (hero) {
      // headlight beams
      const beam = ctx.createLinearGradient(L / 2, 0, L / 2 + 110, 0);
      beam.addColorStop(0, 'rgba(190,220,255,0.22)');
      beam.addColorStop(1, 'rgba(190,220,255,0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(L / 2, -W / 2 + 2);
      ctx.lineTo(L / 2 + 110, -W * 1.6);
      ctx.lineTo(L / 2 + 110, W * 1.6);
      ctx.lineTo(L / 2, W / 2 - 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = THEME.accent;
      ctx.shadowBlur = 22;
    }
    const body = ctx.createLinearGradient(0, -W / 2, 0, W / 2);
    body.addColorStop(0, hero ? '#ffffff' : color);
    body.addColorStop(1, hero ? '#c9d2de' : shadeHex(color, -0.25));
    ctx.fillStyle = body;
    roundRect(ctx, -L / 2, -W / 2, L, W, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // glasshouse
    ctx.fillStyle = hero ? '#1d2735' : 'rgba(20,24,30,0.85)';
    ctx.beginPath();
    ctx.moveTo(L * 0.2, -W / 2 + 3);
    ctx.lineTo(L * 0.05, -W / 2 + 3.5);
    ctx.lineTo(-L * 0.28, -W / 2 + 3.5);
    ctx.lineTo(-L * 0.36, -W / 2 + 4);
    ctx.lineTo(-L * 0.36, W / 2 - 4);
    ctx.lineTo(-L * 0.28, W / 2 - 3.5);
    ctx.lineTo(L * 0.05, W / 2 - 3.5);
    ctx.lineTo(L * 0.2, W / 2 - 3);
    ctx.closePath();
    ctx.fill();
    // roof panel
    ctx.fillStyle = hero ? '#e9eef5' : shadeHex(color, 0.08);
    roundRect(ctx, -L * 0.24, -W / 2 + 4.5, L * 0.3, W - 9, 3);
    ctx.fill();

    // lights
    ctx.fillStyle = '#f4f8ff';
    ctx.fillRect(L / 2 - 2.5, -W / 2 + 2, 2.5, 4);
    ctx.fillRect(L / 2 - 2.5, W / 2 - 6, 2.5, 4);
    ctx.fillStyle = braking ? '#ff2d4b' : '#a3162b';
    ctx.fillRect(-L / 2, -W / 2 + 2, 2.5, 5);
    ctx.fillRect(-L / 2, W / 2 - 7, 2.5, 5);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function shadeHex(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => MathUtil.clamp(Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount), 0, 255);
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `rgb(${r},${g},${b})`;
}

// ---- data/pretrained.js

// Generated by tools/train.js on 2026-09-29 — do not edit by hand.
const PRETRAINED_BRAINS = {"downtown":{"brain":{"type":"neurodrive-brain","version":1,"sizes":[10,12,8,2],"levels":[{"biases":[0.18676,0.25491,-0.15176,-0.01966,0.01883,-0.42585,-0.38379,-0.14255,0.03181,0.12227,-0.24077,-0.41588],"weights":[-0.91872,0.38442,-0.05375,-0.62151,0.06265,-0.37976,-0.07453,-0.65088,-0.52448,0.40119,0.99248,0.54236,0.38436,0.33342,0.60989,-0.36805,0.0402,-0.3281,0.69532,-0.58134,0.46228,-0.02224,0.06333,0.0369,0.0056,0.29428,-0.10594,0.84974,0.04937,0.04289,-0.6153,0.33673,-0.41143,-0.06754,-0.21226,0.38961,0.57733,-0.29034,0.0388,-0.0582,-0.58343,0.39893,0.51049,0.15964,-0.19194,0.29179,-0.73595,-0.35617,0.31711,-1.25338,1.00382,-0.52792,-0.61084,-0.48792,-0.56971,1.50488,0.65721,-0.10807,0.2361,-0.56728,0.06062,1.3241,-0.21846,0.58109,-0.66676,-0.80808,-0.59289,0.25725,0.28283,-0.27184,0.06115,-0.61478,-0.15748,0.0918,-0.09775,-0.21045,-1.26978,0.14051,0.65103,-0.30797,0.607,0.3947,0.24776,0.51721,-0.19461,0.18472,-0.03904,-0.07812,0.16501,-1.24601,0.83706,0.03984,-0.21854,-0.83879,0.00921,-0.06503,0.81053,-0.04926,0.28579,-0.36944,0.771,0.17223,-0.21357,-0.51795,-0.88587,-0.11971,0.44333,-0.35209,0.6969,-0.42948,-0.74878,-0.11984,0.44568,0.49896,-0.26643,-0.03701,-1.01025,-0.03568,-0.68447,0.43612]},{"biases":[0.84293,0.01508,-0.22882,-0.01944,-0.13726,0.21322,0.1564,-0.18314],"weights":[-0.37649,-0.24302,0.13727,1.27691,0.63666,-0.03271,-0.1541,-0.31267,-0.21973,-0.24177,1.17874,-0.55888,0.13287,-0.07253,0.02216,-0.05664,0.07252,0.19823,0.27482,-0.26572,-0.02107,0.82517,-0.14782,0.22982,-0.20026,0.95134,1.02984,-0.02897,0.12501,0.85279,0.17107,0.34174,0.40433,-0.67535,-0.0688,-0.66051,0.651,0.29016,-0.45211,0.53241,0.21869,0.11231,-0.51105,-0.44364,-1.0379,-0.20176,-0.10288,1.22521,-0.01017,-0.40237,1.28386,-0.98262,0.15495,-1.14653,0.2032,-1.25195,-0.47893,0.19958,-0.32482,-0.21341,0.10209,0.02475,0.03185,0.89331,0.4016,0.08099,-0.01999,0.06305,-0.43654,-0.01633,0.49793,-0.14629,0.14769,0.30557,-0.11536,0.56169,-0.05144,0.5336,0.13022,0.2974,-0.16972,0.23647,0.29312,-0.76363,-0.93189,-0.20272,-0.15233,-0.4036,-0.14372,0.08732,0.31069,0.09821,0.10813,-0.046,0.18854,0.0164]},{"biases":[-0.08501,-0.36945],"weights":[0.50693,-0.78159,1.29756,-1.06635,-0.49397,-1.52843,-0.08731,-0.30931,-0.36268,-0.81779,0.39637,0.08513,0.72476,-0.49232,-0.53272,0.20759]}]},"fitness":333.72464946190524,"generations":80},"circuit":{"brain":{"type":"neurodrive-brain","version":1,"sizes":[10,12,8,2],"levels":[{"biases":[0.54408,-0.06948,0.04812,-1.08301,-0.67108,-0.0652,-0.68122,0.30923,0.53417,1.3065,-0.66075,0.40314],"weights":[0.13099,-0.38385,-1.42819,0.81377,-1.09707,-1.24082,1.39714,-0.16427,-1.00811,-0.11802,0.10765,0.30847,0.12548,-0.09561,-0.45995,0.05203,0.39961,1.90065,-1.09304,0.79988,-1.16788,0.45843,0.48878,0.77482,-1.45033,-0.24057,-0.08655,-0.71844,-1.00303,-0.90942,0.65464,-0.20444,1.84242,0.77302,0.11498,0.62485,-0.13833,1.31183,-2.19267,-0.35115,-1.5224,0.63143,-0.56436,1.48547,0.06471,0.48249,0.18171,-0.0869,-0.53343,0.8535,-0.02306,1.09668,0.10536,0.35732,0.5172,-0.30409,-0.69557,-1.29732,-0.92666,-1.25952,0.65987,-0.13584,-0.36316,0.03044,0.32331,0.37858,-1.96189,0.1533,-1.60713,0.38178,-1.69933,1.02738,-0.48726,-1.4328,-0.1427,0.52959,-0.84293,1.48089,1.21412,0.38727,-0.12307,-1.69763,-0.07205,0.54167,-1.44231,0.8577,0.57449,0.86426,0.5936,-0.38547,-1.28102,-1.37766,-0.63014,0.5197,0.03945,0.15721,0.04422,-0.57729,0.50441,1.51084,1.10795,-0.85144,0.80549,0.84597,0.93085,-0.63577,-1.35861,1.26978,0.09765,-0.6033,0.85204,0.13381,-0.22349,0.96467,0.88024,0.73875,0.29324,0.23508,1.02211,0.73328]},{"biases":[1.6845,-0.18458,-1.33466,0.68797,-0.04919,0.33352,-0.22184,0.69148],"weights":[-0.43625,0.74697,1.42664,-0.31551,-1.34535,-0.34332,0.40407,1.10245,0.52971,0.06903,-1.06551,0.09003,-0.44393,-0.7995,0.3251,-0.39362,0.16123,-0.36911,-1.3595,-0.59259,0.38161,-0.43892,-0.9251,-0.11916,-0.28828,-1.16102,-1.04678,0.29703,-0.92462,-0.26754,-0.80751,-0.1064,0.93991,0.23302,1.08712,1.09816,-0.03874,-0.39878,-0.18315,2.11638,0.10078,0.39485,0.20832,-0.63436,-0.73694,-1.34249,-0.53169,0.45193,-0.5864,-1.3378,0.20437,-0.81898,-1.08918,-0.77676,-0.04619,0.78686,0.08815,-0.61123,-0.50866,0.19154,-0.05572,-0.77898,0.41771,-0.69402,1.04178,0.90617,0.34435,0.24866,0.40627,1.72835,0.96807,-0.49709,1.08574,-0.13737,-0.20311,0.42987,0.45207,0.34675,-0.09171,1.77328,0.50165,-0.7223,0.09409,-1.07045,-0.29097,0.30545,-0.21134,-0.98088,-1.09946,0.11523,-0.21129,-0.33642,-0.14242,0.15724,-0.40974,0.28321]},{"biases":[0.9466,0.93139],"weights":[0.42284,-0.66275,0.58366,0.33745,0.58453,-1.27909,-0.59964,-0.61775,1.25267,-0.56848,-0.47624,1.75604,-0.85519,0.32353,0.06975,-0.30024]}]},"fitness":206.96699497548414,"generations":80},"ring":{"brain":{"type":"neurodrive-brain","version":1,"sizes":[10,12,8,2],"levels":[{"biases":[0.52532,0.88443,0.51147,0.03387,0.02845,0.51127,0.09683,0.52074,-0.25434,-0.55123,0.00833,0.01345],"weights":[0.27394,-0.18021,-0.95909,-0.31781,-0.69623,0.13187,0.41272,0.27855,0.05996,0.70827,1.18053,-0.04673,0.96777,1.22972,0.66867,-2.11647,-0.311,-0.0772,-0.15203,-0.373,0.09992,0.12525,0.04152,-0.48036,0.53397,-0.43493,-0.53901,-0.23788,-0.37119,-0.36435,0.25132,-0.38662,-0.05972,0.16676,1.75703,-0.71143,1.38363,0.37913,0.05509,-0.88378,0.69903,-0.5317,-0.86302,-0.02312,0.76706,0.01325,1.44306,-0.61734,0.59486,-0.66351,-0.53629,-0.2418,0.24112,-0.7429,-0.22523,-0.37244,0.6119,-0.3016,0.30224,-0.51746,0.02504,-0.30404,0.35241,-0.46518,-0.44438,-0.02373,-0.13877,-0.65181,0.27371,-0.44023,0.0832,0.6962,0.13438,-0.06678,0.15241,-0.22936,0.21429,-0.33932,0.34402,-0.1102,-0.15263,0.28206,-0.30722,-0.1367,-0.54443,0.33931,0.10775,0.36574,0.03831,-0.14768,0.42312,0.15171,-0.42288,-0.53291,-0.07146,-0.35251,0.43567,0.54042,0.22751,0.36622,0.39933,0.27622,-0.43262,0.62193,0.29916,-0.74548,0.04758,-0.96153,-0.1823,0.29639,0.01911,0.6345,0.35833,0.2393,0.43787,-0.86523,0.10149,-0.25997,-1.09138,-0.18211]},{"biases":[-0.16931,-0.03987,0.36809,0.59544,0.11986,0.07976,-0.381,-0.63075],"weights":[-0.20515,-0.90436,-0.13827,-0.41117,-0.2984,0.51396,0.54063,0.21869,0.03015,0.99833,-0.88942,-0.04051,0.11729,-1.14056,-0.94927,0.50521,0.86935,-0.17051,0.26373,-0.16929,-0.2225,-0.02527,0.53167,0.87949,0.45617,0.15586,0.45294,0.33683,-0.54263,-0.05342,-0.18892,0.3584,0.81627,0.98869,-0.61933,0.4951,0.41916,-0.31905,-0.03325,-0.23137,-0.16423,0.14853,0.2461,-0.23049,0.12239,0.21416,0.37028,0.31379,0.2093,-0.4422,0.49718,0.40572,1.09895,-0.03656,-0.13101,-0.30017,0.70581,0.50203,0.51631,-1.31161,-0.28453,-0.19199,0.10308,0.33956,0.53658,0.10399,-1.34382,0.10301,-0.46576,-0.38768,-0.87256,0.09488,0.33143,-0.36279,0.77058,-0.69527,-0.72455,0.2633,0.99033,-0.9796,1.00203,-0.10172,-0.0293,0.30248,0.11404,-0.17133,-0.07338,-0.28652,-0.15947,-0.33513,0.69581,0.14448,-0.11493,0.32221,-0.27084,0.56349]},{"biases":[0.97098,-0.06295],"weights":[1.53892,-0.36079,0.39326,0.58246,-0.08735,-0.17039,-0.34438,0.13668,-1.36696,-0.36878,-0.48834,-0.14112,-1.27717,0.68368,0.79212,-0.1607]}]},"fitness":309.49052000212276,"generations":80}};

  const api = { World, Presets, NeuralNetwork, Car, Sensor, THEME, Random, MathUtil, PRETRAINED_BRAINS };
  if (typeof window !== 'undefined') window.NeuroDrive = api; else module.exports = api;
})();
