"use server";

import { signOut } from "@/lib/auth-node";

export async function signOutAction() {
  await signOut({ redirectTo: "/auth/login" });
}
