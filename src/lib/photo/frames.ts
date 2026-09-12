/** Borders & frames drawn on top of the rendered photo.
 *  Every frame is resolution independent — sizes are fractions of the smaller side. */

export type Frame = { id: string; name: string; group: string };

export const frames: Frame[] = [
  { id: "none", name: "None", group: "Basic" },
  { id: "thin", name: "Thin", group: "Basic" },
  { id: "medium", name: "Medium", group: "Basic" },
  { id: "thick", name: "Thick", group: "Basic" },
  { id: "inset", name: "Inset", group: "Basic" },
  { id: "double", name: "Double", group: "Basic" },
  { id: "triple", name: "Triple", group: "Basic" },
  { id: "dashed", name: "Dashed", group: "Basic" },
  { id: "dotted", name: "Dotted", group: "Basic" },
  { id: "rounded", name: "Rounded", group: "Soft" },
  { id: "pill", name: "Pill", group: "Soft" },
  { id: "circle", name: "Circle", group: "Soft" },
  { id: "arch", name: "Arch", group: "Soft" },
  { id: "corners", name: "Corners", group: "Modern" },
  { id: "ticket", name: "Ticket", group: "Modern" },
  { id: "shadowbox", name: "Shadow Box", group: "Modern" },
  { id: "neon", name: "Neon Glow", group: "Modern" },
  { id: "gradient", name: "Gradient", group: "Modern" },
  { id: "polaroid", name: "Polaroid", group: "Retro" },
  { id: "polaroidwide", name: "Polaroid Wide", group: "Retro" },
  { id: "film", name: "Film Strip", group: "Retro" },
  { id: "slide", name: "Slide", group: "Retro" },
  { id: "grunge", name: "Grunge", group: "Retro" },
  { id: "scallop", name: "Scallop", group: "Retro" },
];

export type FrameSettings = { id: string; color: string; width: number };

