import Image, {type ImageProps} from "next/image";

// Images du catalogue (produits, marques, catégories) : ImageUploadService les enregistre déjà en WebP aux tailles
// utiles, et l'optimiseur de Next.js ne trouverait pas celles envoyées après le démarrage du serveur, qui ne sert en
// production que les fichiers de public/ présents à ce moment-là. Le navigateur les demande donc directement : à
// Nginx en production (location /images/, voir deploy/README.md). L'aperçu d'un fichier choisi (blob:) passe aussi.
export function CatalogImage({alt, ...props}: ImageProps) {
    return <Image alt={alt} {...props} unoptimized />;
}
