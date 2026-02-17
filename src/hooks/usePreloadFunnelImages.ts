import { useEffect } from "react";

const CRITICAL_IMAGES = [
  "/avatars/f1.webp", "/avatars/f2.webp", "/avatars/f3.webp",
  "/avatars/m1.webp", "/avatars/m2.webp", "/avatars/m3.webp",
];

// Asset imports are resolved at build time, so we preload the public ones
export const usePreloadFunnelImages = () => {
  useEffect(() => {
    const preload = () => {
      CRITICAL_IMAGES.forEach((src) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = src;
        link.type = "image/webp";
        document.head.appendChild(link);
      });
    };

    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(preload, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(preload, 300);
      return () => clearTimeout(id);
    }
  }, []);
};
