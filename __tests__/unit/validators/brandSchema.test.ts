import {describe, expect, test} from '@jest/globals';
import {brandSchema} from "@/lib/validators/brandSchema";

describe('brandSchema', () => {
    describe('Valid inputs', () => {
        test("should accept brand with name and valid logo URL", () => {
            const result = brandSchema.safeParse({
                name: "Apple",
                logo: "https://example.com/logos/apple.png"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Apple");
                expect(result.data.logo).toBe("https://example.com/logos/apple.png");
            }
        });

        test("should accept brand with name and empty logo", () => {
            const result = brandSchema.safeParse({
                name: "Samsung",
                logo: ""
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Samsung");
                expect(result.data.logo).toBe("");
            }
        });

        test("should accept brand with only name (logo undefined)", () => {
            const result = brandSchema.safeParse({
                name: "Microsoft"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Microsoft");
            }
        });

        test("should accept brand with long name", () => {
            const result = brandSchema.safeParse({
                name: "International Business Machines Corporation",
                logo: "https://example.com/logos/ibm.png"
            });

            expect(result.success).toBe(true);
        });

        test("should accept various valid URL formats", () => {
            const validUrls = [
                "https://example.com/logo.png",
                "http://cdn.example.com/brands/logo.jpg",
                "https://storage.googleapis.com/bucket/logo.svg",
                "https://s3.amazonaws.com/brand-logos/logo.webp"
            ];

            validUrls.forEach(url => {
                const result = brandSchema.safeParse({
                    name: "Brand",
                    logo: url
                });
                expect(result.success).toBe(true);
            });
        });

        test("should trim whitespace from name", () => {
            const result = brandSchema.safeParse({
                name: "  Dell  ",
                logo: "https://example.com/dell.png"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Dell");
            }
        });

        test("should accept name with special characters", () => {
            const result = brandSchema.safeParse({
                name: "L'Oréal",
                logo: "https://example.com/loreal.png"
            });

            expect(result.success).toBe(true);
        });

        test("should accept name with numbers", () => {
            const result = brandSchema.safeParse({
                name: "3M Company",
                logo: "https://example.com/3m.png"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - Name', () => {
        test("should reject name with only 1 character", () => {
            const result = brandSchema.safeParse({
                name: "A",
                logo: "https://example.com/logo.png"
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
                logo: "https://example.com/logo.png"
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
                logo: "https://example.com/logo.png"
            });

            expect(result.success).toBe(false);
        });

        test("should reject name exceeding 100 characters", () => {
            const longName = "A".repeat(101);
            const result = brandSchema.safeParse({
                name: longName,
                logo: "https://example.com/logo.png"
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
                logo: "https://example.com/logo.png"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Logo URL', () => {
        test("should reject invalid URL format", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                logo: "not-a-valid-url"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('logo') &&
                    issue.message.includes('valide')
                )).toBe(true);
            }
        });

        test("should reject URL without protocol", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                logo: "example.com/logo.png"
            });

            expect(result.success).toBe(false);
        });

        test("should reject relative URL", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                logo: "/images/logo.png"
            });

            expect(result.success).toBe(false);
        });

        test("should reject malformed URL", () => {
            const invalidUrls = [
                "htp://example.com/logo.png",  // typo in protocol
                "https//example.com/logo.png",  // missing colon
                "https:example.com/logo.png",   // missing slashes
                "javascript:alert('xss')"       // dangerous protocol
            ];

            invalidUrls.forEach(url => {
                const result = brandSchema.safeParse({
                    name: "Brand",
                    logo: url
                });
                expect(result.success).toBe(false);
            });
        });

        test("should reject URL with spaces", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                logo: "https://example.com/logo with spaces.png"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle minimum valid name (2 characters)", () => {
            const result = brandSchema.safeParse({
                name: "HP",
                logo: "https://example.com/hp.png"
            });

            expect(result.success).toBe(true);
        });

        test("should handle maximum valid name (100 characters)", () => {
            const maxName = "A".repeat(100);
            const result = brandSchema.safeParse({
                name: maxName,
                logo: "https://example.com/logo.png"
            });

            expect(result.success).toBe(true);
        });

        test("should accept Unicode characters in name", () => {
            const result = brandSchema.safeParse({
                name: "日本電気株式会社",  // NEC in Japanese
                logo: "https://example.com/nec.png"
            });

            expect(result.success).toBe(true);
        });

        test("should accept emoji in name", () => {
            const result = brandSchema.safeParse({
                name: "Tesla 🚗",
                logo: "https://example.com/tesla.png"
            });

            expect(result.success).toBe(true);
        });

        test("should handle null values gracefully", () => {
            const result = brandSchema.safeParse({
                name: null,
                logo: null
            });

            expect(result.success).toBe(false);
        });

        test("should handle undefined logo gracefully", () => {
            const result = brandSchema.safeParse({
                name: "Brand",
                logo: undefined
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = brandSchema.safeParse({
                name: "Google",
                logo: "https://example.com/google.png"
            });

            if (result.success) {
                // TypeScript should infer correct types
                const name: string = result.data.name;
                const logo: string | undefined = result.data.logo;

                expect(typeof name).toBe('string');
                expect(logo).toBeDefined();
            }
        });

        test("should return error details on failure", () => {
            const result = brandSchema.safeParse({
                name: "A",
                logo: "invalid-url"
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
                { name: "Apple Inc.", logo: "https://cdn.example.com/apple.svg" },
                { name: "Google LLC", logo: "https://cdn.example.com/google.svg" },
                { name: "Microsoft Corporation", logo: "https://cdn.example.com/microsoft.svg" },
                { name: "Amazon.com, Inc.", logo: "https://cdn.example.com/amazon.svg" }
            ];

            brands.forEach(brand => {
                const result = brandSchema.safeParse(brand);
                expect(result.success).toBe(true);
            });
        });

        test("should accept brands without logos (startups)", () => {
            const result = brandSchema.safeParse({
                name: "New Startup Co."
            });

            expect(result.success).toBe(true);
        });

        test("should accept brands with CDN URLs", () => {
            const result = brandSchema.safeParse({
                name: "Nike",
                logo: "https://cdn.cloudflare.com/brands/nike-logo.png"
            });

            expect(result.success).toBe(true);
        });
    });
});