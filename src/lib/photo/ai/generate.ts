import { generateImageServer } from "./generate.functions";

/** Text-to-image using a real AI model (FLUX.1-schnell) on our own server. */
export async function generateImage(prompt: string): Promise<string> {
  const { dataUrl } = await generateImageServer({ data: { prompt } });
  return dataUrl;
}


/** Image-to-image style rendering through Pollinations, using the source photo
 *  as a reference image. Throws when offline so callers can fall back locally. */
export async function stylizeWithAi(
  imageDataUrl: string,
  stylePrompt: string,
  size = 1024,
): Promise<string> {
  const hosted = await uploadTemp(imageDataUrl);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    stylePrompt,
  )}?width=${size}&height=${size}&nologo=true&model=flux&image=${encodeURIComponent(hosted)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("stylize failed");
  const blob = await res.blob();
  if (!blob.type.startsWith("image/")) throw new Error("stylize failed");
  return await blobToDataUrl(blob);
}

/** Free anonymous image host (tmpfiles.org) used to give the model a URL. */
async function uploadTemp(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const fd = new FormData();
  fd.append("file", blob, "photo.png");
  const res = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  const json = (await res.json()) as { data?: { url?: string } };
  const link = json.data?.url;
  if (!link) throw new Error("upload failed");
  return link.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}
