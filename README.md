# Name Swaps on Scroll

A fullscreen scroll experience where giant artist names wipe into each other and a portrait grows in, then drifts off with each transition.

**Live demo:** [https://name-swaps-on-scroll.vercel.app/](https://name-swaps-on-scroll.vercel.app/)

## What it does

Twenty rap and hip-hop artists share one continuous scroll. As you move down the page:

- The current name peels upward while the next one rises from the bottom
- The two edges meet, so the wipe never leaves a gap
- A square portrait grows in from the bottom left, then shrinks and floats away

Each wordmark is colored from that artist’s image. A Day / Night control in the corner flips the page palette without changing the motion.

## Stack

- [Next.js](https://nextjs.org/) + React
- [GSAP](https://gsap.com/) + ScrollTrigger
- [Lenis](https://github.com/darkroomengineering/lenis) for smooth scrolling
- Stretched SVG wordmarks in `public/names`
- Artist stills in `public/images`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
app/
  artists.ts   # roster, captions, night/day colors
  home.tsx     # scroll stage + Lenis / ScrollTrigger wiring
  home.css     # fixed stage, wordmarks, portraits, theme toggle
public/
  images/      # portraits
  names/       # SVG wordmarks
```

## Inspiration

Built after Codegrid’s [Suspiciously Smooth Scroll Animation](https://www.youtube.com/watch?v=XCuF9ALLjwo), itself inspired by [Vera van de Seyp](https://veravandeseyp.com/).
