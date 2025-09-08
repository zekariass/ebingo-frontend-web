"use client";

import { supabaseBrowser } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function useSession() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = supabaseBrowser();

    useEffect(() => {
        // get initial session
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        // listen for changes (login/logout/refresh)
        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.subscription.unsubscribe();
    }, [supabase]);

    return { session, user: session?.user ?? null, loading };
}
