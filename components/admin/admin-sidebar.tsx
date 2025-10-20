import {Boxes, FolderTree, Globe, LayoutDashboard, LogOutIcon, Package, Tags, User} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import React from "react";
import {ThemeSwitcher} from "@/components/theme-switcher";
import Link from "next/link";
import {SignedIn, SignOutButton} from "@clerk/nextjs";
import {auth, currentUser} from "@clerk/nextjs/server";

const items = [
    {
        title: "Tableau de bord",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: User,
    },
    {
        title: "Produits",
        url: "/admin/products",
        icon: Package,
    },
    {
        title: "Catégories",
        url: "/admin/categories",
        icon: FolderTree,
    },
    {
        title: "Marques",
        url: "/admin/brands",
        icon: Tags,
    },
    {
        title: "Stocks",
        url: "/admin/stocks",
        icon: Boxes,
    },
    {
        title: "Bon de commandes",
        url: "/admin/purchase-orders",
        icon: Globe,
    },
    {
        title: "Historique de mouvements",
        url: "/admin/transactions",
        icon: Boxes,
    },
]

export async function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isAuthenticated } = await auth()
    if (!isAuthenticated) {
        return <div>Sign in to view this page</div>
    }

    const user = await currentUser()

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <ThemeSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>HardWareHouse</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-center">
                <SidebarMenu>
                    <SignedIn>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <SignOutButton>
                                    <span>
                                        <LogOutIcon /> Se déconnecter ({user?.username})
                                    </span>
                                </SignOutButton>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SignedIn>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/" target="_blank">
                                <Globe />
                                <span>Voir le site</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}