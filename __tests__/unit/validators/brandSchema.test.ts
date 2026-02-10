import {describe, expect, test} from '@jest/globals';
import {brandSchema} from "@/lib/validators/brandSchema";

describe('brandSchema', () => {
    describe('Valid inputs', () => {
        test("should accept brand with name and active true", () => {
            const result = brandSchema.safeParse({
                name: "Apple",
                active: true
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Apple");
                expect(result.data.active).toBe(true);
            }
        });

        test("should accept brand with name and active false", () => {
            const result = brandSchema.safeParse({
                name: "Samsung",
                active: false
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Samsung");
                expect(result.data.active).toBe(false);
            }
        });

        test("should accept brand with long name", () => {
            const result = brandSchema.safeParse({
                name: "International Business Machines Corporation",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should trim whitespace from name", () => {
            const result = brandSchema.safeParse({
                name: "  Dell  ",
                active: true
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Dell");
            }
        });

        test("should accept name with special characters", () => {
            const result = brandSchema.safeParse({
                name: "L'Oréal",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept name with numbers", () => {
            const result = brandSchema.safeParse({
                name: "3M Company",
                active: true
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - Name', () => {
        test("should reject name with only 1 character", () => {
            const result = brandSchema.safeParse({
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
            const result = brandSchema.safeParse({
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
            const result = brandSchema.safeParse({
                name: "   ",
                active: true
            });

            expect(result.success).toBe(false);
        });

        test("should reject name exceeding 100 characters", () => {
            const longName = "A".repeat(101);
            const result = brandSchema.safeParse({
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
            const result = brandSchema.safeParse({
                active: true
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Active field', () => {
        test("should reject missing active field", () => {
            const result = brandSchema.safeParse({
                name: "Brand"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-boolean active field", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                active: "true"
            });

            expect(result.success).toBe(false);
        });

        test("should reject null active field", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                active: null
            });

            expect(result.success).toBe(false);
        });

        test("should reject undefined active field", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                active: undefined
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle minimum valid name (2 characters)", () => {
            const result = brandSchema.safeParse({
                name: "HP",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should handle maximum valid name (100 characters)", () => {
            const maxName = "A".repeat(100);
            const result = brandSchema.safeParse({
                name: maxName,
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept Unicode characters in name", () => {
            const result = brandSchema.safeParse({
                name: "日本電気株式会社",
                active: true
            });

            expect(result.success).toBe(true);
        });

        test("should accept emoji in name", () => {
            const result = brandSchema.safeParse({
                name: "Tesla 🚗",
                active: false
            });

            expect(result.success).toBe(true);
        });

        test("should handle null name gracefully", () => {
            const result = brandSchema.safeParse({
                name: null,
                active: true
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = brandSchema.safeParse({
                name: "Google",
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
            const result = brandSchema.safeParse({
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

    describe('Real-world brand examples', () => {
        test("should accept famous tech brands", () => {
            const brands = [
                { name: "Apple Inc.", active: true },
                { name: "Google LLC", active: true },
                { name: "Microsoft Corporation", active: true },
                { name: "Amazon.com, Inc.", active: false }
            ];

            brands.forEach(brand => {
                const result = brandSchema.safeParse(brand);
                expect(result.success).toBe(true);
            });
        });

        test("should accept inactive brands", () => {
            const result = brandSchema.safeParse({
                name: "Discontinued Brand",
                active: false
            });

            expect(result.success).toBe(true);
        });
    });
});