import { User } from "@/schemas/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connect from "@/lib/db";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email, password } = body;
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email" },
                { status: 400 }
            );
        }
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }
        await connect();
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            email: body.email,
            password: hashedPassword,
        });

        return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { error: "An error occurred while registering" },
            { status: 500 }
        );
    }
};
