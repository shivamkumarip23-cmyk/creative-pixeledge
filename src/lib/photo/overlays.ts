/** Overlay layer model: text, stickers and freehand drawing.
 *  All coordinates are normalised 0..1 relative to the exported canvas so the
 *  same data renders identically at preview size and at full resolution. */

export type TextItem = {
  id: string;
  kind: "text";
  text: string;
  x: number; // 0..1 centre
  y: number;
  size: number; // fraction of canvas height
  rotation: number; // degrees
  font: string;
  color: string;
  /** Optional second colour — when set the text is filled with a gradient. */
  gradient?: string | null;
  strokeColor: string;
  strokeWidth: number; // 0..1 relative to font size
  shadow: number; // 0..1
  opacity: number; // 0..1
  bold: boolean;
  italic: boolean;
  /** Arc bend in degrees, -180..180. 0 = straight. */
  curve?: number;
  /** 3D extrusion depth, 0..1 relative to font size. */
  depth?: number;
};

export type StickerItem = {
  id: string;
  kind: "sticker";
  char: string;
  x: number;
  y: number;
  size: number; // fraction of canvas height
  rotation: number;
  opacity: number;
};

/** Sticker loaded from a URL (custom sticker / shape pack). */
export type ImageItem = {
  id: string;
  kind: "image";
  src: string;
  x: number;
  y: number;
  size: number; // fraction of canvas height
  rotation: number;
  opacity: number;
};

export type OverlayItem = TextItem | StickerItem | ImageItem;

export type BrushStyle = "brush" | "marker" | "neon" | "calligraphy";

export type Stroke = {
  id: string;
  color: string;
  width: number; // fraction of the canvas smaller side
  erase: boolean;
  opacity: number;
  style?: BrushStyle;
  points: { x: number; y: number }[];
};

export type Overlays = {
  items: OverlayItem[];
  strokes: Stroke[];
};

export const emptyOverlays: Overlays = { items: [], strokes: [] };

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ------------------------------------------------------------------ fonts */

export type FontOption = { name: string; stack: string; label: string };

export const fontOptions: FontOption[] = [
  { name: "Anton", label: "Anton", stack: '"Anton", sans-serif' },
  { name: "Archivo Black", label: "Archivo", stack: '"Archivo Black", sans-serif' },
  { name: "Bebas Neue", label: "Bebas", stack: '"Bebas Neue", sans-serif' },
  { name: "Abril Fatface", label: "Abril", stack: '"Abril Fatface", serif' },
  { name: "Playfair Display", label: "Playfair", stack: '"Playfair Display", serif' },
  { name: "Cormorant Garamond", label: "Cormorant", stack: '"Cormorant Garamond", serif' },
  { name: "Lobster", label: "Lobster", stack: '"Lobster", cursive' },
  { name: "Pacifico", label: "Pacifico", stack: '"Pacifico", cursive' },
  { name: "Dancing Script", label: "Dancing", stack: '"Dancing Script", cursive' },
  { name: "Great Vibes", label: "Great Vibes", stack: '"Great Vibes", cursive' },
  { name: "Caveat", label: "Caveat", stack: '"Caveat", cursive' },
  { name: "Permanent Marker", label: "Marker", stack: '"Permanent Marker", cursive' },
  { name: "Bangers", label: "Bangers", stack: '"Bangers", cursive' },
  { name: "Righteous", label: "Righteous", stack: '"Righteous", sans-serif' },
  { name: "Space Grotesk", label: "Grotesk", stack: '"Space Grotesk", sans-serif' },
  { name: "Montserrat", label: "Montserrat", stack: '"Montserrat", sans-serif' },
  { name: "Oswald", label: "Oswald", stack: '"Oswald", sans-serif' },
  { name: "Poppins", label: "Poppins", stack: '"Poppins", sans-serif' },
  { name: "Raleway", label: "Raleway", stack: '"Raleway", sans-serif' },
  { name: "Rubik Mono One", label: "Rubik Mono", stack: '"Rubik Mono One", sans-serif' },
  { name: "Press Start 2P", label: "Pixel", stack: '"Press Start 2P", monospace' },
  { name: "JetBrains Mono", label: "Mono", stack: '"JetBrains Mono", monospace' },
  { name: "Shadows Into Light", label: "Shadows", stack: '"Shadows Into Light", cursive' },
  { name: "Satisfy", label: "Satisfy", stack: '"Satisfy", cursive' },
  { name: "Fredoka", label: "Fredoka", stack: '"Fredoka", sans-serif' },
  { name: "Titan One", label: "Titan", stack: '"Titan One", cursive' },
];

