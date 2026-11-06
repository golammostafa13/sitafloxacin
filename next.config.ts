import type { NextConfig } from "next";

// Covers live in a Supabase project's public Storage bucket. Any project is
// allowed, so switching SUPABASE_URL never needs a server restart for images.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
