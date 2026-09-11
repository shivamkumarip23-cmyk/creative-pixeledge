import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AiStudio } from "@/components/photo/AiStudio";
import { CollagePage } from "@/components/photo/CollagePage";
import { Editor } from "@/components/photo/Editor";
import { HomeScreen } from "@/components/photo/HomeScreen";
import { WelcomeScreen } from "@/components/photo/WelcomeScreen";
import { BottomNav, type NavKey } from "@/components/shell/BottomNav";
import { PhoneFrame } from "@/components/shell/PhoneFrame";
import { loadImageFromFile } from "@/lib/photo/render";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhotoPro Editor — Pro photo editing in your browser" },
      {
        name: "description",
        content:
          "Edit photos with Lightroom-style sliders, 60+ filters, AI background removal, collage templates, music videos and HD export.",
      },
      { property: "og:title", content: "PhotoPro Editor — Pro photo editing in your browser" },
      {
        property: "og:description",
        content:
          "Pro adjustments, 60+ filters, 50 collage templates, AI tools and HD export — all in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

export type EditorPhoto = { id: string; name: string; img: HTMLImageElement };
const MAX_PHOTOS = 4;

function Index() {
  const [photos, setPhotos] = useState<EditorPhoto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [nav, setNav] = useState<NavKey>("home");
  const [focusTab, setFocusTab] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingTab = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const active = useMemo(
    () => photos.find((p) => p.id === activeId) ?? photos[0] ?? null,
    [photos, activeId],
  );

  const openPicker = (tab?: string) => {
    if (tab === "AI") {
      setNav("ai");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      toast.info("You can keep up to 4 photos in the timeline");
      return;
    }
    pendingTab.current = tab ?? "Filters";
    inputRef.current?.click();
  };

  const pick = async (file: File) => {
    try {
      const img = await loadImageFromFile(file);
      const photo: EditorPhoto = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        img,
      };
      setPhotos((p) => [...p, photo].slice(0, MAX_PHOTOS));
      setActiveId(photo.id);
      setFocusTab(pendingTab.current ?? "Filters");
      setNav(pendingTab.current === "AI" ? "ai" : "edit");
    } catch {
      toast.error("That file couldn't be opened as a photo");
    }
  };

  const adoptCanvas = (canvas: HTMLCanvasElement, name: string) => {
    const img = new Image();
    img.onload = () => {
      const photo: EditorPhoto = {
        id: `${Date.now()}-collage`,
        name,
        img,
      };
      setPhotos((p) => [...p.slice(0, MAX_PHOTOS - 1), photo]);
      setActiveId(photo.id);
      setNav("edit");
      setFocusTab("Filters");
    };
    img.src = canvas.toDataURL("image/jpeg", 0.94);
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const selectNav = (key: NavKey) => {
    if (key === "library") {
      openPicker();
      return;
    }
    if (key === "edit" && !active) {
      toast.info("Choose a photo first");
      openPicker("Filters");
      return;
    }
    setNav(key);
    if (key === "edit") setFocusTab("Filters");
  };

  let screen: React.ReactNode;
  if (nav === "ai") {
    screen = (
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        <AiStudio />
      </div>
    );
  } else if (nav === "collage") {
    screen = (
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        <CollagePage photos={photos} onApply={adoptCanvas} />
      </div>
    );
  } else if (nav === "home" || !active) {
    screen = (
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        <HomeScreen onOpenPicker={openPicker} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    );
  } else {
    screen = (
      <Editor
        image={active.img}
        fileName={active.name}
        onBack={() => setNav("home")}
        theme={theme}
        onToggleTheme={toggleTheme}
        focusTab={focusTab}
        bottomInset
        photos={photos}
        activeId={active.id}
        maxPhotos={MAX_PHOTOS}
        onSelectPhoto={setActiveId}
        onAddPhoto={() => openPicker("Filters")}
        onRemovePhoto={(id) =>
          setPhotos((p) => {
            const next = p.filter((x) => x.id !== id);
            if (id === activeId) setActiveId(next[0]?.id ?? null);
            return next;
          })
        }
        onReorderPhotos={(from, to) =>
          setPhotos((p) => {
            const next = [...p];
            const [moved] = next.splice(from, 1);
            if (moved) next.splice(to, 0, moved);
            return next;
          })
        }
      />
    );
  }

  return (
    <PhoneFrame>
      <div className="relative h-full w-full overflow-hidden bg-background">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void pick(file);
          }}
        />
        {welcome ? (
          <WelcomeScreen onStart={() => setWelcome(false)} />
        ) : (
          <>
            {screen}
            <BottomNav active={nav} onSelect={selectNav} onAdd={() => openPicker()} />
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
