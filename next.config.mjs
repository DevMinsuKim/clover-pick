import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */

const nextConfig = {
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ["@svgr/webpack"],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;
    return config;
  },
  transpilePackages: ["three"],
};

const pwaConfig = withPWA({
  dest: "public",
  buildExcludes: [/\.map$/],
  publicExcludes: ["!**/*.map"],
  disable: process.env.NODE_ENV === "development",
})(nextConfig);

export default withSentryConfig(pwaConfig, {
  org: process.env.NEXT_PUBLIC_SENTRY_ORG,
  project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
  silent: !process.env.CI,
  telemetry: false,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: {
    filesToDeleteAfterUpload: ["./.next/static/**/*.map"],
  },
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
  },
});
