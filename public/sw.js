// Retire the previously deployed next-pwa worker at its original URL.
// Keep this endpoint available for returning users; never register it for new users.
const legacyRuntimeCaches = new Set([
  "start-url",
  "google-fonts-webfonts",
  "google-fonts-stylesheets",
  "static-font-assets",
  "static-image-assets",
  "next-image",
  "static-audio-assets",
  "static-video-assets",
  "static-js-assets",
  "static-style-assets",
  "next-data",
  "static-data-assets",
  "apis",
  "others",
  "cross-origin",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const names = await caches.keys();
        await Promise.allSettled(
          names
            .filter(
              (name) =>
                legacyRuntimeCaches.has(name) ||
                (name.startsWith("workbox-precache-") &&
                  name.endsWith(self.registration.scope)),
            )
            .map((name) => caches.delete(name)),
        );
      } finally {
        // Stop old fetch interception without reloading an in-progress user action.
        try {
          await self.clients.claim();
        } finally {
          await self.registration.unregister();
        }
      }
    })(),
  );
});
