import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import slugify from "slugify";
import {format} from "date-fns";
import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugifyName(name: string): string {
    return slugify(name, {
        lower: true,      // Convertir en minuscules
        strict: true,     // Supprimer tous les caractères spéciaux
        locale: 'fr'      // Support spécifique pour le français
    })
}

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Valide qu'un slug ne contient que des caractères attendus (a-z, 0-9, tirets).
 * Utilisé aux frontières des routes qui construisent des chemins fichiers à partir
 * d'un slug (upload/suppression d'images) pour empêcher toute tentative de path traversal,
 * indépendamment de la garantie indirecte apportée par un lookup en base.
 */
export function isSafeSlug(slug: string): boolean {
    return SAFE_SLUG_PATTERN.test(slug);
}

export function formatDate(date: Date|string): string {
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss") ?? "Date not available"
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(price);
}

export const rateLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
    analytics: true,
})