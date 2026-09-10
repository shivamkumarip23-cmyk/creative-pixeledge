/** Records a still photo + a music track into a real video file (canvas + audio). */

export const FALLBACK_MUSIC = "/music/background.mp3";

export function proxiedAudioUrl(url: string) {
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return url;
  return `/api/public/music-preview?url=${encodeURIComponent(url)}`;
}

export async function loadAudioWithFallback(url: string) {
  return new Promise<HTMLAudioElement>((resolve, reject) => {
    const tryLoad = (src: string) => {
      const a = new Audio();
      a.crossOrigin = "anonymous";
      a.src = src;
      a.oncanplay = () => resolve(a);
      a.onerror = () => {
        if (src !== FALLBACK_MUSIC) tryLoad(FALLBACK_MUSIC);
        else reject(new Error("Could not load this song"));
      };
      a.load();
    };
    tryLoad(proxiedAudioUrl(url));
  });
}

function pickMimeType() {
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export type VideoResult = { blob: Blob; ext: string };

export async function recordPhotoVideo({
  source,
  audioUrl,
  durationMs = 15000,
  onProgress,
}: {
  source: HTMLCanvasElement;
  audioUrl: string;
  durationMs?: number;
  onProgress?: (pct: number) => void;
}): Promise<VideoResult> {
  if (typeof MediaRecorder === "undefined") throw new Error("Recording isn't supported here");

  // Repaint the still frame every animation frame so the stream produces frames.
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const paintCtx = canvas.getContext("2d")!;
  const stream = canvas.captureStream(30);

  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.src = proxiedAudioUrl(audioUrl);
  audio.loop = true;
  await new Promise<void>((resolve, reject) => {
    audio.oncanplay = () => resolve();
    audio.onerror = () => reject(new Error("Could not load this song"));
    audio.load();
  });

  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
  const ctx = new AudioCtx();
  const src = ctx.createMediaElementSource(audio);
  const dest = ctx.createMediaStreamDestination();
  src.connect(dest);
  await ctx.resume();

  for (const track of dest.stream.getAudioTracks()) stream.addTrack(track);

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
  });

  recorder.start(200);
  await audio.play();

  const started = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      paintCtx.drawImage(source, 0, 0);
      const elapsed = performance.now() - started;
      onProgress?.(Math.min(99, Math.round((elapsed / durationMs) * 100)));
      if (elapsed >= durationMs) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  audio.pause();
  const blob = await done;
  stream.getTracks().forEach((t) => t.stop());
  void ctx.close();
  onProgress?.(100);

  return { blob, ext: blob.type.includes("mp4") ? "mp4" : "webm" };
}