export const defaultFrame: FrameSettings = { id: "none", color: "#ffffff", width: 50 };

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Punches a hole in the frame colour so only the border area is painted. */
function paintAround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  path: () => void,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  path();
  ctx.fillStyle = color;
  ctx.fill("evenodd");
  ctx.restore();
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FrameSettings,
) {
  const { id, color } = settings;
  if (!id || id === "none") return;
  const min = Math.min(w, h);
  const k = Math.max(0.1, settings.width / 50); // 50 = default thickness
  const t = min * 0.03 * k;

  ctx.save();
  switch (id) {
    case "thin":
    case "medium":
    case "thick": {
      const mult = id === "thin" ? 0.4 : id === "medium" ? 1 : 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = t * mult;
      ctx.strokeRect((t * mult) / 2, (t * mult) / 2, w - t * mult, h - t * mult);
      break;
    }
    case "inset": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.35;
      ctx.strokeRect(t, t, w - t * 2, h - t * 2);
      break;
    }
    case "double": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.5;
      ctx.strokeRect(t * 0.3, t * 0.3, w - t * 0.6, h - t * 0.6);
      ctx.strokeRect(t * 1.2, t * 1.2, w - t * 2.4, h - t * 2.4);
      break;
    }
    case "triple": {
      ctx.strokeStyle = color;
      for (let i = 0; i < 3; i++) {
        ctx.lineWidth = t * 0.32;
        const o = t * (0.3 + i * 0.8);
        ctx.strokeRect(o, o, w - o * 2, h - o * 2);
      }
      break;
    }
    case "dashed":
    case "dotted": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.5;
      ctx.lineCap = id === "dotted" ? "round" : "butt";
      ctx.setLineDash(id === "dotted" ? [0.1, t * 1.4] : [t * 1.6, t * 1.1]);
      ctx.strokeRect(t, t, w - t * 2, h - t * 2);
      break;
    }
    case "rounded":
    case "pill": {
      const r = id === "pill" ? min * 0.22 * k : min * 0.08 * k;
      paintAround(ctx, w, h, color, () => roundRect(ctx, t, t, w - t * 2, h - t * 2, r));
      break;
    }
    case "circle": {
      paintAround(ctx, w, h, color, () => {
        ctx.ellipse(w / 2, h / 2, w / 2 - t, h / 2 - t, 0, 0, Math.PI * 2);
      });
      break;
    }
    case "arch": {
      paintAround(ctx, w, h, color, () => {
        const r = (w - t * 2) / 2;
        ctx.moveTo(t, h - t);
        ctx.lineTo(t, t + r);
        ctx.arc(w / 2, t + r, r, Math.PI, 0);
        ctx.lineTo(w - t, h - t);
        ctx.closePath();
      });
      break;
    }
    case "corners": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.6;
      const len = min * 0.12 * k;
      const o = t;
      const corner = (x: number, y: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(x + dx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * len);
        ctx.stroke();
      };
      corner(o, o, 1, 1);
      corner(w - o, o, -1, 1);
      corner(o, h - o, 1, -1);
      corner(w - o, h - o, -1, -1);
      break;
    }
    case "ticket": {
      paintAround(ctx, w, h, color, () => {
        ctx.rect(t, t, w - t * 2, h - t * 2);
      });
      ctx.fillStyle = color;
      const r = t * 0.9;
      for (const y of [0, h]) {
        for (let x = r * 2; x < w; x += r * 4) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case "shadowbox": {
      paintAround(ctx, w, h, color, () => ctx.rect(t * 1.4, t * 1.4, w - t * 2.8, h - t * 2.8));
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = t * 0.5;
      ctx.filter = `blur(${t * 0.4}px)`;
      ctx.strokeRect(t * 1.4, t * 1.4, w - t * 2.8, h - t * 2.8);
      ctx.restore();
      break;
    }
    case "neon": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.4;
      ctx.shadowColor = color;
      for (const blur of [t * 2.2, t * 1.2, t * 0.5]) {
        ctx.shadowBlur = blur;
        ctx.strokeRect(t, t, w - t * 2, h - t * 2);
      }
      break;
    }
    case "gradient": {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#ff6ec7");
      g.addColorStop(0.5, "#8b5cf6");
      g.addColorStop(1, "#3b82f6");
      paintAround(ctx, w, h, "#000", () => ctx.rect(t, t, w - t * 2, h - t * 2));
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      break;
    }
    case "polaroid":
    case "polaroidwide": {
      const side = t * 1.1;
      const bottom = id === "polaroidwide" ? t * 5 : t * 3.6;
      paintAround(ctx, w, h, color, () =>
        ctx.rect(side, side, w - side * 2, h - side - bottom),
      );
      break;
    }
    case "film": {
      const band = t * 2.2;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, band);
      ctx.fillRect(0, h - band, w, band);
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      const hw = band * 0.5;
      const hh = band * 0.45;
      for (let x = band * 0.6; x < w - hw; x += band * 1.5) {
        roundRect(ctx, x, band * 0.28, hw, hh, hh * 0.25);
        ctx.fill();
        roundRect(ctx, x, h - band + band * 0.28, hw, hh, hh * 0.25);
        ctx.fill();
      }
      break;
    }
    case "slide": {
      paintAround(ctx, w, h, color, () => ctx.rect(t * 1.8, t * 2.6, w - t * 3.6, h - t * 5.2));
      break;
    }
    case "grunge": {
      ctx.strokeStyle = color;
      ctx.lineWidth = t * 0.8;
      ctx.lineJoin = "round";
      ctx.beginPath();
      const jitter = () => (Math.random() - 0.5) * t * 0.8;
      const pts: [number, number][] = [
        [t, t],
        [w - t, t],
        [w - t, h - t],
        [t, h - t],
      ];
      pts.forEach(([x, y], i) => {
        const nx = x + jitter();
        const ny = y + jitter();
        if (i === 0) ctx.moveTo(nx, ny);
        else ctx.lineTo(nx, ny);
      });
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case "scallop": {
      const r = t * 1.1;
      paintAround(ctx, w, h, color, () => {
        ctx.rect(r, r, w - r * 2, h - r * 2);
      });
      ctx.fillStyle = color;
      for (let x = r; x <= w - r; x += r * 2) {
        ctx.beginPath();
        ctx.arc(x, r, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, h - r, r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let y = r; y <= h - r; y += r * 2) {
        ctx.beginPath();
        ctx.arc(r, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w - r, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
}
