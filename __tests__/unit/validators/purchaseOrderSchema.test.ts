import {describe, expect, test} from '@jest/globals';
import {purchaseOrderSchema} from "@/lib/validators/purchaseOrderSchema";

describe('purchaseOrderSchema', () => {
    describe('Valid inputs', () => {
        test("should accept purchase order with positive quantity and valid productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(10);
                expect(result.data.productId).toBe("0f3efc8447d5cc5b8dc71fc3");
            }
        });

        test("should accept quantity as string (coerced to number)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "25",
                productId: "a49d44e0fe1acaa21e653581"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(25);
                expect(typeof result.data.quantity).toBe('number');
            }
        });

        test("should accept large quantities", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10000,
                productId: "357a9415926073846b8648d6"
            });

            expect(result.success).toBe(true);
        });

        test("should reject decimal quantities (quantity is an integer in the DB)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "15.5",
                productId: "7096a15860e3dfa96c70d951"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-integer positive quantities", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0.1,
                productId: "376de78adbd43cb156da7607"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - quantity', () => {
        test("should reject zero quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('quantity') &&
                    issue.message.includes('positive')
                )).toBe(true);
            }
        });

        test("should reject negative quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: -5,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('quantity') &&
                    issue.message.includes('positive')
                )).toBe(true);
            }
        });

        test("should reject non-numeric quantity string", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "not-a-number",
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should reject null quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: null,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });

        test("should reject undefined quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: undefined,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - productId', () => {
        test("should reject empty productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: ""
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10
            });

            expect(result.success).toBe(false);
        });

        test("should reject null productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: null
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-string productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: 123
            });

            expect(result.success).toBe(false);
        });

        test("should reject undefined productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: undefined
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle very large quantities", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 999999,
                productId: "a37d0cab3b74bbedabf12b72"
            });

            expect(result.success).toBe(true);
        });

        test("should handle scientific notation", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "1e3",
                productId: "206b4067d193df1039b8edd9"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(1000);
            }
        });

        test("should reject UUID-like productId (not a valid Mongo ObjectId)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 5,
                productId: "550e8400-e29b-41d4-a716-446655440000"
            });

            expect(result.success).toBe(false);
        });

        test("should reject productId with special characters (not a valid Mongo ObjectId)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 15,
                productId: "product-123_v2.0"
            });

            expect(result.success).toBe(false);
        });

        test("should reject an overly long productId (not a valid Mongo ObjectId)", () => {
            const longProductId = "b7a60ff3a94ea791493dfd03" + "x".repeat(100);
            const result = purchaseOrderSchema.safeParse({
                quantity: 5,
                productId: longProductId
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type coercion behavior', () => {
        test("should coerce string numbers correctly", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "50",
                productId: "836d41e282636db48ff13b1d"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(50);
            }
        });

        test("should handle leading/trailing whitespace in numbers", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: " 25 ",
                productId: "30852d6eab16df04da99758d"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(25);
            }
        });

        test("should reject mixed alphanumeric strings", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "25abc",
                productId: "80e3e2d3c35d502147309d11"
            });

            expect(result.success).toBe(false);
        });

        test("should reject empty string quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "",
                productId: "ce6f1379917fb777504848ca"
            });

            expect(result.success).toBe(false);
        });

        test("should accept boolean values for quantity (coerced to number)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: true,
                productId: "70255aa9e73f8d5fcc6ef3b6"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(1);
            }
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 30,
                productId: "607234302c41e91325147cf6"
            });

            if (result.success) {
                const quantity: number = result.data.quantity;
                const productId: string = result.data.productId;

                expect(typeof quantity).toBe('number');
                expect(typeof productId).toBe('string');
            }
        });

        test("should return error details on failure", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: -10,
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

    describe('Business logic scenarios', () => {
        test("should accept small restocking order", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 5,
                productId: "b568f433491ab396e4c3aa84"
            });

            expect(result.success).toBe(true);
        });

        test("should accept bulk purchase order", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 1000,
                productId: "68a78702cc93297fdcc29d53"
            });

            expect(result.success).toBe(true);
        });

        test("should accept emergency restocking", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 1,
                productId: "90ec7970d019b80fc94e5cee"
            });

            expect(result.success).toBe(true);
        });

        test("should accept seasonal preparation order", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 500,
                productId: "7757743f8c1684fe0292e40b"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Real-world purchase order examples', () => {
        test("should accept typical hardware purchase orders", () => {
            const purchaseOrders = [
                {
                    quantity: 50,
                    productId: "3e3dfa7391082eeb22dbd463"
                },
                {
                    quantity: 100,
                    productId: "74617a8588bb442c5e862991"
                },
                {
                    quantity: 200,
                    productId: "9fee17c42cedbefbf90a2b04"
                },
                {
                    quantity: 25,
                    productId: "198c6c267fdf0ac0bbc6d8c6"
                }
            ];

            purchaseOrders.forEach(order => {
                const result = purchaseOrderSchema.safeParse(order);
                expect(result.success).toBe(true);
            });
        });

        test("should accept high-demand product orders", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 300,
                productId: "8c8de4858b231671cfc4af2a"
            });

            expect(result.success).toBe(true);
        });

        test("should accept premium product small orders", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 3,
                productId: "dc350c6942bf5e2767ee4117"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Error handling', () => {
        test("should provide meaningful error for zero quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0,
                productId: "0f3efc8447d5cc5b8dc71fc3"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                const quantityError = result.error.issues.find(issue => 
                    issue.path.includes('quantity')
                );
                expect(quantityError?.message).toBe('La quantité doit être positive');
            }
        });

        test("should handle multiple validation errors", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: -5,
                productId: ""
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(1);
            }
        });
    });
});