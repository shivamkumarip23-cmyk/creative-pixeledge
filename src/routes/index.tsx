import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AiStudio } from "@/components/photo/AiStudio";
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
          "Edit photos with Lightroom-style sliders, 60+ filters, AI background removal, text, stickers and high-resolution JPG, PNG or WebP export.",
      },
      { property: "og:title", content: "PhotoPro Editor — Pro photo editing in your browser" },
      {
        property: "og:description",
        content:
          "Pro adjustments, 60+ filters, AI tools and HD export — all running locally in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("photo.jpg");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [nav, setNav] = useState<NavKey>("home");
  const [focusTab, setFocusTab] = useState<string | null>(null);
  const [welcome, setWelcome] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingTab = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const openPicker = (tab?: string) => {
    if (tab === "AI") {
      setNav("ai");
      return;
    }
    pendingTab.current = tab ?? "Filters";
    inputRef.current?.click();
  };

  const pick = async (file: File) => {
    try {
      const img = await loadImageFromFile(file);
      setFileName(file.name);
      setImage(img);
      setFocusTab(pendingTab.current ?? "Filters");
      setNav(pendingTab.current === "AI" ? "ai" : "edit");
    } catch {
      toast.error("That file couldn't be opened as a photo");
    }
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const selectNav = (key: NavKey) => {
    if (key === "library") {
      openPicker();
      return;
    }
    if (key === "edit" && !image) {
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
  } else if (nav === "home" || !image) {
    screen = (
      <div className="no-scrollbar h-full overflow-y-auto pb-28">
        <HomeScreen onOpenPicker={openPicker} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    );
  } else {
    screen = (
      <Editor
        image={image}
        fileName={fileName}
        onBack={() => {
          setImage(null);
          setNav("home");
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        focusTab={focusTab}
        bottomInset
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
