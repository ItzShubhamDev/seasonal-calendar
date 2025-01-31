import { auth } from "@/auth";
import { getIP, getWeather } from "@/lib/serverFunctions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
      const lan = req.nextUrl.searchParams.get("lan");
    const lon = req.nextUrl.searchParams.get("lon");
    const city = req.nextUrl.searchParams.get("city");
    const region = req.nextUrl.searchParams.get("region");

    if (lan && lon && city && region) {
        const weather = await getWeather(lan, lon, city, region);
        return NextResponse.json(weather);
    }

    const session = await auth();

    if (session?.user) {
        const weather = await getWeather(
            session.user.latitude,
            session.user.longitude,
            session.user.city,
            session.user.region
        );
        return NextResponse.json(weather);
    }

    const clientIp =
        req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");

    const ip = await getIP(clientIp as string);
    if (!ip) {
        return NextResponse.json(
            { error: "Failed to get IP" },
            { status: 400 }
        );
    }
    const weather = await getWeather(ip.lat, ip.lon, ip.city, ip.regionName);
    if (!weather) {
        return NextResponse.json(
            { error: "Failed to get weather" },
            { status: 400 }
        );
    }
    return NextResponse.json(weather);
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "An error occurred while getting weather" },
            { status: 500 }
        );
    }
};
