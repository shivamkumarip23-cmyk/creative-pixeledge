import { generateImageServer } from "./generate.functions";
import { stylizeImageServer } from "./stylize.functions";

/** Text-to-image using a real AI model (FLUX.1-schnell) on our own server. */
export async function generateImage(prompt: string): Promise<string> {
  const { dataUrl } = await generateImageServer({ data: { prompt } });
  return dataUrl;
}

/** Image-to-image style transfer: the source photo is sent to the AI model.
 *  Throws on failure so callers can fall back to the offline art engine. */
export async function stylizeWithAi(imageDataUrl: string, stylePrompt: string): Promise<string> {
  const source = imageDataUrl.startsWith("data:")
    ? imageDataUrl
    : await toDataUrl(imageDataUrl);
  const { dataUrl } = await stylizeImageServer({ data: { imageDataUrl: source, prompt: stylePrompt } });
  return dataUrl;
}

async function toDataUrl(src: string): Promise<string> {
  const blob = await (await fetch(src)).blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(blob);
  });
}