export const googleFontsHref =
  "https://fonts.googleapis.com/css2?" +
  fontOptions
    .map((f) => `family=${f.name.replace(/ /g, "+")}:wght@400;700`)
    .join("&") +
  "&display=swap";

export const fontStack = (name: string) =>
  fontOptions.find((f) => f.name === name)?.stack ?? '"Space Grotesk", sans-serif';

/* --------------------------------------------------------------- stickers */

export type StickerCategory = { name: string; items: string[] };

export const stickerCategories: StickerCategory[] = [
  {
    name: "Smileys",
    items: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩",
      "😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤗","🤭","🤔","🤨","😐","😴","🤤",
      "😎","🥳","🤠","🥺","😭","😤","😡","🤯","😱","🤫","🤑","🤡","👻","💀","👽","🤖",
    ],
  },
  {
    name: "Love",
    items: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💖","💗","💓","💞","💕","💘","💝","💟","♥️","💔","😻","💌"],
  },
  {
    name: "Hands",
    items: ["👍","👎","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","👏","🙌","🤝","🙏","💪","✍️","🫶"],
  },
  {
    name: "Party",
    items: ["✨","🎉","🎊","🎈","🎁","🎂","🍾","🥂","🍻","🎆","🎇","🪩","🕯️","🎀","🎵","🎶","🔥","💥","⭐","🌟"],
  },
  {
    name: "Nature",
    items: ["🌸","🌺","🌻","🌹","🌷","🌼","🍀","🌿","🌴","🌵","🍁","🍂","🌙","☀️","⛅","🌈","❄️","⚡","🌊","🦋"],
  },
  {
    name: "Food",
    items: ["🍕","🍔","🍟","🌮","🍣","🍩","🍪","🍰","🍫","🍦","🍓","🍉","🍒","🥑","☕","🧋","🍺","🍷","🥐","🍿"],
  },
  {
    name: "Travel",
    items: ["✈️","🚗","🏍️","🚲","🛵","🚀","🛸","⛵","🏖️","🏝️","🏔️","🗺️","🧭","📍","🎒","📸","🌍","🎡","🎢","🗽"],
  },
  {
    name: "Trendy",
    items: ["💎","👑","🕶️","👟","💄","💅","🎧","🎮","📱","💻","🛹","🏀","⚽","🏆","🥇","💸","📈","🧿","☯️","♾️"],
  },
  {
    name: "Gen-Z",
    items: [
      "💅","✨","🫶","🥹","😮‍💨","🤌","🫠","🫡","🧸","🪩","🦄","🐻","🍄","🌈","🫧","🪐","👾","🛸","🧋","🍡",
      "🎀","🪷","🧁","🩷","🩵","🩶","🫥","😶‍🌫️","🥲","🤳","📼","💿","🕹️","🧃","🪞","🪄","🔮","🧊","🛼","🎯",
    ],
  },
  {
    name: "Animals",
    items: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆",
      "🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐢","🐍","🦎","🐙","🦑","🦀","🐠","🐬",
      "🐳","🦈","🐊","🐅","🦓","🦍","🐘","🦒","🐑","🦔",
    ],
  },
  {
    name: "Weather",
    items: ["☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌬️","💨","🌪️","🌫️","🌊","💧","💦","☔","🌂","🌡️","🔥","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","⭐","🌠","🌌"],
  },
  {
    name: "Sports",
    items: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🥅","🏒","🏑","🥍","🏏","⛳","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🏋️","🤸","🤾","🏄","🚴","🚵","🏆","🏅"],
  },
  {
    name: "Objects",
    items: ["📷","📹","🎥","📺","📻","🎙️","🎚️","🎛️","⏰","⌚","🔔","💡","🔦","🕯️","🧯","🛒","🎒","👜","👛","🧳","☂️","🔑","🗝️","🔒","🔓","📌","📎","✂️","📏","📐","🖊️","🖍️","📚","📖","📝","🗞️","💌","📮","🎁","🛍️"],
  },
  {
    name: "Shapes",
    items: [
      "●","○","◍","◉","◎","◐","◑","◒","◓","■","□","▢","▣","▤","▥","▦","▧","▨","▩","▪",
      "▫","▬","▭","▮","▯","▰","▱","▲","△","▴","▵","▶","▷","▸","▹","►","▻","▼","▽","▾",
      "◀","◁","◂","◃","◄","◅","◆","◇","◈","◊","○","◌","◘","◙","◚","◛","◜","◝","◞","◟",
      "◠","◡","◢","◣","◤","◥","◦","◧","◨","◩","◪","◫","◬","◭","◮","◯","⬒","⬓","⬔","⬕",
      "⬖","⬗","⬘","⬙","⬚","⬛","⬜","⬝","⬞","⬟","⬠","⬡","⬢","⬣","⭓","⭔","⭑","⭒","✦","✧",
    ],
  },
  {
    name: "Symbols",
    items: [
      "★","☆","✩","✪","✫","✬","✭","✮","✯","✰","✱","✲","✳","✴","✵","✶","✷","✸","✹","✺",
      "❀","❁","❂","❃","❄","❅","❆","❇","❈","❉","❊","❋","♡","♥","♢","♦","♤","♠","♧","♣",
      "☾","☽","☼","☀","☁","☂","☃","✈","✆","✉","✌","✍","✏","✒","✂","☎","☑","☒","✓","✔",
      "♩","♪","♫","♬","♭","♮","♯","∞","≈","≠","±","÷","×","§","¶","†","‡","•","‣","※",
    ],
  },
  {
    name: "Arrows",
    items: [
      "←","↑","→","↓","↔","↕","↖","↗","↘","↙","↚","↛","↜","↝","↞","↟","↠","↡","↢","↣",
      "↦","↩","↪","↫","↬","↭","↮","↯","↰","↱","↲","↳","↴","↵","↶","↷","↺","↻","⇄","⇅",
      "⇆","⇇","⇈","⇉","⇊","⇋","⇌","⇐","⇑","⇒","⇓","⇔","⇕","⇖","⇗","⇘","⇙","➜","➡","➢",
    ],
  },
];

