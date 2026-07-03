// src/app/auth/signout/route.ts
//
// POST endpoint para sign out. Llamado desde UserMenu.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
