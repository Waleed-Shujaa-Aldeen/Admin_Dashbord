/** @type {import('next').NextConfig} */
const nextConfig = {
  // This allows the dev server to accept requests from your host-only or LAN IP
  allowedDevOrigins: ["192.168.56.1", "localhost:3000"],
};

export default nextConfig;
