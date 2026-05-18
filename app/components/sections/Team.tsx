"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { type Lang } from "@/app/lib/content";

const TEAM_HERO_POSITIONS = [
  "object-[center_50%]",
  "object-[center_75%]",
  "object-[center_50%]",
];
const TEAM_ROTATION_MS = 6000;

export type TeamMemberView = {
  id: number;
  category: string;
  name_en: string;
  name_jp: string;
  role_en: string;
  role_jp: string;
  bio_en: string;
  bio_jp: string;
  photo: string | null;
};

export type TeamCategoryView = {
  slug: string;
  name_en: string;
  name_jp: string;
  description_en: string;
  description_jp: string;
};

function pick(m: TeamMemberView, field: "name" | "role" | "bio", lang: Lang) {
  return lang === "jp"
    ? (m[`${field}_jp` as const] as string)
    : (m[`${field}_en` as const] as string);
}

function Avatar({
  name,
  photo,
}: {
  name: string;
  photo?: string | null;
}) {
  return (
    <div className="aspect-[4/5] bg-[var(--surface-raised)] relative overflow-hidden flex items-center justify-center border border-[var(--rule)]">
      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(min-width: 768px) 20vw, 40vw"
          className="object-cover object-top grayscale"
        />
      ) : (
        <>
          <div className="absolute inset-0 bv-diag opacity-60" aria-hidden />
          <div className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[var(--ink-muted)]">
            No image
          </div>
        </>
      )}
    </div>
  );
}

export type HeroImage = { url: string; bottomFadeStyle: string; topFadeStyle: string };

