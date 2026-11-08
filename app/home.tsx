"use client";

import { useEffect, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ARTISTS } from "./artists";
import "./home.css";

gsap.registerPlugin(ScrollTrigger);

/* How far, in viewport heights, an image floats up while it leaves. */
const DRIFT = 0.46;

export default function Home() {
  const [day, setDay] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("is-day", day);
    return () => document.documentElement.classList.remove("is-day");
  }, [day]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-stage]");
    if (!root) return;

    const names = Array.from(root.querySelectorAll<HTMLElement>(".name"));
    const visuals = Array.from(root.querySelectorAll<HTMLElement>(".visual"));
    const track = root.querySelector<HTMLElement>(".scroll-track");
    if (!track || names.length < 2) return;

    const stepCount = names.length - 1;
    let cancelled = false;
    let trigger: ScrollTrigger | undefined;

    const setTrackHeight = () => {
      track.style.height = `${(stepCount + 1) * window.innerHeight}px`;
    };

    const updateNames = (progress: number) => {
      const position = progress * stepCount;
      const currentIndex = Math.min(Math.floor(position), stepCount - 1);
      const local = position - currentIndex;
      const atRest = position >= stepCount;

      names.forEach((name, index) => {
        let scaleY = 0;
        let origin = "center bottom";

        if (atRest) {
          scaleY = index === stepCount ? 1 : 0;
          origin = "center top";
        } else if (index < currentIndex) {
          scaleY = 0;
          origin = "center top";
        } else if (index === currentIndex) {
          scaleY = 1 - local;
          origin = "center top";
        } else if (index === currentIndex + 1) {
          scaleY = local;
          origin = "center bottom";
        }

        gsap.set(name, { scaleY, transformOrigin: origin });
      });
    };

    const updateVisuals = (progress: number) => {
      const position = progress * stepCount;
      const drift = window.innerHeight * DRIFT;

      visuals.forEach((visual, index) => {
        const local = position - index + 1;
        let scale = 0;
        let y = 0;

        if (local > 0 && local <= 1) {
          scale = local;
        } else if (local > 1 && local < 2) {
          const leave = local - 1;
          scale = 1 - leave;
          y = -drift * leave;
        }

        gsap.set(visual, {
          scale,
          y,
          transformOrigin: "left bottom",
        });
      });
    };

    const update = (progress: number) => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      updateNames(clamped);
      updateVisuals(clamped);
    };

    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const start = () => {
      if (cancelled) return;

      names.forEach((name, index) => {
        name.style.zIndex = String(index + 1);
      });
      visuals.forEach((visual) => {
        visual.style.zIndex = String(names.length + 2);
      });

      setTrackHeight();
      update(0);

      trigger = ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => update(self.progress),
      });

      ScrollTrigger.refresh();
    };

    const controller = new AbortController();
    let loaded = 0;

    names.forEach((name) => {
      const src = name.dataset.name;
      if (!src) {
        loaded += 1;
        if (loaded === names.length) start();
        return;
      }

      fetch(src, { signal: controller.signal })
        .then((response) => response.text())
        .then((markup) => {
          if (cancelled) return;
          name.innerHTML = markup;
          const svg = name.querySelector("svg");
          if (!svg) return;
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          svg.setAttribute("preserveAspectRatio", "none");
        })
        .catch(() => {
          /* A failed file just leaves that wordmark blank. */
        })
        .finally(() => {
          loaded += 1;
          if (loaded === names.length) start();
        });
    });

    const onResize = () => {
      setTrackHeight();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      controller.abort();
      window.removeEventListener("resize", onResize);
      trigger?.kill();
      lenis.destroy();
      gsap.ticker.remove(onTick);
    };
  }, []);

  return (
    <div className="stage" data-stage="">
      <h1 className="sr-only">Rap and hip-hop</h1>

      <button
        type="button"
        className="theme-toggle"
        aria-pressed={day}
        aria-label={day ? "Switch to night" : "Switch to day"}
        onClick={() => setDay((value) => !value)}
      >
        {day ? "Night" : "Day"}
      </button>

      <div className="spotlight">
        <div className="spotlight-frame">
          {ARTISTS.map((artist, index) => (
            <div
              key={artist.slug}
              className={index === 0 ? "name is-current" : "name"}
              data-name={`/names/${artist.slug}.svg`}
              style={
                {
                  "--night": artist.night,
                  "--day": artist.day,
                } as CSSProperties
              }
            />
          ))}

          {ARTISTS.map((artist, index) => (
            <div
              key={artist.slug}
              className={index === 0 ? "visual is-current" : "visual"}
            >
              <div className="visual-frame">
                {/* GSAP rewrites this node's transform every frame. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/images/${artist.slug}.jpg`}
                  alt=""
                  draggable={false}
                />
              </div>
              <p className="visual-caption">{artist.caption}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-track" />
    </div>
  );
}
