import React from "react";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import Header from "@/components/admin/header/header";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration",
    description: "API to manage products and categories for a hardware store",
    authors: {name: 'DenZaiyy', url: 'https://github.com/denzaiyy/'},
    keywords: ['Hardware', 'Store', 'Products', 'Categories', 'API', 'Next.js', 'TypeScript', 'Prisma', 'RESTful'],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="fr">
                <body className="antialiased flex">
                    <Header />
                    <main className="p-2 md:p-4 flex-1">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    )
}