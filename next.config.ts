import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    // Serveur autonome construit par CircleCI et déposé sur le VPS, sans npm install (deploy/README.md)
    output: "standalone",
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: "https", hostname: "img.clerk.com" },
            { protocol: "https", hostname: "picsum.photos" },
        ]
    },
    outputFileTracingRoot: __dirname,
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb'
        }
    }
};

export default nextConfig;