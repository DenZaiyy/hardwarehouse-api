import {describe, expect, test} from '@jest/globals';
import {transactionSchema} from "@/lib/validators/transactionSchema";

describe('transactionSchema', () => {
    describe('Valid inputs', () => {
        test("should accept transaction with valid inputs (type true - stock in)", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 75,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe(true);
                expect(result.data.oldQtt).toBe(50);
                expect(result.data.newQtt).toBe(75);
                expect(result.data.productId).toBe("product-123");
            }
        });

        test("should accept transaction with valid inputs (type false - stock out)", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: 75,
                newQtt: 50,
                productId: "product-456"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe(false);
                expect(result.data.oldQtt).toBe(75);
                expect(result.data.newQtt).toBe(50);
            }
        });

        test("should accept transaction with zero quantities", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 0,
                newQtt: 0,
                productId: "product-789"
            });

            expect(result.success).toBe(true);
        });

        test("should accept quantities as strings (coerced to numbers)", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: "100",
                newQtt: "75",
                productId: "product-string"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(100);
                expect(result.data.newQtt).toBe(75);
                expect(typeof result.data.oldQtt).toBe('number');
                expect(typeof result.data.newQtt).toBe('number');
            }
        });

        test("should accept large quantities", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 10000,
                newQtt: 15000,
                productId: "product-bulk"
            });

            expect(result.success).toBe(true);
        });

        test("should accept decimal quantities (coerced to numbers)", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: "25.5",
                newQtt: "30.75",
                productId: "product-decimal"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(25.5);
                expect(result.data.newQtt).toBe(30.75);
            }
        });
    });

    describe('Invalid inputs - type', () => {
        test("should reject missing type", () => {
            const result = transactionSchema.safeParse({
                oldQtt: 50,
                newQtt: 75,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-boolean type", () => {
            const result = transactionSchema.safeParse({
                type: "true",
                oldQtt: 50,
                newQtt: 75,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject null type", () => {
            const result = transactionSchema.safeParse({
                type: null,
                oldQtt: 50,
                newQtt: 75,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject numeric type", () => {
            const result = transactionSchema.safeParse({
                type: 1,
                oldQtt: 50,
                newQtt: 75,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - oldQtt', () => {
        test("should reject negative oldQtt", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: -10,
                newQtt: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('oldQtt') &&
                    issue.message.includes('positive')
                )).toBe(true);
            }
        });

        test("should reject non-numeric oldQtt string", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: "not-a-number",
                newQtt: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing oldQtt", () => {
            const result = transactionSchema.safeParse({
                type: true,
                newQtt: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null oldQtt to 0", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: null,
                newQtt: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(0);
            }
        });
    });

    describe('Invalid inputs - newQtt', () => {
        test("should reject negative newQtt", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: -25,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('newQtt') &&
                    issue.message.includes('positive')
                )).toBe(true);
            }
        });

        test("should reject non-numeric newQtt string", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: "invalid-number",
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing newQtt", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                productId: "product-123"
            });

            expect(result.success).toBe(false);
        });

        test("should coerce null newQtt to 0", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: null,
                productId: "product-123"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.newQtt).toBe(0);
            }
        });
    });

    describe('Invalid inputs - productId', () => {
        test("should reject empty productId", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 75,
                productId: ""
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing productId", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 75
            });

            expect(result.success).toBe(false);
        });

        test("should reject null productId", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 75,
                productId: null
            });

            expect(result.success).toBe(false);
        });

        test("should reject non-string productId", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 75,
                productId: 123
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle very small positive numbers", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 0.01,
                newQtt: 0.02,
                productId: "product-small"
            });

            expect(result.success).toBe(true);
        });

        test("should handle very large numbers", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: 999999,
                newQtt: 888888,
                productId: "product-large"
            });

            expect(result.success).toBe(true);
        });

        test("should handle scientific notation", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: "1e3",
                newQtt: "2e3",
                productId: "product-scientific"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(1000);
                expect(result.data.newQtt).toBe(2000);
            }
        });

        test("should handle same oldQtt and newQtt", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 50,
                newQtt: 50,
                productId: "product-same"
            });

            expect(result.success).toBe(true);
        });

        test("should handle UUID-like productId", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: 100,
                newQtt: 80,
                productId: "550e8400-e29b-41d4-a716-446655440000"
            });

            expect(result.success).toBe(true);
        });

        test("should handle productId with special characters", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 25,
                newQtt: 35,
                productId: "product-123_v2.0"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Type coercion behavior', () => {
        test("should coerce string numbers correctly", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: "100.5",
                newQtt: "85.25",
                productId: "product-coercion"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(100.5);
                expect(result.data.newQtt).toBe(85.25);
            }
        });

        test("should handle leading/trailing whitespace in numbers", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: " 50 ",
                newQtt: " 75 ",
                productId: "product-whitespace"
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.oldQtt).toBe(50);
                expect(result.data.newQtt).toBe(75);
            }
        });

        test("should reject mixed alphanumeric strings", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: "50abc",
                newQtt: 75,
                productId: "product-mixed"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 40,
                newQtt: 60,
                productId: "product-typed"
            });

            if (result.success) {
                const type: boolean = result.data.type;
                const oldQtt: number = result.data.oldQtt;
                const newQtt: number = result.data.newQtt;
                const productId: string = result.data.productId;

                expect(typeof type).toBe('boolean');
                expect(typeof oldQtt).toBe('number');
                expect(typeof newQtt).toBe('number');
                expect(typeof productId).toBe('string');
            }
        });

        test("should return error details on failure", () => {
            const result = transactionSchema.safeParse({
                type: "invalid",
                oldQtt: -10,
                newQtt: "not-a-number",
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
        test("should accept stock increase transaction", () => {
            const result = transactionSchema.safeParse({
                type: true, // stock in
                oldQtt: 25,
                newQtt: 50,
                productId: "product-restock"
            });

            expect(result.success).toBe(true);
        });

        test("should accept stock decrease transaction", () => {
            const result = transactionSchema.safeParse({
                type: false, // stock out
                oldQtt: 100,
                newQtt: 75,
                productId: "product-sale"
            });

            expect(result.success).toBe(true);
        });

        test("should accept inventory adjustment to zero", () => {
            const result = transactionSchema.safeParse({
                type: false,
                oldQtt: 50,
                newQtt: 0,
                productId: "product-adjustment"
            });

            expect(result.success).toBe(true);
        });

        test("should accept inventory restoration from zero", () => {
            const result = transactionSchema.safeParse({
                type: true,
                oldQtt: 0,
                newQtt: 25,
                productId: "product-restore"
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Real-world transaction examples', () => {
        test("should accept typical hardware inventory transactions", () => {
            const transactions = [
                {
                    type: true, // receiving new stock
                    oldQtt: 10,
                    newQtt: 60,
                    productId: "gpu-rtx4090-001"
                },
                {
                    type: false, // customer purchase
                    oldQtt: 50,
                    newQtt: 48,
                    productId: "cpu-i9-13900k-002"
                },
                {
                    type: false, // bulk order
                    oldQtt: 200,
                    newQtt: 150,
                    productId: "ram-ddr5-32gb-003"
                }
            ];

            transactions.forEach(transaction => {
                const result = transactionSchema.safeParse(transaction);
                expect(result.success).toBe(true);
            });
        });

        test("should accept return/refund transaction", () => {
            const result = transactionSchema.safeParse({
                type: true, // stock returned
                oldQtt: 45,
                newQtt: 46,
                productId: "returned-product-001"
            });

            expect(result.success).toBe(true);
        });
    });
});