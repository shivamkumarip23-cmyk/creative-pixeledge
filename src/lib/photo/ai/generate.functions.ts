import { createServerFn } from "@tanstack/react-start";

/** Text-to-image through Hugging Face FLUX.1-schnell. Returns a PNG data URL. */
export const generateImageServer = createServerFn({ method: "POST" })
  .inputValidator((input: { prompt: string }) => {
    const prompt = (input?.prompt ?? "").trim();
    if (prompt.length < 3) throw new Error("Prompt is too short");
    return { prompt: prompt.slice(0, 500) };
  })
  .handler(async ({ data }) => {
    const token = process.env["HF_TOKEN"];
    if (!token) throw new Error("Image generation is not configured yet");

    // Auto-routed to whichever provider currently serves the model.
    const res = await fetch("https://router.huggingface.co/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: data.prompt,
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Generation failed (${res.status}) ${detail.slice(0, 200)}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await res.json()) as {
        data?: { b64_json?: string; url?: string }[];
      };
      const first = json.data?.[0];
      if (first?.b64_json) return { dataUrl: `data:image/png;base64,${first.b64_json}` };
      if (first?.url) {
        const img = await fetch(first.url);
        return { dataUrl: `data:image/png;base64,${toBase64(new Uint8Array(await img.arrayBuffer()))}` };
      }
      throw new Error("Generation returned no image");
    }

    const base64 = toBase64(new Uint8Array(await res.arrayBuffer()));
    return { dataUrl: `data:${contentType.split(";")[0] || "image/png"};base64,${base64}` };
  });

function toBase64(buf: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buf.length; i += 0x8000) {
    binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

