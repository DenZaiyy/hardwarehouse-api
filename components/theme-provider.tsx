"use client"

import * as React from "react"
import {useServerInsertedHTML} from "next/navigation"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "theme"

function getSystemTheme(): ResolvedTheme {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(resolved: ResolvedTheme) {
    document.documentElement.classList.toggle("dark", resolved === "dark")
}

// Injecté via useServerInsertedHTML (hors de l'arbre React qui hydrate) pour appliquer le
// thème avant la peinture sans déclencher l'avertissement React 19 sur les <script> rendus
// par un composant. next-themes fait ça avec un <script> JSX classique, ce que React 19
// n'accepte plus silencieusement (cf. https://github.com/pacocoursey/next-themes/issues/387).
const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}")||"system";var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;document.documentElement.classList.toggle("dark",r==="dark")}catch(e){}})()`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useServerInsertedHTML(() => (
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
    ))

    const [theme, setThemeState] = React.useState<Theme>("system")
    const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light")

    React.useEffect(() => {
        const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system"
        setThemeState(stored)
        setResolvedTheme(stored === "system" ? getSystemTheme() : stored)
    }, [])

    React.useEffect(() => {
        if (theme !== "system") return

        const media = window.matchMedia("(prefers-color-scheme: dark)")
        const onChange = () => {
            const resolved = getSystemTheme()
            setResolvedTheme(resolved)
            applyTheme(resolved)
        }
        media.addEventListener("change", onChange)
        return () => media.removeEventListener("change", onChange)
    }, [theme])

    const setTheme = React.useCallback((next: Theme) => {
        const resolved = next === "system" ? getSystemTheme() : next

        // Désactive temporairement les transitions CSS pour éviter un fondu visible sur
        // tous les éléments en même temps quand on change de thème (comportement next-themes).
        const css = document.createElement("style")
        css.textContent = "*,*::before,*::after{transition:none!important}"
        document.head.appendChild(css)

        setThemeState(next)
        setResolvedTheme(resolved)
        applyTheme(resolved)
        try {
            localStorage.setItem(STORAGE_KEY, next)
        } catch {
            // localStorage indisponible (navigation privée, quota...) : le thème ne persiste
            // pas entre sessions mais l'application du thème courant reste fonctionnelle.
        }

        window.getComputedStyle(document.body)
        setTimeout(() => document.head.removeChild(css), 1)
    }, [])

    const value = React.useMemo(
        () => ({ theme, resolvedTheme, setTheme }),
        [theme, resolvedTheme, setTheme]
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
    const ctx = React.useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
    return ctx
}
