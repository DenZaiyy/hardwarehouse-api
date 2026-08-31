import {describe, expect, test} from '@jest/globals';
import {stockSchema} from "@/lib/validators/stockSchema";

describe('stockSchema', () => {
    describe('Valid inputs', () => {
        test("should accept stock with valid quantities and productId", () => {
            const result = stockSchema.safeParse({
                minQuantity: 10,
                quantity: 50,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(10);
                expect(result.data.quantity).toBe(50);
                expect(result.data.productId).toBe("0f3efc8447d5cc5b8dc71fc3");
            }
        });

        test("should accept stock with zero quantities", () => {
            const result = stockSchema.safeParse({
                minQuantity: 0,
                quantity: 0,
                productId: "a49d44e0fe1acaa21e653581"
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
                productId: "9f41e7a50c9310eaac011a43"
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
                productId: "d48d0670514a63414bb29a35"
            });

            expect(result.success).toBe(true);
        });

        test("should reject decimal quantities (quantity/minQuantity are integers in the DB)", () => {
            const result = stockSchema.safeParse({
                minQuantity: "5.5",
                quantity: "25.75",
                productId: "7096a15860e3dfa96c70d951"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - minQuantity', () => {
        test("should reject negative minQuantity", () => {
            const result = stockSchema.safeParse({
                minQuantity: -5,
                quantity: 10,
                productId: "0f3efc8447d5cc5b8dc71fc3"
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
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing minQuantity", () => {
            const result = stockSchema.safeParse({
                quantity: 10,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null minQuantity to 0", () => {
            const result = stockSchema.safeParse({
                minQuantity: null,
                quantity: 10,
                productId: "0f3efc8447d5cc5b8dc71fc3"
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
                productId: "0f3efc8447d5cc5b8dc71fc3"
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
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing quantity", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null quantity to 0", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: null,
                productId: "0f3efc8447d5cc5b8dc71fc3"
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
        test("should reject non-integer positive numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: 0.01,
                quantity: 0.5,
                productId: "376de78adbd43cb156da7607"
            });

            expect(result.success).toBe(false);
        });

        test("should handle very large numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: 999999,
                quantity: 9999999,
                productId: "a37d0cab3b74bbedabf12b72"
            });

            expect(result.success).toBe(true);
        });

        test("should handle scientific notation", () => {
            const result = stockSchema.safeParse({
                minQuantity: "1e2",
                quantity: "5e3",
                productId: "206b4067d193df1039b8edd9"
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
                productId: "abd4d72605de7fa738e85642"
            });

            expect(result.success).toBe(true);
        });

        test("should reject UUID-like productId (not a valid Mongo ObjectId)", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1,
                quantity: 5,
                productId: "550e8400-e29b-41d4-a716-446655440000"
            });

            expect(result.success).toBe(false);
        });

        test("should reject productId with special characters (not a valid Mongo ObjectId)", () => {
            const result = stockSchema.safeParse({
                minQuantity: 1,
                quantity: 5,
                productId: "product-123_v2.0"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type coercion behavior', () => {
        test("should coerce string numbers correctly", () => {
            const result = stockSchema.safeParse({
                minQuantity: "10",
                quantity: "25",
                productId: "836d41e282636db48ff13b1d"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.minQuantity).toBe(10);
                expect(result.data.quantity).toBe(25);
            }
        });

        test("should handle leading/trailing whitespace in numbers", () => {
            const result = stockSchema.safeParse({
                minQuantity: " 10 ",
                quantity: " 25 ",
                productId: "30852d6eab16df04da99758d"
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
                productId: "80e3e2d3c35d502147309d11"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = stockSchema.safeParse({
                minQuantity: 5,
                quantity: 20,
                productId: "607234302c41e91325147cf6"
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
                    productId: "3e3dfa7391082eeb22dbd463"
                },
                {
                    minQuantity: 10,
                    quantity: 250,
                    productId: "74617a8588bb442c5e862991"
                },
                {
                    minQuantity: 20,
                    quantity: 500,
                    productId: "9fee17c42cedbefbf90a2b04"
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
                productId: "41d30bbe9a21a7f2634a9aca"
            });

            expect(result.success).toBe(true);
        });

        test("should accept high-demand products with high minimums", () => {
            const result = stockSchema.safeParse({
                minQuantity: 100,
                quantity: 1000,
                productId: "cd0070549d968738add3f42c"
            });

            expect(result.success).toBe(true);
        });
    });
});