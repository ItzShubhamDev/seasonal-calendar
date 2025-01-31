import { auth } from "@/auth";
import { getHolidays, getIP } from "@/lib/serverFunctions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        const year = req.nextUrl.searchParams.get("year");
        const session = await auth();
        if (session?.user) {
            const country = session.user.country;
            const holidays = await getHolidays(
                country,
                year || new Date().getFullYear().toString()
            );
            return NextResponse.json(holidays);
        }
        const clientIp =
            req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
        const ip = await getIP(clientIp as string);
        if (ip) {
            const holidays = await getHolidays(
                ip.countryCode,
                year || new Date().getFullYear().toString()
            );
            return NextResponse.json(holidays);
        }
        return NextResponse.json(
            { error: "Failed to get holidays" },
            { status: 400 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "An error occurred while getting holidays" },
            { status: 500 }
        );
    }
};
