import slugify from "slugify";
import {format} from "date-fns";

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