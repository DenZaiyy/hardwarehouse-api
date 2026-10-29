// Rôles du back-office, posés dans publicMetadata.role à la création d'un compte (POST /api/v1/users).
// L'administrateur a tous les droits de l'employé, plus les comptes, les mouvements de stock et les bons de commande.
// Un compte sans rôle, comme un compte inscrit de lui-même, n'a accès à rien.
export function isStaffRole(role: unknown): boolean {
    return role === "admin" || role === "employee";
}

export function isAdminRole(role: unknown): boolean {
    return role === "admin";
}
