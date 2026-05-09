import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "./supabase-server";

function isAdmin(user: User): boolean {
  const role =
    (user.app_metadata as Record<string, unknown> | null)?.role ??
    (user.user_metadata as Record<string, unknown> | null)?.role;
  return role === "admin";
}

export const verifySession = cache(async (): Promise<User> => {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) redirect("/login");
  return user;
});

export const getSessionOrNull = cache(async (): Promise<User | null> => {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return isAdmin(user) ? user : null;
});
