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

    const res = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify({
          inputs: data.prompt,
          parameters: { num_inference_steps: 4 },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Generation failed (${res.status}) ${detail.slice(0, 200)}`);
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    for (let i = 0; i < buf.length; i += 0x8000) {
      binary += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    }
    const base64 = btoa(binary);
    const type = res.headers.get("content-type") ?? "image/png";
    return { dataUrl: `data:${type.split(";")[0]};base64,${base64}` };
  });
