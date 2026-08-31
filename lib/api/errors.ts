export class ApiError extends Error {
    constructor(
        public readonly message: string,
        public readonly status: number,
        public readonly code?: string
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// Erreurs génériques réutilisables partout
export class NotFoundError extends ApiError {
    constructor(resource = "Ressource") {
        super(`${resource} introuvable`, 404, "NOT_FOUND");
    }
}

export class UnauthorizedError extends ApiError {
    constructor() {
        super("Non autorisé", 401, "UNAUTHORIZED");
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = "Accès réservé aux administrateurs") {
        super(message, 403, "FORBIDDEN");
    }
}

export class BadRequestError extends ApiError {
    constructor(message = "Requête invalide") {
        super(message, 400, "BAD_REQUEST");
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}