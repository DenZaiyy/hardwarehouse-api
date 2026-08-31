import {Boxes, FolderTree, Globe, LayoutDashboard, LogOutIcon, Package, Percent, Tags, User} from "lucide-react"
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
import {Show, SignOutButton} from "@clerk/nextjs";
import {auth, currentUser} from "@clerk/nextjs/server";

const items = [
    {
        title: "Tableau de bord",
        url: "/admin",
        icon: LayoutDashboard,
        role: "employee"
    },
    {
        title: "Utilisateurs",
        url: "/admin/users",
        icon: User,
        role: "admin"
    },
    {
        title: "Produits",
        url: "/admin/products",
        icon: Package,
        role: "employee"
    },
    {
        title: "Catégories",
        url: "/admin/categories",
        icon: FolderTree,
        role: "employee"
    },
    {
        title: "Marques",
        url: "/admin/brands",
        icon: Tags,
        role: "employee"
    },
    {
        title: "Stocks",
        url: "/admin/stocks",
        icon: Boxes,
        role: "employee"
    },
    {
        title: "Remises",
        url: "/admin/discounts",
        icon: Percent,
        role: "employee"
    },
    {
        title: "Bon de commandes",
        url: "/admin/purchase-orders",
        icon: Globe,
        role: "employee"
    },
    {
        title: "Historique de mouvements",
        url: "/admin/transactions",
        icon: Boxes,
        role: "admin",
    },
]

export async function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isAuthenticated } = await auth()
    if (!isAuthenticated) {
        return <div>Sign in to view this page</div>
    }

    const user = await currentUser()
    const userRole = user?.publicMetadata.role

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
                            {items.filter(item => userRole === "admin" || item.role === "employee" ).map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        {/* <a> natif plutôt que next/link Link : le double asChild/Slot (SidebarMenuButton)
                                        + Link (son propre component-boundary avec ref/effects) produit un mismatch
                                        d'hydratation reproductible sous React 19, indépendant du bundler et de la
                                        version de @radix-ui/react-slot (testé). Le prefetch était déjà désactivé,
                                        donc Link n'apportait ici que la navigation SPA. */}
                                        <a href={item.url}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="text-center">
                <SidebarMenu>
                    <Show when="signed-in">
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className="cursor-pointer">
                                <SignOutButton>
                                    <span>
                                        <LogOutIcon /> Se déconnecter ({user?.username})
                                    </span>
                                </SignOutButton>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </Show>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                <Globe />
                                <span>Voir le site</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}