import { getCities, getCountries, getRegions } from "@/lib/serverFunctions";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const country = req.nextUrl.searchParams.get("country");
    const region = req.nextUrl.searchParams.get("region");
    if (!country) {
        const countries = await getCountries();
        if (!countries) {
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
        return NextResponse.json(countries);
    }
    if (!region) {
        const regions = await getRegions(country);
        if (!regions) {
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
        return NextResponse.json(regions);
    }
    const cities = await getCities(country, region);
    if (!cities) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
    return NextResponse.json(cities);
};
