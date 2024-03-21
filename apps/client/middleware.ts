import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const session = request.cookies.get("next-auth.session-token");

    if (request.nextUrl.pathname.startsWith("/signin")) {
        console.log("signin");
        return NextResponse.rewrite(new URL("/", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/signup")) {
        console.log("signin");
        return NextResponse.rewrite(new URL("/", request.url));
    }

    if (session) {
        console.log("session");
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/signin", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/groups/", "/signup", "/signin"],
};
