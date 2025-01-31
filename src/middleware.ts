import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const cookies = req.cookies;

    if (!cookies.get("authjs.session-token")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
        try {
            const sessionResponse = await fetch(
                `${req.nextUrl.origin}/api/auth/session`,
                {
                    headers: {
                        cookie: req.headers.get("cookie") || "",
                    },
                }
            );
            if (sessionResponse.status !== 200) {
                throw new Error("Session not found");
            }
        } catch (error) {
            console.log(error);
            
            const response = NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
            response.cookies.set("authjs.session-token", "", {
                expires: new Date(0),
            });
            return response;
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/events/:path*", "/auth/user"],
};
