"use client"

import Link from "next/link";
import {usePathname} from "next/navigation";

export default function Header() {
    const pathname = usePathname()

    if (!pathname.startsWith('/admin')) return null

    return (
        <aside
            className={`hidden md:flex md:flex-col md:min-h-svh md:w-64 bg-gray-800 mix-blend-difference text-foreground shadow justify-between border-r-2 border-r-foreground`}>
            <a href="/admin"
               className={`py-4 px-8 flex items-center border-b border-foreground hover:bg-foreground/10 transition-all duration-300 group bg-foreground/20 border-l-4 border-l-background/50`}>Tableau
                de bord</a>
            <div className="flex md:flex-1 md:flex-col">
                <ul className="flex flex-col">
                    <li className="border-b border-[#427AA1]">
                        <Link href={'/admin/products'} className={`flex py-4 px-8 items-center hover:bg-[#427AA1]/10 transition-all duration-300 group`}>Products</Link>
                        <Link href={'/admin/categories'} className={`flex py-4 px-8 items-center hover:bg-[#427AA1]/10 transition-all duration-300 group`}>Categories</Link>
                        <Link href={'/admin/brands'} className={`flex py-4 px-8 items-center hover:bg-[#427AA1]/10 transition-all duration-300 group`}>Brands</Link>
                    </li>
                </ul>
            </div>
            <Link href={'/'} className={'py-4 px-8 flex items-center border-t border-[#427AA1] hover:bg-[#427AA1]/10 transition-all duration-300 group'}>Retourner à l&#39;accueil</Link>
        </aside>
    )
}