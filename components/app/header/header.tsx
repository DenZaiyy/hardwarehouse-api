import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import React from "react";

const Header = () => {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 borber-b-1 border-foreground">
            <nav className="flex items-center justify-between flex-1">
                <Link href="/">HardWareHouse</Link>
                <Link href="/">Accueil</Link>
            </nav>
            <Show when="signed-out">
                <Link href="/sign-in/">Se connecter</Link>
            </Show>
            <Show when="signed-in">
                <Link href="/admin/">Administration</Link>
                <UserButton />
            </Show>
        </header>
    );
}

export default Header;