import {describe, expect, test} from '@jest/globals';
import {productSchema} from "@/lib/validators/productSchema";

describe('productSchema', () => {
    const createMockFile = (name: string, size: number): File => {
        const content = 'x'.repeat(size);
        const blob = new Blob([content], { type: 'image/jpeg' });
        return new File([blob], name, { type: 'image/jpeg' });
    };

    describe('Valid inputs', () => {
        test("should accept product with required fields only", () => {
            const result = productSchema.safeParse({
                name: "Gaming Laptop",
                price: 1299.99,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "computers"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("Gaming Laptop");
                expect(result.data.price).toBe(1299.99);
                expect(result.data.active).toBe(true);
                expect(result.data.brandId).toBe("995d6f97b4f676380c69bac9");
                expect(result.data.category).toBe("computers");
            }
        });

        test("should accept product with all optional fields", () => {
            const mockThumbnail = createMockFile('thumbnail.jpg', 1000000);
            const mockImages = [createMockFile('image1.jpg', 500000), createMockFile('image2.jpg', 800000)];

            const result = productSchema.safeParse({
                name: "Professional Monitor",
                price: 599.99,
                description: "High-quality professional monitor with excellent color accuracy",
                shortDescription: "Professional 4K monitor",
                thumbnail: mockThumbnail,
                images: mockImages,
                attributes: { "size": "27 inches", "resolution": "4K" },
                active: true,
                brandId: "534e59cb9130eadec4cbfbea",
                category: "monitors"
            });

            expect(result.success).toBe(true);
        });

        test("should accept product with price as string (coerced to number)", () => {
            const result = productSchema.safeParse({
                name: "Wireless Mouse",
                price: "49.99",
                active: true,
                brandId: "19198da90842d5a6485dc27b",
                category: "accessories"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.price).toBe(49.99);
                expect(typeof result.data.price).toBe('number');
            }
        });

        test("should accept product with zero price", () => {
            const result = productSchema.safeParse({
                name: "Free Software",
                price: 0,
                active: true,
                brandId: "abd995f750bd1431a3d4c42c",
                category: "software"
            });

            expect(result.success).toBe(true);
        });

        test("should accept product with empty attributes object", () => {
            const result = productSchema.safeParse({
                name: "Simple Product",
                price: 10.00,
                attributes: {},
                active: false,
                brandId: "1702bc3c685c6bfd7deb012f",
                category: "other"
            });

            expect(result.success).toBe(true);
        });

        test("should accept thumbnail file within size limit", () => {
            const mockThumbnail = createMockFile('thumb.jpg', 4000000); // 4MB

            const result = productSchema.safeParse({
                name: "Product with Thumbnail",
                price: 25.50,
                thumbnail: mockThumbnail,
                active: true,
                brandId: "41b41ee4839068e3c67dd76e",
                category: "category1"
            });

            expect(result.success).toBe(true);
        });

        test("should accept multiple images within size limits", () => {
            const mockImages = [
                createMockFile('img1.jpg', 2000000),
                createMockFile('img2.jpg', 3000000),
                createMockFile('img3.jpg', 1500000)
            ];

            const result = productSchema.safeParse({
                name: "Product with Images",
                price: 75.00,
                images: mockImages,
                active: true,
                brandId: "c58db8270320d06343fdf3a1",
                category: "category2"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - Name', () => {
        test("should reject name with only 1 character", () => {
            const result = productSchema.safeParse({
                name: "A",
                price: 10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
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
            const result = productSchema.safeParse({
                name: "",
                price: 10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing name", () => {
            const result = productSchema.safeParse({
                price: 10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Price', () => {
        test("should reject negative price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: -10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('price') &&
                    issue.message.includes('positif')
                )).toBe(true);
            }
        });

        test("should reject non-numeric price string", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: "not-a-number",
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing price", () => {
            const result = productSchema.safeParse({
                name: "Product",
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Short Description', () => {
        test("should reject shortDescription exceeding 255 characters", () => {
            const longDescription = "A".repeat(256);
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                shortDescription: longDescription,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('shortDescription') &&
                    issue.message.includes('255 caractères')
                )).toBe(true);
            }
        });
    });

    describe('Invalid inputs - Files', () => {
        test("should reject thumbnail exceeding 5MB", () => {
            const largeThumbnail = createMockFile('large.jpg', 6000000); // 6MB

            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                thumbnail: largeThumbnail,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('taille maximum')
                )).toBe(true);
            }
        });

        test("should reject images with one file exceeding 5MB", () => {
            const mockImages = [
                createMockFile('normal.jpg', 2000000),
                createMockFile('large.jpg', 6000000) // 6MB
            ];

            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                images: mockImages,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.message.includes('taille maximum')
                )).toBe(true);
            }
        });

        test("should reject non-File object as thumbnail", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                thumbnail: "not-a-file",
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-File objects in images array", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                images: ["not-a-file", "also-not-a-file"],
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Required fields', () => {
        test("should reject missing active field", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-boolean active field", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                active: "true",
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject empty brandId", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                active: true,
                brandId: "",
                category: "cat1"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('brandId') &&
                    issue.message.includes('Identifiant invalide')
                )).toBe(true);
            }
        });

        test("should reject missing brandId", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                active: true,
                category: "cat1"
            });

            expect(result.success).toBe(false);
        });

        test("should reject empty category", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: ""
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('category') &&
                    issue.message.includes('requise')
                )).toBe(true);
            }
        });

        test("should reject missing category", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                active: true,
                brandId: "995d6f97b4f676380c69bac9"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle minimum valid name (2 characters)", () => {
            const result = productSchema.safeParse({
                name: "PC",
                price: 500,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "computers"
            });

            expect(result.success).toBe(true);
        });

        test("should handle maximum valid shortDescription (255 characters)", () => {
            const maxShortDesc = "A".repeat(255);
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                shortDescription: maxShortDesc,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(true);
        });

        test("should handle null optional fields gracefully", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                description: null,
                shortDescription: null,
                thumbnail: null,
                images: null,
                attributes: null,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(false); // null is not the same as undefined for optional fields
        });

        test("should handle undefined optional fields gracefully", () => {
            const result = productSchema.safeParse({
                name: "Product",
                price: 10,
                description: undefined,
                shortDescription: undefined,
                thumbnail: undefined,
                images: undefined,
                attributes: undefined,
                active: true,
                brandId: "995d6f97b4f676380c69bac9",
                category: "cat1"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = productSchema.safeParse({
                name: "Laptop",
                price: 999,
                description: "Gaming laptop",
                active: true,
                brandId: "534e59cb9130eadec4cbfbea",
                category: "computers"
            });

            if (result.success) {
                const name: string = result.data.name;
                const price: number = result.data.price;
                const description: string | undefined = result.data.description;
                const active: boolean = result.data.active;
                const brandId: string = result.data.brandId;
                const category: string = result.data.category;

                expect(typeof name).toBe('string');
                expect(typeof price).toBe('number');
                expect(typeof active).toBe('boolean');
                expect(typeof brandId).toBe('string');
                expect(typeof category).toBe('string');
            }
        });
    });

    describe('Real-world product examples', () => {
        test("should accept common hardware products", () => {
            const products = [
                {
                    name: "RTX 4090 Graphics Card",
                    price: 1599.99,
                    description: "High-end graphics card for gaming and professional work",
                    active: true,
                    brandId: "d7b7e3e8840c0348e483677a",
                    category: "graphics-cards"
                },
                {
                    name: "Intel i9-13900K",
                    price: 589.99,
                    shortDescription: "Latest generation Intel processor",
                    active: true,
                    brandId: "8a866477847a2e162058dc9b",
                    category: "processors"
                }
            ];

            products.forEach(product => {
                const result = productSchema.safeParse(product);
                expect(result.success).toBe(true);
            });
        });
    });
});