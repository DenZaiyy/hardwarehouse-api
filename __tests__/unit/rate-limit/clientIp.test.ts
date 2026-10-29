/**
 * @jest-environment node
 */
// Les en-têtes sont ceux que Nginx transmet à l'API sur le VPS (proxy_set_header X-Real-IP $remote_addr)
import {describe, expect, test} from '@jest/globals';
import {NextRequest} from "next/server";
import {clientIp} from "@/lib/rate-limit";

const request = (headers: Record<string, string>) =>
    new NextRequest("https://api.example.com/api/v1/products", {method: "POST", headers});

describe('clientIp', () => {
    test("prend l'adresse que Nginx place dans X-Real-IP", () => {
        expect(clientIp(request({"x-real-ip": "203.0.113.7"}))).toBe("203.0.113.7");
    });

    test("ignore X-Forwarded-For, dont le client choisit le début", () => {
        expect(clientIp(request({"x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1, 203.0.113.7"})))
            .toBe("203.0.113.7");
        expect(clientIp(request({"x-forwarded-for": "198.51.100.1"}))).toBe("127.0.0.1");
    });

    test("regroupe sous 127.0.0.1 les appels qui ne passent pas par Nginx", () => {
        expect(clientIp(request({}))).toBe("127.0.0.1");
        expect(clientIp(request({"x-real-ip": ""}))).toBe("127.0.0.1");
    });
});
