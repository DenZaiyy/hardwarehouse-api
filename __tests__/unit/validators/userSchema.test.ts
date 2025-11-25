import {describe, expect, test} from '@jest/globals';
import {userSchema} from "@/lib/validators/userSchema";

describe('userSchema', () => {
    test("valid user object payload", () => {
        const result = userSchema.safeParse({
            firstName: "John",
            lastName: "Doe",
            username: "john.d",
            email: "john.doe@example.com",
            password: "JohnD.93270",
            passwordConfirm: "JohnD.93270",
            isAdmin: false
        });

        expect(result.success).toBe(true);
    });

    test("invalid email format", () => {
        const result = userSchema.safeParse({
            firstName: "John",
            lastName: "Doe",
            username: "john.d",
            email: "invalid-email",
            password: "JohnD.93270",
            passwordConfirm: "JohnD.93270",
            isAdmin: false
        });

        expect(result.success).toBe(false);
    });

    test("password mismatch", () => {
        const result = userSchema.safeParse({
            firstName: "John",
            lastName: "Doe",
            username: "john.d",
            email: "john.doe@example.com",
            password: "JohnD.93270",
            passwordConfirm: "DifferentPassword",
            isAdmin: false
        });

        expect(result.success).toBe(false);
    });
});