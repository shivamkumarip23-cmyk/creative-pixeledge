/** Lightweight in-browser face detection + face swapping.
 *  Detection uses the native FaceDetector API when available and falls back to
 *  a skin-tone connected-component search, so it works fully offline. */

export type FaceBox = { x: number; y: number; w: number; h: number };

type Src = HTMLImageElement | HTMLCanvasElement;

export function toCanvasEl(src: Src): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  c.getContext("2d")!.drawImage(src, 0, 0);
  return c;
}

function isSkin(r: number, g: number, b: number) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return y > 60 && cb > 77 && cb < 135 && cr > 133 && cr < 180;
}

/** Returns the most likely face box in image coordinates, or null. */
export async function detectFace(src: Src): Promise<FaceBox | null> {
  const native = (window as unknown as { FaceDetector?: new (o?: unknown) => { detect: (i: unknown) => Promise<{ boundingBox: DOMRectReadOnly }[]> } }).FaceDetector;
  if (native) {
    try {
      const det = new native({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await det.detect(src);
      const b = faces[0]?.boundingBox;
      if (b && b.width > 8) return { x: b.x, y: b.y, w: b.width, h: b.height };
    } catch {
      /* fall through to heuristic */
    }
  }

  const W = 160;
  const scale = W / src.width;
  const H = Math.max(1, Math.round(src.height * scale));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;

  const mask = new Uint8Array(W * H);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    if (isSkin(d[i]!, d[i + 1]!, d[i + 2]!)) mask[p] = 1;
  }

  // largest connected component (4-way flood fill)
  const seen = new Uint8Array(W * H);
  const stack: number[] = [];
  let best: { n: number; x0: number; y0: number; x1: number; y1: number } | null = null;
  for (let p = 0; p < mask.length; p++) {
    if (!mask[p] || seen[p]) continue;
    stack.length = 0;
    stack.push(p);
    seen[p] = 1;
    let n = 0;
    let x0 = W;
    let y0 = H;
    let x1 = 0;
    let y1 = 0;
    while (stack.length) {
      const q = stack.pop()!;
      const x = q % W;
      const y = (q - x) / W;
      n++;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
      const nb = [x > 0 ? q - 1 : -1, x < W - 1 ? q + 1 : -1, y > 0 ? q - W : -1, y < H - 1 ? q + W : -1];
      for (const m of nb) if (m >= 0 && mask[m] && !seen[m]) { seen[m] = 1; stack.push(m); }
    }
    if (!best || n > best.n) best = { n, x0, y0, x1, y1 };
  }

  if (!best || best.n < W * H * 0.01) return null;
  const bw = best.x1 - best.x0 + 1;
  const bh = best.y1 - best.y0 + 1;
  const ratio = bw / bh;
  if (ratio < 0.25 || ratio > 4) return null;
  // faces are roughly in the upper part of a skin blob (head + neck/body)
  const fh = Math.min(bh, bw * 1.3);
  return {
    x: best.x0 / scale,
    y: best.y0 / scale,
    w: bw / scale,
    h: fh / scale,
  };
}

function stats(data: Uint8ClampedArray, alphaMask: Float32Array) {
  const mean = [0, 0, 0];
  const sd = [0, 0, 0];
  let total = 0;
  for (let p = 0, i = 0; p < alphaMask.length; p++, i += 4) {
    const a = alphaMask[p]!;
    if (a < 0.4) continue;
    total++;
    mean[0]! += data[i]!;
    mean[1]! += data[i + 1]!;
    mean[2]! += data[i + 2]!;
  }
  if (!total) return null;
  for (let k = 0; k < 3; k++) mean[k]! /= total;
  for (let p = 0, i = 0; p < alphaMask.length; p++, i += 4) {
    if (alphaMask[p]! < 0.4) continue;
    for (let k = 0; k < 3; k++) sd[k]! += (data[i + k]! - mean[k]!) ** 2;
  }
  for (let k = 0; k < 3; k++) sd[k] = Math.sqrt(sd[k]! / total) || 1;
  return { mean, sd };
}

/** Swaps the detected face of `faceSrc` onto the detected face of `base`. */
export function swapFaces(
  base: Src,
  baseBox: FaceBox,
  faceSrc: Src,
  faceBox: FaceBox,
): HTMLCanvasElement {
  const out = toCanvasEl(base);
  const ctx = out.getContext("2d", { willReadFrequently: true })!;

  // target region, slightly padded
  const pad = 0.12;
  const tx = baseBox.x - baseBox.w * pad;
  const ty = baseBox.y - baseBox.h * pad;
  const tw = baseBox.w * (1 + pad * 2);
  const th = baseBox.h * (1 + pad * 2);
  const W = Math.max(2, Math.round(tw));
  const H = Math.max(2, Math.round(th));

  // 1. render the donor face into the target-sized patch
  const patch = document.createElement("canvas");
  patch.width = W;
  patch.height = H;
  const pctx = patch.getContext("2d", { willReadFrequently: true })!;
  const fpx = faceBox.x - faceBox.w * pad;
  const fpy = faceBox.y - faceBox.h * pad;
  const fpw = faceBox.w * (1 + pad * 2);
  const fph = faceBox.h * (1 + pad * 2);
  pctx.drawImage(faceSrc, fpx, fpy, fpw, fph, 0, 0, W, H);

  // 2. elliptical feathered mask
  const alpha = new Float32Array(W * H);
  const cx = W / 2;
  const cy = H / 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x - cx) / (W * 0.46);
      const dy = (y - cy) / (H * 0.5);
      const r = Math.sqrt(dx * dx + dy * dy);
      alpha[y * W + x] = r >= 1 ? 0 : r <= 0.62 ? 1 : 1 - (r - 0.62) / 0.38;
    }
  }

  // 3. skin-tone matching against the target area
  const patchData = pctx.getImageData(0, 0, W, H);
  const targetData = ctx.getImageData(Math.round(tx), Math.round(ty), W, H);
  const sFace = stats(patchData.data, alpha);
  const sTarget = stats(targetData.data, alpha);
  const pd = patchData.data;
  const td = targetData.data;
  for (let p = 0, i = 0; p < alpha.length; p++, i += 4) {
    const a = alpha[p]!;
    if (a <= 0) {
      td[i + 3] = td[i + 3]!;
      continue;
    }
    for (let k = 0; k < 3; k++) {
      let v = pd[i + k]!;
      if (sFace && sTarget) {
        const matched = ((v - sFace.mean[k]!) / sFace.sd[k]!) * sTarget.sd[k]! + sTarget.mean[k]!;
        v = v * 0.35 + matched * 0.65;
      }
      td[i + k] = Math.max(0, Math.min(255, td[i + k]! * (1 - a) + v * a));
    }
  }
  ctx.putImageData(targetData, Math.round(tx), Math.round(ty));
  return out;
}
