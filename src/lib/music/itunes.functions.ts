import { createServerFn } from "@tanstack/react-start";

export type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  preview: string | null;
  album: string;
};

export const searchMusic = createServerFn({ method: "GET" })
  .inputValidator((data: { term: string; limit?: number }) => ({
    term: String(data.term ?? "").slice(0, 200),
    limit: Math.min(Math.max(data.limit ?? 30, 1), 50),
  }))
  .handler(async ({ data }) => {
    const url =
      "https://itunes.apple.com/search?media=music&entity=song" +
      `&limit=${data.limit}&term=${encodeURIComponent(data.term)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return { tracks: [] as Track[], error: `Search failed (${res.status})` };
    const json = (await res.json()) as {
      results?: {
        trackId?: number;
        trackName?: string;
        artistName?: string;
        collectionName?: string;
        artworkUrl100?: string;
        previewUrl?: string;
      }[];
    };
    const tracks: Track[] = (json.results ?? [])
      .filter((r) => r.trackName && r.artistName)
      .map((r, i) => ({
        id: String(r.trackId ?? `${r.trackName}-${i}`),
        title: r.trackName!,
        artist: r.artistName!,
        album: r.collectionName ?? "",
        artwork: (r.artworkUrl100 ?? "").replace("100x100bb", "300x300bb"),
        preview: r.previewUrl ?? null,
      }));
    return { tracks, error: null as string | null };
  });
