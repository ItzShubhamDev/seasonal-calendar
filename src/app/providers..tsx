"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class">
                <ToastContainer
                    pauseOnFocusLoss={false}
                    pauseOnHover={false}
                    theme="dark"
                    toastClassName={
                        "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-white"
                    }
                />
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}
