"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

// ill redirect to login page if user clicks logout
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
