import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const session = request.cookies.get("next-auth.session-token");

    // 세션 있을 때
    if (session) {
        if (request.nextUrl.pathname.startsWith("/signin")) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        if (request.nextUrl.pathname.startsWith("/signup")) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    }

    // 세션 없을 때
    if (request.nextUrl.pathname.startsWith("/signin")) {
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith("/signup")) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/signin", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/groups/:path*", "/signup", "/signin"],
};
