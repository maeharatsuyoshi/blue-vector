"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseServer } from "./supabase-server";

const LoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

export type LoginState = {
  error?: string;
  email?: string;
};

export async function loginAction(
  _prev: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Please enter a valid email and password.",
      email: String(formData.get("email") ?? ""),
    };
  }

  const { email, password } = parsed.data;
  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password.", email };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}
