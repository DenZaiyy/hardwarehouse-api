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
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return (
        <ClerkProvider localization={frFR}>
            <html lang="fr" suppressHydrationWarning>
                <body className={`antialiased`}>
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
                </body>
            </html>
        </ClerkProvider>
    );
}
