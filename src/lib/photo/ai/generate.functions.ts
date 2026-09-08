import { createServerFn } from "@tanstack/react-start";

/** Provider routes tried in order (OpenAI-compatible images API). */
const ROUTES = [
  { url: "https://router.huggingface.co/nscale/v1/images/generations", model: "black-forest-labs/FLUX.1-schnell" },
  { url: "https://router.huggingface.co/v1/images/generations", model: "black-forest-labs/FLUX.1-schnell" },
];


/** Text-to-image through Hugging Face. Returns a PNG data URL. */
export const generateImageServer = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (prompt.length < 3) throw new Error("Prompt is too short");
    return { prompt: prompt.slice(0, 500) };
  })
  .handler(async ({ data }) => {
    const token = process.env["HF_TOKEN"];
    if (!token) throw new Error("Image generation is not configured yet");

    let lastError = "";
    for (const route of ROUTES) {
      const res = await fetch(route.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: route.model, prompt: data.prompt, response_format: "b64_json" }),
      });

      if (!res.ok) {
        lastError = `${res.status} ${(await res.text().catch(() => "")).slice(0, 160)}`;
        console.error(`HF image generation failed for ${route.url}: ${lastError}`);
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
        const first = json.data?.[0];
        if (first?.b64_json) return { dataUrl: `data:image/png;base64,${first.b64_json}` };
        if (first?.url) {
          const img = await fetch(first.url);
          const type = img.headers.get("content-type")?.split(";")[0] || "image/png";
          return { dataUrl: `data:${type};base64,${toBase64(new Uint8Array(await img.arrayBuffer()))}` };
        }
        lastError = "no image in response";
        continue;
      }

      const base64 = toBase64(new Uint8Array(await res.arrayBuffer()));
      return { dataUrl: `data:${contentType.split(";")[0] || "image/png"};base64,${base64}` };
    }

    throw new Error(`Generation failed (${lastError})`);
  });

function toBase64(buf: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buf.length; i += 0x8000) {
    binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
