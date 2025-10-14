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

export function formatDate(date: Date|string): string {
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss") ?? "Date not available"
}

export const rateLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
    analytics: true,
})