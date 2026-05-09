"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { type Lang } from "@/app/lib/content";

const NEWS_HERO_POSITIONS = [
  "object-[center_30%]",
  "object-[center_50%]",
];
const NEWS_ROTATION_MS = 6000;

export type NewsItemView = {
  id: number;
  date: string;
  category_en: string;
  category_jp: string;
  title_en: string;
  title_jp: string;
  excerpt_en: string;
  excerpt_jp: string;
  body_en: string;
  body_jp: string;
  image: string | null;
};

function pick(item: NewsItemView, field: "category" | "title" | "excerpt" | "body", lang: Lang) {
  return lang === "jp"
    ? (item[`${field}_jp` as const] as string)
    : (item[`${field}_en` as const] as string);
}

function formatDate(raw: string, lang: Lang) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  if (lang === "jp") {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type HeroImage = { url: string; bottomFadeStyle: string; topFadeStyle: string };

export default function News({
  items,
  heroImages,
}: {
  items: NewsItemView[];
  heroImages: HeroImage[];
}) {
  const { t, lang } = useLanguage();
  const news = t.news;
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeHero, setActiveHero] = useState(0);

  const expandedItem = useMemo(
    () => items.find((x) => x.id === expanded) ?? null,
    [items, expanded]
  );

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveHero((i) => (i + 1) % heroImages.length);
    }, NEWS_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen pb-24 md:pb-32 lg:pb-40 bg-[var(--surface)] text-[var(--ink)] overflow-hidden">
      <div className="relative w-full h-[50vh] mb-16 md:mb-20 lg:mb-24 overflow-hidden">
        {heroImages.map((img, i) => {
          const prev = (activeHero - 1 + heroImages.length) % heroImages.length;
          const isActive = i === activeHero;
          const isPrev = i === prev;
          const transform = isActive
            ? "translate-x-0"
            : isPrev
              ? "-translate-x-full"
              : "translate-x-full";
          const opacity = isActive || isPrev ? "opacity-85" : "opacity-0";
          const motion =
            isActive || isPrev
              ? "transition-transform duration-[1100ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
              : "transition-none";
          const position = NEWS_HERO_POSITIONS[i] ?? "object-[center_30%]";
          const fadeOpacity = isActive ? "opacity-100" : "opacity-0";
          return (
            <div key={`${img.url}-${i}`} className="contents">
              <Image
                src={img.url}
                alt=""
                fill
                sizes="100vw"
                quality={92}
                className={`absolute inset-0 object-cover ${position} pointer-events-none select-none ${motion} ${transform} ${opacity}`}
                aria-hidden
              />
              {img.topFadeStyle && (
                <div
                  aria-hidden
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-[1100ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${fadeOpacity}`}
                  style={{ background: img.topFadeStyle }}
                />
              )}
              {img.bottomFadeStyle && (
                <div
                  aria-hidden
                  className={`absolute inset-0 pointer-events-none transition-opacity duration-[1100ms] ease-[cubic-bezier(0.77,0,0.175,1)] ${fadeOpacity}`}
                  style={{ background: img.bottomFadeStyle }}
                />
              )}
            </div>
          );
        })}
        <div className="relative z-10 h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-end pb-10 md:pb-14 lg:pb-16">
          <div className="grid w-full grid-cols-12">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <h1 className="font-display text-[44px] leading-[1] md:text-[64px] lg:text-[80px] xl:text-[92px] font-bold tracking-tight text-white mb-3 md:mb-4">
                {lang === "jp" ? "ニュース" : "News"}
              </h1>
              <p className="text-[12px] md:text-[13px] tracking-[0.14em] uppercase text-white/75 max-w-md">
                {lang === "jp"
                  ? "お知らせ、分析、解説"
                  : "Announcements, Analysis, Insights"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bv-glow pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-12">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
                <div className="lg:col-span-5">
                  <div className="flex items-start gap-3">
                    <span className="inline-block w-6 h-px mt-[0.6rem] bg-[var(--rule-strong)]" aria-hidden />
                    <span className="text-[10px] tracking-[0.22em] uppercase font-medium text-[var(--ink-soft)]">
                      {lang === "jp" ? "ニュース" : "Dispatches"}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-[22px] md:text-[28px] lg:text-[32px] leading-[1.2] font-bold text-[var(--ink)] tracking-tight">
                    {news.heading}
                  </h2>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-[14px] md:text-[15px] leading-[1.8] text-[var(--ink-soft)]">
                    {news.lede}
                  </p>
                </div>
              </div>
              {items.length === 0 ? (
                <div className="mt-16 border-t border-[var(--rule)] pt-12 text-sm text-[var(--ink-soft)]">
                  No news yet.
                </div>
              ) : (
                <div className="mt-16 md:mt-20 border-t border-[var(--rule)] pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-transparent">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExpanded(item.id)}
                      className="group text-left bg-[var(--surface)] p-5 md:p-6 flex flex-col h-full border border-[var(--rule)] hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <time className="text-[10px] tracking-[0.18em] uppercase text-[var(--ink-soft)] font-semibold">
                          {formatDate(item.date, lang)}
                        </time>
                        <span className="text-[9px] tracking-[0.18em] uppercase text-[var(--ink-muted)] border border-[var(--rule-strong)] px-2 py-0.5">
                          {pick(item, "category", lang)}
                        </span>
                      </div>
                      <h3 className="font-display text-[13px] md:text-[14px] leading-[1.4] font-bold text-[var(--ink)] mb-2 line-clamp-3">
                        {pick(item, "title", lang)}
                      </h3>
                      <p className="text-[11px] leading-[1.7] text-[var(--ink-soft)] line-clamp-4 flex-1">
                        {pick(item, "excerpt", lang)}
                      </p>
                      <div className="mt-5 text-[10px] tracking-[0.2em] uppercase font-semibold text-[var(--ink-soft)] group-hover:text-[var(--ink)] inline-flex items-center gap-2">
                        {news.readMore} <span aria-hidden>→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {expandedItem && (
        <NewsModal
          item={expandedItem}
          onClose={() => setExpanded(null)}
          lang={lang}
        />
      )}
    </section>
  );
}

function NewsModal({
  item,
  onClose,
  lang,
}: {
  item: NewsItemView;
  onClose: () => void;
  lang: Lang;
}) {
  const { t } = useLanguage();
  const news = t.news;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-[var(--rule)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rule)]">
          <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[var(--ink-soft)]">
            {pick(item, "category", lang)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            {news.close} ×
          </button>
        </div>
        <article className="px-6 py-8 md:px-10 md:py-12">
          <time className="block mb-4 text-[11px] tracking-[0.22em] uppercase font-medium text-[var(--ink-soft)]">
            {formatDate(item.date, lang)}
          </time>
          <h3 className="font-display text-[17px] md:text-[20px] leading-[1.3] font-bold text-[var(--ink)] mb-4">
            {pick(item, "title", lang)}
          </h3>
          {item.image && (
            <div className="relative w-full aspect-[16/9] mb-6 border border-[var(--rule)] overflow-hidden bg-[var(--surface-raised)]">
              <Image
                src={item.image}
                alt={pick(item, "title", lang)}
                fill
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <p className="text-[13px] leading-[1.8] text-[var(--ink-soft)] whitespace-pre-line">
            {pick(item, "body", lang)}
          </p>
        </article>
      </div>
    </div>
  );
}
