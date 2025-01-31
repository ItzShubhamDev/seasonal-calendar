import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const nasaApiKey = process.env.NASA_API_KEY;
    if (!nasaApiKey) {
        console.error("NASA API Key not found");
        return NextResponse.json(
            {
                error: "Internal Server Error",
            },
            { status: 500 }
        );
    }
    try {
        const r = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}`
        );
        const data = await r.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
            },
            { status: 500 }
        );
    }
};
