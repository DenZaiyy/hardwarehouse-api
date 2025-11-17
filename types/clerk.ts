export interface CustomPublicMetadata {
    role?: 'admin' | 'employee';
}

declare global {
    interface CustomJwtSessionClaims {
        publicMetadata?: CustomPublicMetadata;
    }
}