import type {Config} from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "jsdom",

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "\\.(css|scss|sass)$": "identity-obj-proxy",
    },

    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                useESM: true,
            },
        ],
    },

    collectCoverage: true,
    coverageDirectory: "coverage",
};

export default config;
