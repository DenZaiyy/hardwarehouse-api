import type {Metadata} from "next";
import "../globals.css";
import React from "react";
import {ClerkProvider} from "@clerk/nextjs";
import {Toaster} from "react-hot-toast";
import {frFR} from "@clerk/localizations";
import Header from "@/components/app/header/header";
import {ThemeProvider} from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "HardWareHouse - API",
    description: "API to manage products and categories for a hardware store",
    authors: {name: 'DenZaiyy', url: 'https://github.com/denzaiyy/'},
    keywords: ['Hardware', 'Store', 'Products', 'Categories', 'API', 'Next.js', 'TypeScript', 'Prisma', 'RESTful'],
    appleWebApp: { title: "HardWareHouse" },
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`antialiased`}>
                <ClerkProvider localization={frFR}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Header />
                        <main className="p-2 md:p-4">
                            <Toaster position={"bottom-right"} />
                            {children}
                        </main>
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