export const allStickers = stickerCategories.flatMap((c) =>
  c.items.map((char) => ({ char, category: c.name })),
);

/* -------------------------------------------------------- image stickers */

const imageCache = new Map<string, HTMLImageElement>();

export function getOverlayImage(src: string): HTMLImageElement {
  let img = imageCache.get(src);
  if (!img) {
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    imageCache.set(src, img);
  }
  return img;
}

/** Makes sure every image sticker is decoded before an export render. */
export async function preloadOverlayImages(overlays: Overlays) {
  await Promise.all(
    overlays.items
      .filter((i): i is ImageItem => i.kind === "image")
      .map(
        (i) =>
          new Promise<void>((resolve) => {
            const img = getOverlayImage(i.src);
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
  );
}

/* ---------------------------------------------------------------- drawing */

export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  strokes: Stroke[],
) {
  const min = Math.min(w, h);
  for (const s of strokes) {
    if (s.points.length === 0) continue;
    const style = s.style ?? "brush";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = style === "marker" || style === "calligraphy" ? "square" : "round";
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.globalAlpha = s.erase ? 1 : style === "marker" ? s.opacity * 0.55 : s.opacity;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = Math.max(1, s.width * min * (style === "marker" ? 1.4 : 1));

    const trace = () => {
      ctx.beginPath();
      const p0 = s.points[0]!;
      ctx.moveTo(p0.x * w, p0.y * h);
      if (s.points.length === 1) ctx.lineTo(p0.x * w + 0.01, p0.y * h);
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i]!;
        ctx.lineTo(p.x * w, p.y * h);
      }
      ctx.stroke();
    };

    if (style === "neon" && !s.erase) {
      ctx.shadowColor = s.color;
      ctx.shadowBlur = Math.max(4, s.width * min * 1.8);
      trace();
      trace();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.globalAlpha = s.opacity * 0.9;
      ctx.lineWidth = Math.max(1, s.width * min * 0.35);
      trace();
    } else if (style === "calligraphy" && !s.erase) {
      for (const [dx, dy, a] of [
        [-0.35, 0.35, 1],
        [0, 0, 1],
        [0.35, -0.35, 0.8],
      ] as const) {
        ctx.save();
        ctx.globalAlpha = s.opacity * a;
        ctx.translate(dx * s.width * min, dy * s.width * min);
        trace();
        ctx.restore();
      }
    } else {
      trace();
    }
    ctx.restore();
  }
}


