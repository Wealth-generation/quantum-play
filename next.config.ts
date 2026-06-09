import type { NextConfig } from "next";

const svgrOptions = {
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            // Keep viewBox so icons scale correctly at any size.
            removeViewBox: false,
          },
        },
      },
    ],
  },
};

const nextConfig: NextConfig = {
  // ── Turbopack (Next.js 16 default) ──────────────────────────────────────────
  // Import .svg files as React components via @svgr/webpack.
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [{ loader: "@svgr/webpack", options: svgrOptions }],
        as: "*.js",
      },
    },
  },

  // ── Webpack fallback (explicit --webpack flag or older tooling) ──────────────
  webpack(config) {
    // Exclude .svg from the default Next.js file-loader so SVGR takes over.
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: RegExp }) => rule.test?.test?.(".svg"),
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: "@svgr/webpack", options: svgrOptions }],
    });

    return config;
  },
};

export default nextConfig;
