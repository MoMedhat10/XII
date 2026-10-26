import type { NextConfig } from "next"

const publicUrl = process.env.S3_PUBLIC_URL
if (!publicUrl) throw new Error("S3_PUBLIC_URL is not set")

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [new URL(`${publicUrl.replace(/\/$/, "")}/**`)],
    },
}

export default nextConfig
 