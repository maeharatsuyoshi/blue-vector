import "server-only";
import { supabaseAdmin } from "./supabase-server";
import { content } from "./content";

export type PrivacyContent = {
  title_en: string;
  title_jp: string;
  body_en: string;
  body_jp: string;
  agree_en: string;
  agree_jp: string;
  cancel_en: string;
  cancel_jp: string;
};

export const PRIVACY_DEFAULTS: PrivacyContent = {
  title_en: content.en.contact.privacyTitle,
  title_jp: content.jp.contact.privacyTitle,
  body_en: content.en.contact.privacyBody,
  body_jp: content.jp.contact.privacyBody,
  agree_en: content.en.contact.privacyAgree,
  agree_jp: content.jp.contact.privacyAgree,
  cancel_en: content.en.contact.privacyCancel,
  cancel_jp: content.jp.contact.privacyCancel,
};

const COLUMNS =
  "title_en, title_jp, body_en, body_jp, agree_en, agree_jp, cancel_en, cancel_jp";

function pick(value: string | null | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? (value as string) : fallback;
}

export async function getPrivacyContent(): Promise<PrivacyContent> {
  const { data, error } = await supabaseAdmin
    .from("privacy_policy")
    .select(COLUMNS)
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  const r = data as Partial<PrivacyContent> | null;
  if (!r) return { ...PRIVACY_DEFAULTS };
  return {
    title_en: pick(r.title_en, PRIVACY_DEFAULTS.title_en),
    title_jp: pick(r.title_jp, PRIVACY_DEFAULTS.title_jp),
    body_en: pick(r.body_en, PRIVACY_DEFAULTS.body_en),
    body_jp: pick(r.body_jp, PRIVACY_DEFAULTS.body_jp),
    agree_en: pick(r.agree_en, PRIVACY_DEFAULTS.agree_en),
    agree_jp: pick(r.agree_jp, PRIVACY_DEFAULTS.agree_jp),
    cancel_en: pick(r.cancel_en, PRIVACY_DEFAULTS.cancel_en),
    cancel_jp: pick(r.cancel_jp, PRIVACY_DEFAULTS.cancel_jp),
  };
}

export async function getRawPrivacyContent(): Promise<PrivacyContent> {
  const { data, error } = await supabaseAdmin
    .from("privacy_policy")
    .select(COLUMNS)
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  const r = data as Partial<PrivacyContent> | null;
  if (!r) {
    return {
      title_en: "", title_jp: "",
      body_en: "", body_jp: "",
      agree_en: "", agree_jp: "",
      cancel_en: "", cancel_jp: "",
    };
  }
  return {
    title_en: r.title_en ?? "",
    title_jp: r.title_jp ?? "",
    body_en: r.body_en ?? "",
    body_jp: r.body_jp ?? "",
    agree_en: r.agree_en ?? "",
    agree_jp: r.agree_jp ?? "",
    cancel_en: r.cancel_en ?? "",
    cancel_jp: r.cancel_jp ?? "",
  };
}

export async function setPrivacyContent(input: PrivacyContent): Promise<void> {
  const { error } = await supabaseAdmin.from("privacy_policy").upsert(
    {
      id: 1,
      ...input,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}
