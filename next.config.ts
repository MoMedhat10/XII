import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [new URL("https://qppvakonxxmkyyednguj.supabase.co/storage/v1/object/public/xii-media/**")],
    },
}

export default nextConfig
 