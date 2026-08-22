import { defaultCache } from "@serwist/next/worker";
import { NetworkOnly, Serwist } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";
import { ExpirationPlugin } from "@serwist/expiration";

declare global {
  // Define the interface locally so TypeScript understands the global worker context
  interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
    readonly __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }

  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Historical rates for the chart — component already caches per-date
    // in localStorage; this catches new date requests when offline/flaky.
    {
      matcher: /\/api\/history/,
      handler: new StaleWhileRevalidate({
        cacheName: "rates-history",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24,
          }),
        ],
      }),
    },
    // Geo lookup — useDetectedCurrency already caches for 1hr via cache.ts;
    // this covers the first-ever visit and cache-expiry refetches offline.
    {
      matcher: /\/api\/geo/,
      handler: new NetworkFirst({
        cacheName: "geo-cache",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 60 * 60 }),
        ],
      }),
    },
    // Satoshi font files — immutable, cache forever
    {
      matcher: /\.(?:woff2?|otf|ttf)$/,
      handler: new CacheFirst({
        cacheName: "fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          }),
        ],
      }),
    },
    { matcher: /^\/ph\//, handler: new NetworkOnly() },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
