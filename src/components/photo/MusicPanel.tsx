import { useEffect, useMemo, useRef, useState } from "react";
import { Film, Loader2, Music4, Pause, Play, Plus, Search, Upload } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { searchMusic, type Track } from "@/lib/music/itunes.functions";
import { FALLBACK_MUSIC, proxiedAudioUrl } from "@/lib/photo/music/video";
import { cn } from "@/lib/utils";

const TABS: { id: string; term: string }[] = [
  { id: "All", term: "top hits 2026" },
  { id: "Hindi", term: "Bollywood hits Arijit, Pritam" },
  { id: "Punjabi", term: "Punjabi hits Sidhu Moose Wala, Diljit" },
  { id: "English", term: "Top 100 English Taylor Swift" },
  { id: "Korean", term: "Kpop BTS Blackpink" },
  { id: "Trending", term: "trending viral songs" },
];

export function MusicPanel({
  onAdd,
  onCreateVideo,
  videoProgress,
}: {
  onAdd: (label: string) => void;
  onCreateVideo: (audioUrl: string, label: string) => void;
  videoProgress: number | null;
}) {
  const search = useServerFn(searchMusic);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<{ url: string; label: string } | null>(null);

  const term = useMemo(
    () => (query.trim() ? query.trim() : (TABS.find((t) => t.id === tab)?.term ?? "top hits")),
    [query, tab],
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      search({ data: { term, limit: 30 } })
        .then((res) => {
          if (!alive) return;
          setTracks(res.tracks);
          if (res.error) toast.error("Couldn't load songs right now");
        })
        .catch(() => alive && toast.error("Couldn't load songs right now"))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [term, search]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const playSrc = (src: string, id: string) => {
    audioRef.current?.pause();
    const audio = new Audio(src);
    audio.crossOrigin = "anonymous";
    audio.volume = 0.9;
    audio.onended = () => setPlaying(null);
    audio.onerror = () => {
      if (src !== FALLBACK_MUSIC) playSrc(FALLBACK_MUSIC, id);
      else toast.error("Preview couldn't play");
    };
    audio.play().then(() => setPlaying(id)).catch(() => {
      if (src !== FALLBACK_MUSIC) playSrc(FALLBACK_MUSIC, id);
      else toast.error("Preview couldn't play");
    });
    audioRef.current = audio;
  };

  const toggle = (id: string, url: string | null) => {
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (!url) {
      toast.info("No preview available for this song");
      playSrc(FALLBACK_MUSIC, id);
      return;
    }
    playSrc(proxiedAudioUrl(url), id);
  };

  const uploadSong = (file: File) => {
    audioRef.current?.pause();
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      playSrc(FALLBACK_MUSIC, "upload");
    };
    void audio.play().catch(() => playSrc(FALLBACK_MUSIC, "upload"));
    audioRef.current = audio;
    setPlaying("upload");
    const label = file.name.replace(/\.[^.]+$/, "");
    setUploaded({ url, label });
    onAdd(label);
    toast.success("Song from your phone added — tap Make video to export it");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song, artist or language…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="gradient-pill flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold"
        >
          <Upload className="size-4" />
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) uploadSong(f);
          }}
        />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setQuery("");
              setTab(t.id);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id && !query
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary hover:bg-muted",
            )}
          >
            {t.id}
          </button>
        ))}
      </div>

      {uploaded && (
        <div className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-2 text-xs">
          <Music4 className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate font-medium">{uploaded.label}</span>
          <button
            type="button"
            disabled={videoProgress !== null}
            onClick={() => onCreateVideo(uploaded.url, uploaded.label)}
            className="gradient-pill flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold disabled:opacity-40"
          >
            <Film className="size-3" /> Make video
          </button>
        </div>
      )}

      {videoProgress !== null && (
        <div className="rounded-2xl border border-border bg-secondary p-3">
          <p className="mb-2 text-xs font-medium">Making your 15s video… {videoProgress}%</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-pill transition-all" style={{ width: `${videoProgress}%` }} />
          </div>
        </div>
      )}

      <div className="no-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Finding songs…
          </div>
        )}
        {!loading &&
          tracks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-secondary/60 p-2 backdrop-blur-xl"
            >
              <button
                type="button"
                onClick={() => toggle(t.id, t.preview)}
                className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted"
                aria-label={`Play ${t.title}`}
              >
                {t.artwork ? (
                  <img src={t.artwork} alt={`${t.title} album art`} className="size-full object-cover" loading="lazy" />
                ) : (
                  <Music4 className="m-auto size-5 text-muted-foreground" />
                )}
                <span className="absolute inset-0 grid place-items-center bg-black/45 text-white">
                  {playing === t.id ? <Pause className="size-4" /> : <Play className="size-4" />}
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onAdd(`${t.title} · ${t.artist}`)}
                  className="flex items-center justify-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold"
                >
                  <Plus className="size-3" /> Label
                </button>
                <button
                  type="button"
                  disabled={!t.preview || videoProgress !== null}
                  onClick={() => t.preview && onCreateVideo(t.preview, `${t.title} · ${t.artist}`)}
                  className="gradient-pill flex items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold disabled:opacity-40"
                >
                  <Film className="size-3" /> Video
                </button>
              </div>
            </div>
          ))}
        {!loading && !tracks.length && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No songs found. Try another search.
          </p>
        )}
      </div>
    </div>
  );
}
