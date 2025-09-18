import slugify from "slugify";

export function slugifyName(name: string): string {
    return slugify(name, {
        lower: true,      // Convertir en minuscules
        strict: true,     // Supprimer tous les caractères spéciaux
        locale: 'fr'      // Support spécifique pour le français
    })
}