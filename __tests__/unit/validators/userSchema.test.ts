import {describe, expect, test} from '@jest/globals';
import {userSchema} from "@/lib/validators/userSchema";

describe('userSchema', () => {
    describe('Valid inputs', () => {
        test("should accept valid user object payload", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "john.doe",
                email: "john.doe@example.com",
                password: "JohnD.93270",
                passwordConfirm: "JohnD.93270",
                isAdmin: false
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.firstName).toBe("John");
                expect(result.data.lastName).toBe("Doe");
                expect(result.data.username).toBe("john.doe");
                expect(result.data.email).toBe("john.doe@example.com");
                expect(result.data.isAdmin).toBe(false);
            }
        });

        test("should accept admin user", () => {
            const result = userSchema.safeParse({
                firstName: "Jane",
                lastName: "Admin",
                username: "jane.admin",
                email: "jane@admin.com",
                password: "AdminPass123!",
                passwordConfirm: "AdminPass123!",
                isAdmin: true
            });

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.isAdmin).toBe(true);
            }
        });

        test("should accept user with minimum field lengths", () => {
            const result = userSchema.safeParse({
                firstName: "Jo",
                lastName: "Do",
                username: "johnd",
                email: "j@d.co",
                password: "12345678",
                passwordConfirm: "12345678",
                isAdmin: false
            });

            expect(result.success).toBe(true);
        });

        test("should accept user with special characters in names", () => {
            const result = userSchema.safeParse({
                firstName: "Jean-Pierre",
                lastName: "O'Connor",
                username: "jpier",
                email: "jean-pierre@example.com",
                password: "SecurePass123",
                passwordConfirm: "SecurePass123",
                isAdmin: false
            });

            expect(result.success).toBe(true);
        });

        test("should accept various valid email formats", () => {
            const validEmails = [
                "user@domain.com",
                "user.name@domain.com",
                "user+tag@domain.co.uk",
                "user123@domain-name.org",
                "test@subdomain.domain.com"
            ];

            validEmails.forEach(email => {
                const result = userSchema.safeParse({
                    firstName: "Test",
                    lastName: "User",
                    username: "testuser",
                    email: email,
                    password: "ValidPass123",
                    passwordConfirm: "ValidPass123",
                    isAdmin: false
                });
                expect(result.success).toBe(true);
            });
        });

        test("should accept complex passwords", () => {
            const result = userSchema.safeParse({
                firstName: "Secure",
                lastName: "User",
                username: "secureuser",
                email: "secure@example.com",
                password: "MyVerySecureP@ssw0rd!",
                passwordConfirm: "MyVerySecureP@ssw0rd!",
                isAdmin: false
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Invalid inputs - First Name', () => {
        test("should reject firstName with only 1 character", () => {
            const result = userSchema.safeParse({
                firstName: "J",
                lastName: "Doe",
                username: "jdoe",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('firstName') &&
                    issue.message.includes('au moins 2 caractères')
                )).toBe(true);
            }
        });

        test("should reject empty firstName", () => {
            const result = userSchema.safeParse({
                firstName: "",
                lastName: "Doe",
                username: "jdoe",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing firstName", () => {
            const result = userSchema.safeParse({
                lastName: "Doe",
                username: "jdoe",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Last Name', () => {
        test("should reject lastName with only 1 character", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "D",
                username: "jdoe",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('lastName') &&
                    issue.message.includes('au moins 2 caractères')
                )).toBe(true);
            }
        });

        test("should reject empty lastName", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "",
                username: "jdoe",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Username', () => {
        test("should reject username with less than 5 characters", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "jd",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('username') &&
                    issue.message.includes('au moins 5 caractères')
                )).toBe(true);
            }
        });

        test("should reject empty username", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "",
                email: "j@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Email', () => {
        test("should reject invalid email format", () => {
            const invalidEmails = [
                "invalid-email",
                "@example.com",
                "user@",
                "user.example.com",
                "user..name@example.com",
                "user @example.com"
            ];

            invalidEmails.forEach(email => {
                const result = userSchema.safeParse({
                    firstName: "John",
                    lastName: "Doe",
                    username: "johndoe",
                    email: email,
                    password: "Password123",
                    passwordConfirm: "Password123",
                    isAdmin: false
                });
                expect(result.success).toBe(false);
            });
        });

        test("should reject empty email", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Password', () => {
        test("should reject password with less than 8 characters", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "Pass123",
                passwordConfirm: "Pass123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('password') &&
                    issue.message.includes('minimum 8 caractères')
                )).toBe(true);
            }
        });

        test("should reject empty password", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "",
                passwordConfirm: "",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Password Confirmation', () => {
        test("should reject password mismatch", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john.doe@example.com",
                password: "JohnD.93270",
                passwordConfirm: "DifferentPassword",
                isAdmin: false
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.some(issue =>
                    issue.path.includes('passwordConfirm') &&
                    issue.message.includes('ne correspondent pas')
                )).toBe(true);
            }
        });

        test("should reject passwordConfirm with less than 8 characters", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "Password123",
                passwordConfirm: "Pass123",
                isAdmin: false
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Invalid inputs - Admin Flag', () => {
        test("should reject non-boolean isAdmin", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: "false"
            });

            expect(result.success).toBe(false);
        });

        test("should reject missing isAdmin", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "Password123",
                passwordConfirm: "Password123"
            });

            expect(result.success).toBe(false);
        });
    });

    describe('Edge cases', () => {
        test("should handle Unicode characters in names", () => {
            const result = userSchema.safeParse({
                firstName: "José",
                lastName: "François",
                username: "josefrancois",
                email: "jose@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: false
            });

            expect(result.success).toBe(true);
        });

        test("should handle null values gracefully", () => {
            const result = userSchema.safeParse({
                firstName: null,
                lastName: null,
                username: null,
                email: null,
                password: null,
                passwordConfirm: null,
                isAdmin: null
            });

            expect(result.success).toBe(false);
        });

        test("should handle undefined values gracefully", () => {
            const result = userSchema.safeParse({});

            expect(result.success).toBe(false);
        });
    });

    describe('Type safety', () => {
        test("should return correctly typed data on success", () => {
            const result = userSchema.safeParse({
                firstName: "John",
                lastName: "Doe",
                username: "johndoe",
                email: "john@example.com",
                password: "Password123",
                passwordConfirm: "Password123",
                isAdmin: true
            });

            if (result.success) {
                const firstName: string = result.data.firstName;
                const lastName: string = result.data.lastName;
                const username: string = result.data.username;
                const email: string = result.data.email;
                const password: string = result.data.password;
                const passwordConfirm: string = result.data.passwordConfirm;
                const isAdmin: boolean = result.data.isAdmin;

                expect(typeof firstName).toBe('string');
                expect(typeof lastName).toBe('string');
                expect(typeof username).toBe('string');
                expect(typeof email).toBe('string');
                expect(typeof password).toBe('string');
                expect(typeof passwordConfirm).toBe('string');
                expect(typeof isAdmin).toBe('boolean');
            }
        });

        test("should return error details on failure", () => {
            const result = userSchema.safeParse({
                firstName: "A",
                lastName: "B",
                username: "ab",
                email: "invalid",
                password: "short",
                passwordConfirm: "different",
                isAdmin: "not-boolean"
            });

            if (!result.success) {
                expect(result.error.issues).toBeInstanceOf(Array);
                expect(result.error.issues.length).toBeGreaterThan(0);
                expect(result.error.issues[0]).toHaveProperty('message');
                expect(result.error.issues[0]).toHaveProperty('path');
            }
        });
    });
});