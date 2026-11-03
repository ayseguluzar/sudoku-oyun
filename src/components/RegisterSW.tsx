"use client";

import { useEffect } from "react";

async function clearServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
}

export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    void (async () => {
      try {
        // Eski cache/SW yüzünden "hazırlanıyor"da kalmayı önle
        await clearServiceWorkers();
        if (process.env.NODE_ENV === "production") {
          await navigator.serviceWorker.register("/sw.js?v=3");
        }
      } catch {
        // sessiz
      }
    })();
  }, []);

  return null;
}
