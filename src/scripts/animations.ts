import { animate, inView, stagger } from "motion";

export function initMotionAnimations() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ease = [0.16, 1, 0.3, 1] as const;
  const header = document.querySelector<HTMLElement>('[data-motion="header"]');

  if (header && header.dataset.animated !== "true") {
    header.dataset.animated = "true";
    animate(header, { opacity: 1, y: 0 }, { duration: 0.75, ease });
  }

  const hero = document.querySelector<HTMLElement>('[data-motion="hero"]');
  if (hero && hero.dataset.animated !== "true") {
    hero.dataset.animated = "true";
    const items = hero.querySelectorAll<HTMLElement>("[data-motion-hero-item]");
    const media = hero.querySelector<HTMLElement>("[data-motion-hero-media]");
    if (items.length) {
      animate(
        items,
        { opacity: 1, y: 0 },
        { duration: 0.85, delay: stagger(0.09, { startDelay: 0.12 }), ease },
      );
    }
    if (media) {
      animate(
        media,
        { opacity: 1, y: 0, scale: 1 },
        { duration: 1.05, delay: 0.24, ease },
      );
    }
  }

  document
    .querySelectorAll<HTMLElement>(
      '[data-motion="heading"], [data-motion="item"], [data-motion="media"]',
    )
    .forEach((element) => {
      if (element.dataset.motionBound === "true") return;
      element.dataset.motionBound = "true";
      inView(
        element,
        () => {
          animate(
            element,
            { opacity: 1, y: 0, scale: 1 },
            { duration: 0.8, ease },
          );
        },
        { amount: 0.16, margin: "0px 0px -60px 0px" },
      );
    });
}
