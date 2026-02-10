import {describe, expect, test} from '@jest/globals';
import {categorySchema} from "@/lib/validators/categorySchema";

describe('categorySchema', () => {
    describe('Valid inputs', () => {
        test("should accept category with name and active true", () => {
            const result = categorySchema.safeParse({
                name: "Electronics",
                active: true
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Electronics");
                expect(result.data.active).toBe(true);
            }
        });

        test("should accept category with name and active false", () => {
            const result = categorySchema.safeParse({
                name: "Computers",
                active: false
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Computers");
                expect(result.data.active).toBe(false);
            }
        });

        test("should accept category with long name", () => {
            const result = categorySchema.safeParse({
                name: "Audio and Video Equipment",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should trim whitespace from name", () => {
            const result = categorySchema.safeParse({
                name: "  Smartphones  ",
                active: true
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Smartphones");
            }
        });

        test("should accept name with special characters", () => {
            const result = categorySchema.safeParse({
                name: "Audio & Video",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept name with numbers", () => {
            const result = categorySchema.safeParse({
                name: "Gaming PC 2024",
                active: true
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - Name', () => {
        test("should reject name with only 1 character", () => {
            const result = categorySchema.safeParse({
                name: "A",
                active: true
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('name') &&
                    issue.message.includes('au moins 2 caractères')
                )).toBe(true);
            }
        });

        test("should reject empty name", () => {
            const result = categorySchema.safeParse({
                name: "",
                active: true
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('name')
                )).toBe(true);
            }
        });

        test("should reject name with only whitespace", () => {
            const result = categorySchema.safeParse({
                name: "   ",
                active: true
            });

            expect(result.success).toBe(false);
        });

        test("should reject name exceeding 100 characters", () => {
            const longName = "A".repeat(101);
            const result = categorySchema.safeParse({
                name: longName,
                active: true
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('100 caractères')
                )).toBe(true);
            }
        });

        test("should reject missing name", () => {
            const result = categorySchema.safeParse({
                active: true
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Active field', () => {
        test("should reject missing active field", () => {
            const result = categorySchema.safeParse({
                name: "Category"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-boolean active field", () => {
            const result = categorySchema.safeParse({
                name: "Category",
                active: "true"
            });

            expect(result.success).toBe(false);
        });

        test("should reject null active field", () => {
            const result = categorySchema.safeParse({
                name: "Category",
                active: null
            });

            expect(result.success).toBe(false);
        });

        test("should reject undefined active field", () => {
            const result = categorySchema.safeParse({
                name: "Category",
                active: undefined
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle minimum valid name (2 characters)", () => {
            const result = categorySchema.safeParse({
                name: "PC",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should handle maximum valid name (100 characters)", () => {
            const maxName = "A".repeat(100);
            const result = categorySchema.safeParse({
                name: maxName,
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept Unicode characters in name", () => {
            const result = categorySchema.safeParse({
                name: "Électronique",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept emoji in name", () => {
            const result = categorySchema.safeParse({
                name: "Gaming 🎮",
                active: false
            });

            expect(result.success).toBe(true);
        });

        test("should handle null name gracefully", () => {
            const result = categorySchema.safeParse({
                name: null,
                active: true
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = categorySchema.safeParse({
                name: "Hardware",
                active: true
            });

            if (result.success) {
                const name: string = result.data.name;
                const active: boolean = result.data.active;

                expect(typeof name).toBe('string');
                expect(typeof active).toBe('boolean');
            }
        });

        test("should return error details on failure", () => {
            const result = categorySchema.safeParse({
                name: "A",
                active: "not-boolean"
            });

            if (!result.success) {
                expect(result.error.issues).toBeInstanceOf(Array);
                expect(result.error.issues.length).toBeGreaterThan(0);
                expect(result.error.issues[0]).toHaveProperty('message');
                expect(result.error.issues[0]).toHaveProperty('path');
            }
        });
    });

    describe('Real-world category examples', () => {
        test("should accept common hardware categories", () => {
            const categories = [
                { name: "Processeurs", active: true },
                { name: "Cartes Graphiques", active: true },
                { name: "Mémoire RAM", active: true },
                { name: "Stockage SSD", active: false }
            ];

            categories.forEach(category => {
                const result = categorySchema.safeParse(category);
                expect(result.success).toBe(true);
            });
        });

        test("should accept inactive categories", () => {
            const result = categorySchema.safeParse({
                name: "Discontinued Category",
                active: false
            });

            expect(result.success).toBe(true);
        });
    });
});