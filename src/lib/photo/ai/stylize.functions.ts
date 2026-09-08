import { createServerFn } from "@tanstack/react-start";

/** Image-to-image style transfer: sends the source photo plus a style prompt. */
export const stylizeImageServer = createServerFn({ method: "POST" })
  .inputValidator((input: { imageDataUrl: string; prompt: string }) => {
    const imageDataUrl = input?.imageDataUrl ?? "";
    const prompt = (input?.prompt ?? "").trim();
    if (!imageDataUrl.startsWith("data:image/")) throw new Error("Invalid image");
    if (prompt.length < 3) throw new Error("Style prompt is too short");
    return { imageDataUrl, prompt: prompt.slice(0, 500) };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Style transfer is not configured yet");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Repaint this exact photo ${data.prompt}. Keep the same subject, pose and composition.`,
              },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      console.error(`Style transfer failed: ${res.status} ${detail}`);
      throw new Error(`Style transfer failed (${res.status})`);
    }

    const json = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
    const first = json.data?.[0];
    if (first?.b64_json) return { dataUrl: `data:image/png;base64,${first.b64_json}` };
    if (first?.url) return { dataUrl: first.url };
    throw new Error("Style transfer returned no image");
  });
