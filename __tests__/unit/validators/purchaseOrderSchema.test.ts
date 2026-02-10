import {describe, expect, test} from '@jest/globals';
import {purchaseOrderSchema} from "@/lib/validators/purchaseOrderSchema";

describe('purchaseOrderSchema', () => {
    describe('Valid inputs', () => {
        test("should accept purchase order with positive quantity and valid productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 10,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(10);
                expect(result.data.productId).toBe("product-123");
            }
        });

        test("should accept quantity as string (coerced to number)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "25",
                productId: "product-456"
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
                productId: "product-bulk"
            });

            expect(result.success).toBe(true);
        });

        test("should accept decimal quantities (coerced to numbers)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "15.5",
                productId: "product-decimal"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(15.5);
            }
        });

        test("should accept very small positive quantities", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0.1,
                productId: "product-small"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - quantity', () => {
        test("should reject zero quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0,
                productId: "product-123"
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
                productId: "product-123"
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
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject null quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: null,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject undefined quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: undefined,
                productId: "product-123"
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
                productId: "product-large"
            });

            expect(result.success).toBe(true);
        });

        test("should handle scientific notation", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "1e3",
                productId: "product-scientific"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(1000);
            }
        });

        test("should handle UUID-like productId", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 5,
                productId: "550e8400-e29b-41d4-a716-446655440000"
            });

            expect(result.success).toBe(true);
        });

        test("should handle productId with special characters", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 15,
                productId: "product-123_v2.0"
            });

            expect(result.success).toBe(true);
        });

        test("should handle very long productId", () => {
            const longProductId = "product-" + "x".repeat(100);
            const result = purchaseOrderSchema.safeParse({
                quantity: 5,
                productId: longProductId
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Type coercion behavior', () => {
        test("should coerce string numbers correctly", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "50.75",
                productId: "product-coercion"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(50.75);
            }
        });

        test("should handle leading/trailing whitespace in numbers", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: " 25 ",
                productId: "product-whitespace"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.quantity).toBe(25);
            }
        });

        test("should reject mixed alphanumeric strings", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "25abc",
                productId: "product-mixed"
            });

            expect(result.success).toBe(false);
        });

        test("should reject empty string quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: "",
                productId: "product-empty"
            });

            expect(result.success).toBe(false);
        });

        test("should accept boolean values for quantity (coerced to number)", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: true,
                productId: "product-boolean"
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
                productId: "product-typed"
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
                productId: "low-stock-product"
            });

            expect(result.success).toBe(true);
        });

        test("should accept bulk purchase order", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 1000,
                productId: "bulk-order-product"
            });

            expect(result.success).toBe(true);
        });

        test("should accept emergency restocking", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 1,
                productId: "out-of-stock-product"
            });

            expect(result.success).toBe(true);
        });

        test("should accept seasonal preparation order", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 500,
                productId: "seasonal-product"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Real-world purchase order examples', () => {
        test("should accept typical hardware purchase orders", () => {
            const purchaseOrders = [
                {
                    quantity: 50,
                    productId: "gpu-rtx4090-001"
                },
                {
                    quantity: 100,
                    productId: "cpu-i9-13900k-002"
                },
                {
                    quantity: 200,
                    productId: "ram-ddr5-32gb-003"
                },
                {
                    quantity: 25,
                    productId: "motherboard-z790-004"
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
                productId: "popular-gaming-mouse"
            });

            expect(result.success).toBe(true);
        });

        test("should accept premium product small orders", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 3,
                productId: "premium-workstation-gpu"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Error handling', () => {
        test("should provide meaningful error for zero quantity", () => {
            const result = purchaseOrderSchema.safeParse({
                quantity: 0,
                productId: "product-123"
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