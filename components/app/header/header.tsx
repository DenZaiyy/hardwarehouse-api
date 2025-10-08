import Link from "next/link";
import {SignedIn, SignedOut, UserButton} from "@clerk/nextjs";
import React from "react";

const Header = () => {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 borber-b-1 border-foreground">
            <nav className="flex items-center justify-between flex-1">
                <Link href="/">HardWareHouse</Link>
                <Link href="/">Accueil</Link>
            </nav>
            <SignedOut>
                <Link href="/sign-in/">Se connecter</Link>
            </SignedOut>
            <SignedIn>
                <Link href="/admin/">Administration</Link>
                <UserButton />
            </SignedIn>
        </header>
    )
}

export default Header;