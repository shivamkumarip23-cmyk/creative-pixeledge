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
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const s of strokes) {
    if (s.points.length === 0) continue;
    ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    ctx.globalAlpha = s.erase ? 1 : s.opacity;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = Math.max(1, s.width * min);
    ctx.beginPath();
    const p0 = s.points[0]!;
    ctx.moveTo(p0.x * w, p0.y * h);
    if (s.points.length === 1) ctx.lineTo(p0.x * w + 0.01, p0.y * h);
    for (let i = 1; i < s.points.length; i++) {
      const p = s.points[i]!;
      ctx.lineTo(p.x * w, p.y * h);
    }
    ctx.stroke();
  }
  ctx.restore();
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
    } else {
      const weight = item.bold ? "700" : "400";
      const style = item.italic ? "italic " : "";
      ctx.font = `${style}${weight} ${px}px ${fontStack(item.font)}`;
      const lines = item.text.split("\n");
      const lh = px * 1.15;
      const top = -((lines.length - 1) * lh) / 2;
      if (item.shadow > 0) {
        ctx.shadowColor = `rgba(0,0,0,${0.75 * item.shadow})`;
        ctx.shadowBlur = px * 0.28 * item.shadow;
        ctx.shadowOffsetY = px * 0.06 * item.shadow;
      }
      lines.forEach((line, i) => {
        const y = top + i * lh;
        if (item.strokeWidth > 0) {
          ctx.lineJoin = "round";
          ctx.strokeStyle = item.strokeColor;
          ctx.lineWidth = px * item.strokeWidth;
          ctx.strokeText(line, 0, y);
        }
        ctx.fillStyle = item.color;
        ctx.fillText(line, 0, y);
      });
    }
    ctx.restore();
  }
}
