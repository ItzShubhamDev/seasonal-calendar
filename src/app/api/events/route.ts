import { auth } from "@/auth";
import connect from "@/lib/db";
import { Event } from "@/schemas/Event";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    try {
        await connect();
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const events = await Event.find({ userId: session.user.id });
        return NextResponse.json(events);
    } catch {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { date, event } = body;
        if (!date || !event) {
            return NextResponse.json(
                { error: "Date and event are required" },
                { status: 400 }
            );
        }
        await connect();
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await Event.create({
            date: new Date(date),
            event,
            userId: session.user.id,
        });

        return NextResponse.json({ message: "Event created" }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
};
