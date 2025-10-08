import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: "https", hostname: "img.clerk.com" }
        ]
    },
    outputFileTracingRoot: __dirname,
};

export default nextConfig;
