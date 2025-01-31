import type { Metadata } from "next";
import "./globals.css";
import ThemeContainer from "./providers.";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
    title: "Seasonal Calendar",
    description: "A calendar with a beautiful UI and seasonal backgrounds",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="overflow-x-hidden xl:overflow-y-hidden"
        >
            <body>
                <ThemeContainer>{children}</ThemeContainer>
            </body>
        </html>
    );
}
