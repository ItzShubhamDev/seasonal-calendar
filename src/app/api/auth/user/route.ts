import { auth } from "@/auth";
import { User } from "@/schemas/User";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest) => {
    try {
        const session = await auth();

        if (!session?.user)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        const body = await req.json();
        const { email, city, region, country, latitude, longitude } = body;

        if (!email || !city || !region || !country || !latitude || !longitude) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }
        console.log(session.user.id);
        await User.findByIdAndUpdate(session.user.id, {
            email,
            city,
            region,
            country,
            latitude,
            longitude,
        });
        return NextResponse.json({ message: "User updated" });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "An error occurred while updating user" },
            { status: 500 }
        );
    }
};
