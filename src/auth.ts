import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connect from "./lib/db";
import { User } from "./schemas/User";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connect();
                if (!credentials) {
                    return null;
                }
                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    return null;
                }
                const passwordMatch = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );
                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user.id,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            await connect();
            const u = await User.findById(token.sub);
            if (u) {
                token.id = u.id;
                token.email = u.email;
                token.city = u.city;
                token.region = u.region;
                token.country = u.country;
                token.latitude = u.latitude;
                token.longitude = u.longitude;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token as any;
            return session;
        },
    },
});
