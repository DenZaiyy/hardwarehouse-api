import Link from "next/link";
import {SignedIn, SignedOut, UserButton} from "@clerk/nextjs";
import React from "react";

const Header = () => {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 borber-b-1 border-foreground">
            <nav>
                <Link href="/" className="mr-4">Accueil</Link>
                <Link href="/admin">Administration</Link>
            </nav>
            <SignedOut>
                <Link href="/sign-in">Se connecter</Link>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </header>
    )
}

export default Header;