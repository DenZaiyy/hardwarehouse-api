import React from "react";
import "../globals.css";
import {ClerkProvider} from "@clerk/nextjs";
import type {Metadata} from "next";
import {Toaster} from "react-hot-toast";
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {cookies} from "next/headers";
import {AdminSidebar} from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration",
    description: "API to manage products and categories for a hardware store",
    authors: { name: "DenZaiyy", url: "https://github.com/denzaiyy/" },
    keywords: [
        "Hardware",
        "Store",
        "Products",
        "Categories",
        "API",
        "Next.js",
        "TypeScript",
        "Prisma",
        "RESTful",
    ],
};

export default async function DashboardLayout({ children}: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

    return (
        <ClerkProvider>
            <html lang="fr" suppressHydrationWarning>
                <body className="antialiased">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <SidebarProvider defaultOpen={defaultOpen}>
                            <AdminSidebar />
                            <main className="p-4 flex-1">
                                <SidebarTrigger />
                                <Toaster
                                    position="bottom-center"
                                    reverseOrder={false}
                                />
                                {children}
                            </main>
                        </SidebarProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
