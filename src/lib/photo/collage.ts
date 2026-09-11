/** Collage templates + renderer. Pure canvas helpers — no UI, no side effects. */

export type CollageShape = "rect" | "circle" | "heart" | "diamond";

export type CollageRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: CollageShape;
  rotate?: number;
};

export type CollageTemplate = {
  id: string;
  name: string;
  cat: string;
  cells: number;
  rects: CollageRect[];
};

export const COLLAGE_CATEGORIES = [
  "All",
  "Classic",
  "Grid",
  "Freestyle",
  "Magazine",
  "Polaroid",
  "Heart",
  "Modern",
  "Creative",
] as const;

const grid = (cols: number, rows: number, shape?: CollageShape): CollageRect[] => {
  const out: CollageRect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({ x: c / cols, y: r / rows, w: 1 / cols, h: 1 / rows, ...(shape ? { shape } : {}) });
    }
  }
  return out;
};

const rows = (n: number) => grid(1, n);
const cols = (n: number) => grid(n, 1);

const t = (
  id: string,
  name: string,
  cat: string,
  rects: CollageRect[],
): CollageTemplate => ({ id, name, cat, cells: rects.length, rects });

export const COLLAGE_TEMPLATES: CollageTemplate[] = [
  t("classic-2x2", "Classic 2x2", "Classic", grid(2, 2)),
  t("classic-3x3", "Classic 3x3", "Classic", grid(3, 3)),
  t("classic-2x3", "Classic 2x3", "Classic", grid(2, 3)),
  t("classic-4x4", "Classic 4x4", "Classic", grid(4, 4)),
  t("vertical-split", "Vertical Split", "Classic", cols(2)),
  t("horizontal-split", "Horizontal Split", "Classic", rows(2)),
  t("vertical-2-split", "Vertical 2 Split", "Classic", cols(3)),
  t("horizontal-2-split", "Horizontal 2 Split", "Classic", rows(3)),
  t("six-photo", "6 Photo Grid", "Grid", grid(2, 3)),
  t("five-photo", "5 Photo Grid", "Grid", [
    { x: 0, y: 0, w: 1, h: 0.5 },
    ...grid(2, 1).map((r) => ({ ...r, y: 0.5, h: 0.25 })),
    ...grid(2, 1).map((r) => ({ ...r, y: 0.75, h: 0.25 })),
  ]),
  t("collage-frame", "Collage Frame", "Grid", [
    { x: 0.06, y: 0.06, w: 0.88, h: 0.42 },
    { x: 0.06, y: 0.52, w: 0.42, h: 0.42 },
    { x: 0.52, y: 0.52, w: 0.42, h: 0.42 },
  ]),
  t("strip-collage", "Strip Collage", "Grid", rows(4)),
  t("4x1", "4x1", "Grid", cols(4)),
  t("1x4", "1x4", "Grid", rows(4)),
  t("3x1-story", "3x1 Story", "Grid", rows(3)),
  t("grid-9", "Grid 9", "Grid", grid(3, 3)),
  t("mosaic-grid", "Mosaic Grid", "Grid", [
    { x: 0, y: 0, w: 0.6, h: 0.6 },
    { x: 0.6, y: 0, w: 0.4, h: 0.3 },
    { x: 0.6, y: 0.3, w: 0.4, h: 0.3 },
    { x: 0, y: 0.6, w: 0.4, h: 0.4 },
    { x: 0.4, y: 0.6, w: 0.6, h: 0.4 },
  ]),
  t("clean-grid", "Clean Grid", "Grid", grid(2, 2)),
  t("free-style", "Free Style", "Freestyle", [
    { x: 0.04, y: 0.06, w: 0.55, h: 0.5, rotate: -5 },
    { x: 0.42, y: 0.42, w: 0.54, h: 0.5, rotate: 6 },
  ]),
  t("free-overlap", "Free Overlap", "Freestyle", [
    { x: 0.02, y: 0.1, w: 0.5, h: 0.5, rotate: -8 },
    { x: 0.3, y: 0.24, w: 0.5, h: 0.5, rotate: 4 },
    { x: 0.46, y: 0.44, w: 0.5, h: 0.5, rotate: 10 },
  ]),
  t("puzzle", "Puzzle", "Freestyle", [
    { x: 0, y: 0, w: 0.5, h: 0.66 },
    { x: 0.5, y: 0, w: 0.5, h: 0.34 },
    { x: 0.5, y: 0.34, w: 0.5, h: 0.66 },
    { x: 0, y: 0.66, w: 0.5, h: 0.34 },
  ]),
  t("random-layout", "Random Layout", "Freestyle", [
    { x: 0.05, y: 0.05, w: 0.45, h: 0.4, rotate: -6 },
    { x: 0.52, y: 0.12, w: 0.42, h: 0.36, rotate: 5 },
    { x: 0.1, y: 0.52, w: 0.5, h: 0.42, rotate: 3 },
    { x: 0.58, y: 0.56, w: 0.36, h: 0.38, rotate: -4 },
  ]),
  t("random-overlap", "Random Overlap", "Freestyle", [
    { x: 0.06, y: 0.08, w: 0.52, h: 0.46, rotate: -10 },
    { x: 0.38, y: 0.3, w: 0.56, h: 0.5, rotate: 8 },
  ]),
  t("scrapbook", "Scrapbook", "Freestyle", [
    { x: 0.06, y: 0.05, w: 0.42, h: 0.42, rotate: -7 },
    { x: 0.52, y: 0.08, w: 0.42, h: 0.38, rotate: 6 },
    { x: 0.05, y: 0.52, w: 0.44, h: 0.42, rotate: 4 },
    { x: 0.52, y: 0.55, w: 0.42, h: 0.4, rotate: -5 },
  ]),
  t("moodboard", "Moodboard", "Freestyle", [
    { x: 0.04, y: 0.04, w: 0.56, h: 0.56 },
    { x: 0.64, y: 0.04, w: 0.32, h: 0.28 },
    { x: 0.64, y: 0.36, w: 0.32, h: 0.24 },
    { x: 0.04, y: 0.64, w: 0.92, h: 0.32 },
  ]),
  t("aesthetic-overlap", "Aesthetic Overlap", "Freestyle", [
    { x: 0.1, y: 0.06, w: 0.6, h: 0.54, rotate: -4 },
    { x: 0.32, y: 0.42, w: 0.58, h: 0.52, rotate: 5 },
  ]),
  t("magazine-style", "Magazine Style", "Magazine", [
    { x: 0, y: 0, w: 1, h: 0.62 },
    { x: 0, y: 0.62, w: 0.5, h: 0.38 },
    { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
  ]),
  t("magazine-cover", "Magazine Cover", "Magazine", [{ x: 0, y: 0, w: 1, h: 1 }]),
  t("collage-text", "Collage with Text", "Magazine", [
    { x: 0.04, y: 0.04, w: 0.92, h: 0.6 },
    { x: 0.04, y: 0.68, w: 0.44, h: 0.28 },
    { x: 0.52, y: 0.68, w: 0.44, h: 0.28 },
  ]),
  t("collage-quote", "Collage with Quote", "Magazine", [
    { x: 0.04, y: 0.04, w: 0.44, h: 0.6 },
    { x: 0.52, y: 0.04, w: 0.44, h: 0.6 },
  ]),
  t("good-vibes", "Good Vibes", "Magazine", [
    { x: 0.05, y: 0.05, w: 0.9, h: 0.55 },
    { x: 0.05, y: 0.64, w: 0.9, h: 0.31 },
  ]),
  t("retro-magazine", "Retro Magazine", "Magazine", [
    { x: 0.04, y: 0.04, w: 0.6, h: 0.5 },
    { x: 0.66, y: 0.04, w: 0.3, h: 0.5 },
    { x: 0.04, y: 0.58, w: 0.92, h: 0.38 },
  ]),
  t("polaroid-style", "Polaroid Style", "Polaroid", [{ x: 0.12, y: 0.1, w: 0.76, h: 0.7 }]),
  t("polaroid-stack", "Polaroid Stack", "Polaroid", [
    { x: 0.12, y: 0.06, w: 0.62, h: 0.5, rotate: -7 },
    { x: 0.26, y: 0.42, w: 0.62, h: 0.5, rotate: 6 },
  ]),
  t("polaroid-wall", "Polaroid Wall", "Polaroid", [
    { x: 0.06, y: 0.06, w: 0.4, h: 0.4, rotate: -4 },
    { x: 0.54, y: 0.06, w: 0.4, h: 0.4, rotate: 4 },
    { x: 0.06, y: 0.54, w: 0.4, h: 0.4, rotate: 5 },
    { x: 0.54, y: 0.54, w: 0.4, h: 0.4, rotate: -5 },
  ]),
  t("film-strip", "Film Strip", "Polaroid", [
    { x: 0.14, y: 0.04, w: 0.72, h: 0.22 },
    { x: 0.14, y: 0.28, w: 0.72, h: 0.22 },
    { x: 0.14, y: 0.52, w: 0.72, h: 0.22 },
    { x: 0.14, y: 0.76, w: 0.72, h: 0.22 },
  ]),
  t("heart-shape", "Heart Shape", "Heart", [
    { x: 0.08, y: 0.08, w: 0.84, h: 0.84, shape: "heart" },
  ]),
  t("heart-4-cut", "Heart 4 Cut", "Heart", [
    { x: 0.04, y: 0.04, w: 0.44, h: 0.44, shape: "heart" },
    { x: 0.52, y: 0.04, w: 0.44, h: 0.44, shape: "heart" },
    { x: 0.04, y: 0.52, w: 0.44, h: 0.44, shape: "heart" },
    { x: 0.52, y: 0.52, w: 0.44, h: 0.44, shape: "heart" },
  ]),
  t("circle-collage", "Circle Collage", "Heart", [
    { x: 0.04, y: 0.04, w: 0.44, h: 0.44, shape: "circle" },
    { x: 0.52, y: 0.04, w: 0.44, h: 0.44, shape: "circle" },
    { x: 0.04, y: 0.52, w: 0.44, h: 0.44, shape: "circle" },
    { x: 0.52, y: 0.52, w: 0.44, h: 0.44, shape: "circle" },
  ]),
  t("circle-frame", "Circle Frame", "Heart", [
    { x: 0.1, y: 0.1, w: 0.8, h: 0.8, shape: "circle" },
  ]),
  t("diamond", "Diamond", "Creative", [
    { x: 0.1, y: 0.1, w: 0.8, h: 0.8, shape: "diamond" },
  ]),
  t("diamond-5", "Diamond 5", "Creative", [
    { x: 0.3, y: 0.02, w: 0.4, h: 0.4, shape: "diamond" },
    { x: 0.02, y: 0.3, w: 0.4, h: 0.4, shape: "diamond" },
    { x: 0.58, y: 0.3, w: 0.4, h: 0.4, shape: "diamond" },
    { x: 0.3, y: 0.58, w: 0.4, h: 0.4, shape: "diamond" },
    { x: 0.3, y: 0.3, w: 0.4, h: 0.4, shape: "diamond" },
  ]),
  t("insta-style", "Insta Style", "Modern", [
    { x: 0, y: 0, w: 1, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ]),
  t("minimal", "Minimal", "Modern", [{ x: 0.08, y: 0.08, w: 0.84, h: 0.84 }]),
  t("minimal-black", "Minimal Black", "Modern", [{ x: 0.1, y: 0.14, w: 0.8, h: 0.72 }]),
  t("rounded-corners", "Rounded Corners", "Modern", grid(2, 2)),
  t("big-center-5", "Big Center 5", "Modern", [
    { x: 0.25, y: 0.25, w: 0.5, h: 0.5 },
    { x: 0, y: 0, w: 1, h: 0.25 },
    { x: 0, y: 0.75, w: 1, h: 0.25 },
    { x: 0, y: 0.25, w: 0.25, h: 0.5 },
    { x: 0.75, y: 0.25, w: 0.25, h: 0.5 },
  ]),
  t("big-left-4", "Big Left 4", "Modern", [
    { x: 0, y: 0, w: 0.62, h: 1 },
    { x: 0.62, y: 0, w: 0.38, h: 1 / 3 },
    { x: 0.62, y: 1 / 3, w: 0.38, h: 1 / 3 },
    { x: 0.62, y: 2 / 3, w: 0.38, h: 1 / 3 },
  ]),
  t("l-shape-3", "L-Shape 3", "Creative", [
    { x: 0, y: 0, w: 0.6, h: 0.6 },
    { x: 0.6, y: 0, w: 0.4, h: 1 },
    { x: 0, y: 0.6, w: 0.6, h: 0.4 },
  ]),
  t("zigzag-creative", "Zigzag Creative", "Creative", [
    { x: 0.02, y: 0.02, w: 0.6, h: 0.3, rotate: -3 },
    { x: 0.38, y: 0.35, w: 0.6, h: 0.3, rotate: 3 },
    { x: 0.02, y: 0.68, w: 0.6, h: 0.3, rotate: -3 },
  ]),
];

function clipShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: CollageShape,
  radius: number,
) {
  ctx.beginPath();
  if (shape === "circle") {
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
  } else if (shape === "heart") {
    const cx = x + w / 2;
    const top = y + h * 0.28;
    ctx.moveTo(cx, y + h * 0.95);
    ctx.bezierCurveTo(x - w * 0.1, y + h * 0.55, x + w * 0.12, y - h * 0.05, cx, top);
    ctx.bezierCurveTo(x + w * 0.88, y - h * 0.05, x + w * 1.1, y + h * 0.55, cx, y + h * 0.95);
    ctx.closePath();
  } else {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  ctx.clip();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const iw = (img as HTMLImageElement).width || 1;
  const ih = (img as HTMLImageElement).height || 1;
  const scale = Math.max(w / iw, h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/** Draws a collage template onto a canvas using the given photos (cycled if fewer). */
export function renderCollage(
  canvas: HTMLCanvasElement,
  template: CollageTemplate,
  images: CanvasImageSource[],
  size = 1080,
  options: { gap?: number; background?: string } = {},
) {
  const gap = options.gap ?? size * 0.008;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = options.background ?? "#ffffff";
  ctx.fillRect(0, 0, size, size);
  if (!images.length) return canvas;

  template.rects.forEach((rect, i) => {
    const img = images[i % images.length]!;
    const x = rect.x * size + gap / 2;
    const y = rect.y * size + gap / 2;
    const w = Math.max(1, rect.w * size - gap);
    const h = Math.max(1, rect.h * size - gap);
    ctx.save();
    if (rect.rotate) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((rect.rotate * Math.PI) / 180);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }
    clipShape(ctx, x, y, w, h, rect.shape ?? "rect", size * 0.02);
    drawCover(ctx, img, x, y, w, h);
    ctx.restore();
  });
  return canvas;
}

/** Simple auto-layout used when exporting several photos as one composite. */
export function autoTemplate(count: number): CollageTemplate {
  if (count <= 1) return t("auto-1", "Single", "Classic", [{ x: 0, y: 0, w: 1, h: 1 }]);
  if (count === 2) return t("auto-2", "Two", "Classic", rows(2));
  if (count === 3) return t("auto-3", "Three", "Classic", rows(3));
  return t("auto-4", "Four", "Classic", grid(2, 2));
}
