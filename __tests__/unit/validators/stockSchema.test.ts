import {describe, expect, test} from '@jest/globals';
import {stockSchema} from "@/lib/validators/stockSchema";

describe('stockSchema', () => {
    describe('Valid inputs', () => {
        test("should accept stock with valid quantities and productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 10,
                quantity: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(10);
                expect(result.data.quantity).toBe(50);
                expect(result.data.productId).toBe("product-123");
            }
        });

        test("should accept stock with zero quantities", () => {
            const result = stockSchema.safeParse({
                minQuantity: 0,
                quantity: 0,
                productId: "product-456"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(0);
                expect(result.data.quantity).toBe(0);
            }
        });

        test("should accept stock with quantities as strings (coerced to numbers)", () => {
            const result = stockSchema.safeParse({
                minQuantity: "5",
                quantity: "25",
                productId: "product-789"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(5);
                expect(result.data.quantity).toBe(25);
                expect(typeof result.data.minQuantity).toBe('number');
                expect(typeof result.data.quantity).toBe('number');
            }
        });

        test("should accept stock with large quantities", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1000,
                quantity: 50000,
                productId: "product-bulk-001"
            });

            expect(result.success).toBe(true);
        });

        test("should accept stock with decimal quantities (coerced to numbers)", () => {
            const result = stockSchema.safeParse({
                minQuantity: "5.5",
                quantity: "25.75",
                productId: "product-decimal"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(5.5);
                expect(result.data.quantity).toBe(25.75);
            }
        });
    });

    describe('Invalid inputs - minQuantity', () => {
        test("should reject negative minQuantity", () => {
            const result = stockSchema.safeParse({
                minQuantity: -5,
                quantity: 10,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('minQuantity') &&
                    issue.message.includes('positive')
                )).toBe(true);
            }
        });

        test("should reject non-numeric minQuantity string", () => {
            const result = stockSchema.safeParse({
                minQuantity: "not-a-number",
                quantity: 10,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing minQuantity", () => {
            const result = stockSchema.safeParse({
                quantity: 10,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null minQuantity to 0", () => {
            const result = stockSchema.safeParse({
                minQuantity: null,
                quantity: 10,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(0);
            }
        });
    });

    describe('Invalid inputs - quantity', () => {
        test("should reject negative quantity", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: -10,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('quantity') &&
                    issue.message.includes('négative')
                )).toBe(true);
            }
        });

        test("should reject non-numeric quantity string", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: "invalid-number",
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing quantity", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null quantity to 0", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: null,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(0);
            }
        });
    });

    describe('Invalid inputs - productId', () => {
        test("should reject empty productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 10,
                productId: ""
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 10
            });

            expect(result.success).toBe(false);
        });

        test("should reject null productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 10,
                productId: null
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-string productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 10,
                productId: 123
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle very small positive numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: 0.01,
                quantity: 0.5,
                productId: "product-small"
            });

            expect(result.success).toBe(true);
        });

        test("should handle very large numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: 999999,
                quantity: 9999999,
                productId: "product-large"
            });

            expect(result.success).toBe(true);
        });

        test("should handle scientific notation", () => {
            const result = stockSchema.safeParse({
                minQuantity: "1e2",
                quantity: "5e3",
                productId: "product-scientific"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(100);
                expect(result.data.quantity).toBe(5000);
            }
        });

        test("should handle quantity lower than minQuantity (business logic validation)", () => {
            // Note: This test checks if the schema accepts it (it should, as business logic validation is separate)
            const result = stockSchema.safeParse({
                minQuantity: 50,
                quantity: 10,
                productId: "product-low-stock"
            });

            expect(result.success).toBe(true);
        });

        test("should handle UUID-like productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1,
                quantity: 5,
                productId: "550e8400-e29b-41d4-a716-446655440000"
            });

            expect(result.success).toBe(true);
        });

        test("should handle productId with special characters", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1,
                quantity: 5,
                productId: "product-123_v2.0"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Type coercion behavior', () => {
        test("should coerce string numbers correctly", () => {
            const result = stockSchema.safeParse({
                minQuantity: "10.5",
                quantity: "25.75",
                productId: "product-coercion"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(10.5);
                expect(result.data.quantity).toBe(25.75);
            }
        });

        test("should handle leading/trailing whitespace in numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: " 10 ",
                quantity: " 25 ",
                productId: "product-whitespace"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(10);
                expect(result.data.quantity).toBe(25);
            }
        });

        test("should reject mixed alphanumeric strings", () => {
            const result = stockSchema.safeParse({
                minQuantity: "10abc",
                quantity: 25,
                productId: "product-mixed"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 20,
                productId: "product-typed"
            });

            if (result.success) {
                const minQuantity: number = result.data.minQuantity;
                const quantity: number = result.data.quantity;
                const productId: string = result.data.productId;

                expect(typeof minQuantity).toBe('number');
                expect(typeof quantity).toBe('number');
                expect(typeof productId).toBe('string');
            }
        });

        test("should return error details on failure", () => {
            const result = stockSchema.safeParse({
                minQuantity: -5,
                quantity: "not-a-number",
                productId: ""
            });

            if (!result.success) {
                expect(result.error.issues).toBeInstanceOf(Array);
                expect(result.error.issues.length).toBeGreaterThan(0);
                expect(result.error.issues[0]).toHaveProperty('message');
                expect(result.error.issues[0]).toHaveProperty('path');
            }
        });
    });

    describe('Real-world stock examples', () => {
        test("should accept typical hardware stock entries", () => {
            const stockEntries = [
                {
                    minQuantity: 5,
                    quantity: 100,
                    productId: "gpu-rtx4090-001"
                },
                {
                    minQuantity: 10,
                    quantity: 250,
                    productId: "cpu-i9-13900k-002"
                },
                {
                    minQuantity: 20,
                    quantity: 500,
                    productId: "ram-ddr5-32gb-003"
                }
            ];

            stockEntries.forEach(stock => {
                const result = stockSchema.safeParse(stock);
                expect(result.success).toBe(true);
            });
        });

        test("should accept out-of-stock items", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1,
                quantity: 0,
                productId: "discontinued-product-001"
            });

            expect(result.success).toBe(true);
        });

        test("should accept high-demand products with high minimums", () => {
            const result = stockSchema.safeParse({
                minQuantity: 100,
                quantity: 1000,
                productId: "popular-product-001"
            });

            expect(result.success).toBe(true);
        });
    });
});