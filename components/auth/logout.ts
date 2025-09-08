'use client';

import { supabaseBrowser } from "@/lib/supabase/client";

export function logout() {
  const supabase = supabaseBrowser();

  return supabase.auth.signOut();
}
