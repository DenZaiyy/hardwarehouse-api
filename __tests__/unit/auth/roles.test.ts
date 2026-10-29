import {describe, expect, test} from '@jest/globals';
import {isAdminRole, isStaffRole} from "@/lib/auth/roles";

describe('rôles du back-office', () => {
    test("l'employé et l'administrateur font partie de l'équipe", () => {
        expect(isStaffRole("employee")).toBe(true);
        expect(isStaffRole("admin")).toBe(true);
    });

    test("un compte sans rôle, comme un compte inscrit seul, n'en fait pas partie", () => {
        expect(isStaffRole(undefined)).toBe(false);
        expect(isStaffRole("")).toBe(false);
        expect(isStaffRole("customer")).toBe(false);
    });

    test("seul l'administrateur a les droits d'administration", () => {
        expect(isAdminRole("admin")).toBe(true);
        expect(isAdminRole("employee")).toBe(false);
        expect(isAdminRole(undefined)).toBe(false);
    });
});
