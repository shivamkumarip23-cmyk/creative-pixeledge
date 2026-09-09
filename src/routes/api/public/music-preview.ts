import { createFileRoute } from "@tanstack/react-router";

const ALLOWED = /(^|\.)(apple\.com|mzstatic\.com)$/i;

export const Route = createFileRoute("/api/public/music-preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL(request.url).searchParams.get("url");
        if (!target) return new Response("Missing url", { status: 400 });
        let parsed: URL;
        try {
          parsed = new URL(target);
        } catch {
          return new Response("Bad url", { status: 400 });
        }
        if (parsed.protocol !== "https:" || !ALLOWED.test(parsed.hostname)) {
          return new Response("Host not allowed", { status: 403 });
        }
        const upstream = await fetch(parsed.toString());
        if (!upstream.ok || !upstream.body) {
          return new Response("Preview unavailable", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "audio/mp4",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
