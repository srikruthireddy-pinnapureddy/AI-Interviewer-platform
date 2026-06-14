// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
// };
// export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // mammoth needs to be external (uses Node.js native modules)
  serverExternalPackages: ['mammoth'],
};

export default nextConfig;
