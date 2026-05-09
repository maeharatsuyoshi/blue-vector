import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type SiteImageSlot = {
  key: string;
  label: string;
  section: "home" | "team" | "news" | "about" | "services" | "contact";
  defaultUrl: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  { key: "home_hero_1", label: "Home carousel · 1", section: "home", defaultUrl: "/hero-1.jpg" },
  { key: "home_hero_2", label: "Home carousel · 2", section: "home", defaultUrl: "/hero-2.jpg" },
  { key: "home_hero_3", label: "Home carousel · 3", section: "home", defaultUrl: "/hero-3.jpg" },
  { key: "home_hero_4", label: "Home carousel · 4", section: "home", defaultUrl: "/hero-4.jpg" },
  { key: "team_hero_1", label: "Team carousel · 1", section: "team", defaultUrl: "/team-photo.jpg" },
  { key: "team_hero_2", label: "Team carousel · 2", section: "team", defaultUrl: "/team-photo-2.jpg" },
  { key: "team_hero_3", label: "Team carousel · 3", section: "team", defaultUrl: "/team-photo-3.jpg" },
  { key: "news_hero_1", label: "News carousel · 1", section: "news", defaultUrl: "/news-bg.jpg" },
  { key: "news_hero_2", label: "News carousel · 2", section: "news", defaultUrl: "/news-bg-2.jpg" },
  { key: "about_bg", label: "About hero", section: "about", defaultUrl: "/about-bg.jpg" },
  { key: "services_bg", label: "Services hero", section: "services", defaultUrl: "/services-bg.jpg" },
  { key: "contact_bg", label: "Contact hero", section: "contact", defaultUrl: "/contact-bg.jpg" },
];

export const BOTTOM_FADE_LEVELS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type BottomFadeLevel = (typeof BOTTOM_FADE_LEVELS)[number];
export const DEFAULT_BOTTOM_FADE_LEVEL: BottomFadeLevel = 100;

export const TOP_FADE_LEVELS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;
export type TopFadeLevel = (typeof TOP_FADE_LEVELS)[number];
export const DEFAULT_TOP_FADE_LEVEL: TopFadeLevel = 0;

const VALID_LEVELS = new Set<number>(BOTTOM_FADE_LEVELS);

export function normalizeBottomFadeLevel(raw: unknown): BottomFadeLevel {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return DEFAULT_BOTTOM_FADE_LEVEL;
  const rounded = Math.round(n / 10) * 10;
  return (VALID_LEVELS.has(rounded) ? rounded : DEFAULT_BOTTOM_FADE_LEVEL) as BottomFadeLevel;
}

export function normalizeTopFadeLevel(raw: unknown): TopFadeLevel {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n)) return DEFAULT_TOP_FADE_LEVEL;
  const rounded = Math.round(n / 10) * 10;
  return (VALID_LEVELS.has(rounded) ? rounded : DEFAULT_TOP_FADE_LEVEL) as TopFadeLevel;
}

export function bottomFadeStyle(level: BottomFadeLevel): string {
  if (level <= 0) return "";
  if (level >= 100) {
    return "linear-gradient(to bottom, transparent 50%, var(--surface) 100%)";
  }
  return `linear-gradient(to bottom, transparent 50%, color-mix(in oklab, var(--surface) ${level}%, transparent) 100%)`;
}

export function topFadeStyle(level: TopFadeLevel): string {
  if (level <= 0) return "";
  if (level >= 100) {
    return "linear-gradient(to bottom, var(--surface) 0%, transparent 50%)";
  }
  return `linear-gradient(to bottom, color-mix(in oklab, var(--surface) ${level}%, transparent) 0%, transparent 50%)`;
}

export type SlotImage = {
  url: string;
  bottomFadeLevel: BottomFadeLevel;
  bottomFadeStyle: string;
  topFadeLevel: TopFadeLevel;
  topFadeStyle: string;
};

const DEFAULTS = Object.fromEntries(
  SITE_IMAGE_SLOTS.map((s) => [s.key, s.defaultUrl])
) as Record<string, string>;

export async function getSiteImages(): Promise<Record<string, SlotImage>> {
  const { data, error } = await supabaseAdmin
    .from("site_images")
    .select("slot, url, bottom_fade, top_fade");
  if (error) throw error;
  const rows = (data ?? []) as {
    slot: string;
    url: string;
    bottom_fade: string;
    top_fade: string;
  }[];

  const map: Record<string, SlotImage> = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.key] = {
      url: slot.defaultUrl,
      bottomFadeLevel: DEFAULT_BOTTOM_FADE_LEVEL,
      bottomFadeStyle: bottomFadeStyle(DEFAULT_BOTTOM_FADE_LEVEL),
      topFadeLevel: DEFAULT_TOP_FADE_LEVEL,
      topFadeStyle: topFadeStyle(DEFAULT_TOP_FADE_LEVEL),
    };
  }
  for (const r of rows) {
    const target = map[r.slot];
    if (!target) continue;
    const bLevel =
      r.bottom_fade === "" || r.bottom_fade === undefined
        ? DEFAULT_BOTTOM_FADE_LEVEL
        : normalizeBottomFadeLevel(r.bottom_fade);
    const tLevel =
      r.top_fade === "" || r.top_fade === undefined
        ? DEFAULT_TOP_FADE_LEVEL
        : normalizeTopFadeLevel(r.top_fade);
    target.url = r.url && r.url.length > 0 ? r.url : target.url;
    target.bottomFadeLevel = bLevel;
    target.bottomFadeStyle = bottomFadeStyle(bLevel);
    target.topFadeLevel = tLevel;
    target.topFadeStyle = topFadeStyle(tLevel);
  }
  return map;
}

export async function setSiteImage(
  slot: string,
  url: string | null,
  bottomFadeLevel: BottomFadeLevel | null,
  topFadeLevel: TopFadeLevel | null
): Promise<void> {
  const cleanUrl = (url ?? "").trim();
  const isDefaultBottom =
    bottomFadeLevel === null || bottomFadeLevel === DEFAULT_BOTTOM_FADE_LEVEL;
  const isDefaultTop =
    topFadeLevel === null || topFadeLevel === DEFAULT_TOP_FADE_LEVEL;
  const bottomStr = isDefaultBottom ? "" : String(bottomFadeLevel);
  const topStr = isDefaultTop ? "" : String(topFadeLevel);

  if (cleanUrl.length === 0 && bottomStr === "" && topStr === "") {
    const { error } = await supabaseAdmin
      .from("site_images")
      .delete()
      .eq("slot", slot);
    if (error) throw error;
    return;
  }

  const { error } = await supabaseAdmin.from("site_images").upsert(
    {
      slot,
      url: cleanUrl,
      bottom_fade: bottomStr,
      top_fade: topStr,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slot" }
  );
  if (error) throw error;
}

export function getDefaults(): Record<string, string> {
  return { ...DEFAULTS };
}
