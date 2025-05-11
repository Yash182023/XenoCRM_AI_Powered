// next.config.mjs (or next.config.js)

// If you were using dotenv-webpack from previous step, keep that.
// import Dotenv from 'dotenv-webpack'; // If you needed this

/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack: (config) => { // If you had webpack modifications
  //   config.plugins.push(new Dotenv({ path: './.env.local' }));
  //   return config;
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '', // Keep empty string for default port (443 for https)
        pathname: '/a/**', // Allows any path starting with /a/ which is common for Google avatars
      },
      // You can add other domains here if needed in the future
    ],
  },
  // Your other Next.js config options here
};

export default nextConfig; // If using .mjs
// module.exports = nextConfig; // If using .js