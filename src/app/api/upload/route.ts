import { auth } from "@/auth";
import model from "@/lib/ai";
import { Event } from "@/schemas/Event";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const ai = model;
    if (!ai) {
        return NextResponse.json(
            { error: "AI model not found" },
            { status: 500 }
        );
    }

    try {
        const formData = await req.formData();
        const body = Object.fromEntries(formData);
        const file = (body.file as Blob) || null;

        if (file) {
            const image = Buffer.from(await file.arrayBuffer()).toString(
                "base64"
            );
            const res = await ai.generateContent([
                {
                    inlineData: {
                        data: image,
                        mimeType: file.type,
                    },
                },
                "date",
            ]);

            const response = res.response.text();
            const data = response.split("```")[1].replace("json", "");
            const json = JSON.parse(data);

            const session = await auth();

            if (!session?.user) {
                return NextResponse.json({ authenticated: false, data: json });
            }

            for (const event of json) {
                if (event.date) {
                    const ev = await Event.findOne({
                        date: new Date(event.date),
                        event: event.event,
                        userId: session.user.id,
                    });
                    if (!ev) {
                        await Event.create({
                            date: new Date(event.date),
                            event: event.event,
                            userId: session.user.id,
                        });
                    }
                }
            }

            const events = await Event.find({ userId: session.user.id });
            return NextResponse.json({ authenticated: true, data: events });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
};
