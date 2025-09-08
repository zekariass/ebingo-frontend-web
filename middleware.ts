import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Define protected routes
const PROTECTED_PATHS = ["/admin", "/rooms"];

export async function middleware(req: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
            },
        }
    );

    // Secure check: validates token with Supabase Auth server
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (PROTECTED_PATHS.some((path) => req.nextUrl.pathname.startsWith(path))) {
        if (!user) {
            // Redirect to login if not authenticated
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}