/** Composites text, stickers and brush strokes on top of an edited photo. */
export function drawOverlays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  overlays: Overlays,
) {
  if (overlays.strokes.length) {
    const layer = document.createElement("canvas");
    layer.width = w;
    layer.height = h;
    const lc = layer.getContext("2d");
    if (lc) {
      drawStrokes(lc, w, h, overlays.strokes);
      ctx.drawImage(layer, 0, 0);
    }
  }

  for (const item of overlays.items) {
    ctx.save();
    ctx.globalAlpha = item.opacity;
    ctx.translate(item.x * w, item.y * h);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const px = item.size * h;
    if (item.kind === "sticker") {
      ctx.font = `${px}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.fillText(item.char, 0, 0);
    } else if (item.kind === "image") {
      const img = getOverlayImage(item.src);
      if (img.complete && img.naturalWidth) {
        const ratio = img.naturalWidth / img.naturalHeight;
        const ih = px;
        const iw = px * ratio;
        ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
      }
    } else {
      const weight = item.bold ? "700" : "400";
      const style = item.italic ? "italic " : "";
      ctx.font = `${style}${weight} ${px}px ${fontStack(item.font)}`;
      const lines = item.text.split("\n");
      const lh = px * 1.15;
      const top = -((lines.length - 1) * lh) / 2;
      const depth = item.depth ?? 0;
      const curve = item.curve ?? 0;

      const fillStyleFor = (width: number) => {
        if (!item.gradient) return item.color;
        const g = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
        g.addColorStop(0, item.color);
        g.addColorStop(1, item.gradient);
        return g;
      };

      const paintLine = (line: string, y: number) => {
        const width = ctx.measureText(line).width || px;
        // 3D extrusion
        if (depth > 0) {
          ctx.save();
          ctx.fillStyle = item.strokeColor;
          const steps = Math.max(2, Math.round(depth * 18));
          for (let d = steps; d >= 1; d--) {
            const o = (d / steps) * depth * px * 0.35;
            ctx.fillText(line, o, y + o);
          }
          ctx.restore();
        }
        if (item.shadow > 0) {
          ctx.shadowColor = `rgba(0,0,0,${0.75 * item.shadow})`;
          ctx.shadowBlur = px * 0.28 * item.shadow;
          ctx.shadowOffsetY = px * 0.06 * item.shadow;
        }
        if (item.strokeWidth > 0) {
          ctx.lineJoin = "round";
          ctx.strokeStyle = item.strokeColor;
          ctx.lineWidth = px * item.strokeWidth;
          ctx.strokeText(line, 0, y);
        }
        ctx.fillStyle = fillStyleFor(width);
        ctx.fillText(line, 0, y);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      };

      lines.forEach((line, i) => {
        const y = top + i * lh;
        if (!curve) {
          paintLine(line, y);
          return;
        }
        // Arc layout: rotate around a virtual circle centred above/below the text.
        const chars = [...line];
        const widths = chars.map((c) => ctx.measureText(c).width);
        const total = widths.reduce((a, b) => a + b, 0) || 1;
        const angle = (Math.abs(curve) * Math.PI) / 180;
        const radius = total / angle;
        const dir = curve > 0 ? 1 : -1;
        let acc = -total / 2;
        chars.forEach((ch, ci) => {
          const cw = widths[ci]!;
          const theta = ((acc + cw / 2) / radius) * dir;
          ctx.save();
          ctx.translate(0, y + dir * radius);
          ctx.rotate(theta);
          ctx.translate(0, -dir * radius);
          paintLine(ch, 0);
          ctx.restore();
          acc += cw;
        });
      });
    }
    ctx.restore();
  }
}
