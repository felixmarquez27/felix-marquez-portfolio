import { animate, inView, stagger } from "motion";

function animateContents(element: HTMLElement, ease: readonly number[]) {
  const contents = Array.from(element.children) as HTMLElement[];

  if (!contents.length) return;

  animate(
    contents,
    { opacity: 1, y: 0 },
    { duration: 0.58, delay: stagger(0.045), ease },
  );
}

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
      '[data-motion="heading"], [data-motion="media"]',
    )
    .forEach((element) => {
      if (element.dataset.motionBound === "true") return;
      element.dataset.motionBound = "true";
      inView(
        element,
        () => {
          if (element.dataset.animated === "true") return;
          element.dataset.animated = "true";
          animateContents(element, ease);
        },
        { amount: 0.2, margin: "0px 0px -48px 0px" },
      );
    });
}