export default function Team({
  members,
  categories,
  heroImages,
}: {
  members: TeamMemberView[];
  categories: TeamCategoryView[];
  heroImages: HeroImage[];
}) {
  const { t, lang } = useLanguage();
  const team = t.team;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % heroImages.length);
    }, TEAM_ROTATION_MS);
    return () => window.clearInterval(id);
  }, [heroImages.length]);

  return (
    <section className="relative min-h-screen pb-24 md:pb-32 lg:pb-40 bg-[var(--surface)] text-[var(--ink)] overflow-hidden">
      <div className="relative w-full h-[50vh] mb-16 md:mb-20 lg:mb-24 overflow-hidden">
        {heroImages.map((img, i) => {
          const prev = (active - 1 + heroImages.length) % heroImages.length;
          const isActive = i === active;
          const isPrev = i === prev;
          const transform = isActive
            ? "translate-x-0"
            : isPrev
              ? "-translate-x-full"
              : "translate-x-full";
          const opacity = isActive || isPrev ? "opacity-100" : "opacity-0";
          const motion =
            isActive || isPrev
              ? "transition-transform duration-[1100ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
              : "transition-none";
          const position = TEAM_HERO_POSITIONS[i] ?? "object-[center_50%]";
          const fadeOpacity = isActive ? "opacity-100" : "opacity-0";
          return (
            <div key={`${img.url}-${i}`} className="contents">
              <Image
                src={img.url}
                alt=""
                fill
                sizes="100vw"
                quality={92}
                className={`absolute inset-0 object-cover ${position} brightness-110 pointer-events-none select-none ${motion} ${transform} ${opacity}`}
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
                {lang === "jp" ? "メンバー" : "Team"}
              </h1>
              <p className="text-[12px] md:text-[13px] tracking-[0.14em] uppercase text-white/75 max-w-md">
                {lang === "jp"
                  ? "現場経験に基づく、防衛への実装力"
                  : "Frontline experience translated into defence implementation."}
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
                      {lang === "jp" ? "メンバー" : "Leadership"}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-[22px] md:text-[28px] lg:text-[32px] leading-[1.2] font-bold text-[var(--ink)] tracking-tight">
                    {team.heading}
                  </h2>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-[14px] md:text-[15px] leading-[1.8] text-[var(--ink-soft)]">
                    {team.lede}
                  </p>
                </div>
              </div>
              {members.length === 0 ? (
                <div className="mt-12 border-t border-[var(--rule)] pt-10 text-sm text-[var(--ink-soft)]">
                  No team members yet.
                </div>
              ) : (
                <div className="space-y-16 md:space-y-20">
                  {categories.map((c) => {
                    const group = members.filter((m) => m.category === c.slug);
                    if (group.length === 0) return null;
                    const isFounder = c.slug === "founder";
                    const heading = lang === "jp" ? c.name_jp : c.name_en;
                    const description =
                      lang === "jp" ? c.description_jp : c.description_en;
                    return (
                      <div key={c.slug}>
                        {!isFounder && (
                          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start mt-12 md:mt-14">
                            <div className="lg:col-span-5">
                              <h2 className="font-display text-[22px] md:text-[28px] lg:text-[32px] leading-[1.2] font-bold text-[var(--ink)] tracking-tight">
                                {heading}
                              </h2>
                            </div>
                            {description && (
                              <div className="lg:col-span-7">
                                <p className="text-[14px] md:text-[15px] leading-[1.8] text-[var(--ink-soft)] whitespace-pre-line">
                                  {description}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`mt-12 md:mt-14 border-t border-[var(--rule)] pt-8 md:pt-10 grid gap-8 md:gap-10 ${
                            group.length === 1 ? "grid-cols-1" : "md:grid-cols-2"
                          }`}
                        >
                          {group.map((m) => {
                            const name = pick(m, "name", lang);
                            const solo = group.length === 1;
                            return (
                              <article
                                key={m.id}
                                className="flex flex-col sm:flex-row gap-5 sm:gap-7"
                              >
                                {m.photo && (
                                  <div
                                    className={
                                      solo
                                        ? "w-40 sm:w-52 lg:w-64 shrink-0"
                                        : "w-32 sm:w-36 lg:w-40 shrink-0"
                                    }
                                  >
                                    <Avatar name={name} photo={m.photo} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={
                                      solo
                                        ? "font-display text-[18px] md:text-[22px] font-bold text-[var(--ink)] leading-tight"
                                        : "font-display text-[16px] md:text-[18px] font-bold text-[var(--ink)] leading-tight"
                                    }
                                  >
                                    {name}
                                  </h4>
                                  <div className="mt-1.5 text-[9px] tracking-[0.22em] uppercase text-[var(--ink-soft)] font-semibold">
                                    {pick(m, "role", lang)}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-[var(--rule)]">
                                    <p
                                      className={
                                        solo
                                          ? "text-[13px] md:text-[14px] leading-[1.8] text-[var(--ink-soft)] whitespace-pre-line"
                                          : "text-[12px] leading-[1.7] text-[var(--ink-soft)] whitespace-pre-line"
                                      }
                                    >
                                      {pick(m, "bio", lang)}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {(() => {
                    const knownSlugs = new Set(categories.map((c) => c.slug));
                    const orphans = members.filter(
                      (m) => !knownSlugs.has(m.category)
                    );
                    if (orphans.length === 0) return null;
                    const orphansSolo = orphans.length === 1;
                    return (
                      <div>
                        <div
                          className={`grid gap-8 md:gap-10 ${
                            orphansSolo ? "grid-cols-1" : "md:grid-cols-2"
                          }`}
                        >
                          {orphans.map((m) => {
                            const name = pick(m, "name", lang);
                            return (
                              <article
                                key={m.id}
                                className="flex flex-col sm:flex-row gap-5 sm:gap-7"
                              >
                                {m.photo && (
                                  <div
                                    className={
                                      orphansSolo
                                        ? "w-40 sm:w-52 lg:w-64 shrink-0"
                                        : "w-32 sm:w-36 lg:w-40 shrink-0"
                                    }
                                  >
                                    <Avatar name={name} photo={m.photo} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={
                                      orphansSolo
                                        ? "font-display text-[18px] md:text-[22px] font-bold text-[var(--ink)] leading-tight"
                                        : "font-display text-[16px] md:text-[18px] font-bold text-[var(--ink)] leading-tight"
                                    }
                                  >
                                    {name}
                                  </h4>
                                  <div className="mt-1.5 text-[9px] tracking-[0.22em] uppercase text-[var(--ink-soft)] font-semibold">
                                    {pick(m, "role", lang)}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-[var(--rule)]">
                                    <p
                                      className={
                                        orphansSolo
                                          ? "text-[13px] md:text-[14px] leading-[1.8] text-[var(--ink-soft)] whitespace-pre-line"
                                          : "text-[12px] leading-[1.7] text-[var(--ink-soft)] whitespace-pre-line"
                                      }
                                    >
                                      {pick(m, "bio", lang)}
                                    </p>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
