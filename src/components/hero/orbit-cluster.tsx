"use client";

// Hero circles with orbital physics ("click to orbit").
// The purple disc is a fixed mass. The cream dot and the cream ring are
// satellites with home positions (dot upper right, ring below). A click pulls
// both orbits into ellipses aimed at the click point; they whirl around the
// mass (one loop per 1.3s, at least 2.2 loops, slowing down) and a spring
// brings them home. While they fly, thin ellipses show each orbit with its
// focus point and live labels (coordinates and acceleration). On load the
// satellites spiral in from far out.
//
// All geometry is in fixed units (mass radius 104.5) and scaled to
// the page by --k, which hero.module.css sets per breakpoint.

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import styles from "./hero.module.css";

export type Kick = { x: number; y: number; n: number };

const SC = 0.86;
const MASS_R = 121.5 * SC;
const SMALL_R = 48.7 * SC;
const RING_OUT = 127.5 * SC;
const RING_IN = 54 * SC;
const RING_R = (RING_OUT + RING_IN) / 2;
const RING_SW = RING_OUT - RING_IN;
const SMALL_D = 185.6 * SC;
const SMALL_A = Math.atan2(-111.5, 149);
const RING_D = 264 * SC;
const RING_A = Math.atan2(264, -1);

const BASE_OMEGA = (2 * Math.PI) / 1.3;
const RAMP_SEC = 0.5;
const RADIAL_POW = 1.25;
const DECAY_POW = 2.2;
const SPEED_FLOOR = 0.35;
const MIN_LOOPS = 2.2;
const TAU_SHAPE = 0.35;
const MAX_SHAPE_RATE = 700;
const TAU_ANGLE = 0.5;
const E_HOME_ENGAGE = 0.1;
const HOME_ENGAGE_ANGLE = 1.2;
const SPRING_K = 160;
const SPRING_D = 16;
const GATE_TIME = 0.5;
const EPS_ANGLE_TIGHT = 0.01;
const EPS_VEL = 0.05;
const EPS_SHAPE = 5;
const WAKE_THRESH = 0.05;
const MAX_STEP = 1 / 180;
const ENV_HOLD_SEC = 0.9;
const ENV_RELEASE_SEC = 1.8;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const normAngle = (a: number) => {
  a %= 2 * Math.PI;
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
};
const softCap = (step: number, cap: number) => (cap > 0 ? cap * Math.tanh(step / cap) : step);

type Guide = { cx: number; cy: number; rx: number; ry: number; rot: number; opacity: number; focusX: number; focusY: number };
type Sat = {
  homeR: number;
  homeA: number;
  apoOffset: number;
  reachMax: number;
  coreMinD: number;
  theta: number;
  thetaVel: number;
  curApo: number;
  curPeri: number;
  curApoAng: number;
  resting: boolean;
  loopsAccum: number;
  activeTime: number;
  gateElapsed: number;
  accel: number;
  x: number;
  y: number;
  guide: Guide | null;
};

function makeSat(homeR: number, homeA: number, apoOffset: number, coreMinD: number): Sat {
  return {
    homeR,
    homeA,
    apoOffset,
    reachMax: 900,
    coreMinD,
    theta: homeA,
    thetaVel: 0,
    curApo: homeR,
    curPeri: homeR,
    curApoAng: homeA,
    resting: true,
    loopsAccum: 0,
    activeTime: 0,
    gateElapsed: 0,
    accel: 0,
    x: homeR * Math.cos(homeA),
    y: homeR * Math.sin(homeA),
    guide: null,
  };
}

function stepSat(sat: Sat, dt: number, env: number, dirToMouse: number, reachToMouse: number) {
  const wasResting = sat.resting;
  if (sat.resting && env < WAKE_THRESH) return;
  if (wasResting) {
    sat.loopsAccum = 0;
    sat.activeTime = 0;
    sat.gateElapsed = 0;
  }
  sat.resting = false;
  sat.activeTime += dt;

  const targetPeri = sat.homeR - env * Math.max(0, sat.homeR - sat.coreMinD);
  const targetApo = targetPeri + env * Math.min(reachToMouse, sat.reachMax);
  const mix = clamp01(env / (WAKE_THRESH * 4));
  const targetApoAng = sat.theta + normAngle(dirToMouse + sat.apoOffset - sat.theta) * mix;

  const kShape = 1 - Math.exp(-dt / TAU_SHAPE);
  const maxShapeStep = MAX_SHAPE_RATE * dt;
  sat.curApo += softCap((targetApo - sat.curApo) * kShape, maxShapeStep);
  sat.curPeri += softCap((targetPeri - sat.curPeri) * kShape, maxShapeStep);
  sat.curApoAng += normAngle(targetApoAng - sat.curApoAng) * (1 - Math.exp(-dt / TAU_ANGLE));

  const A = (sat.curApo + sat.curPeri) / 2;
  const e = (sat.curApo - sat.curPeri) / (sat.curApo + sat.curPeri);
  const r = (A * (1 - e * e)) / (1 - e * Math.cos(sat.theta - sat.curApoAng));

  const rampT = clamp01(sat.activeTime / RAMP_SEC);
  const rampIn = rampT * rampT * (3 - 2 * rampT);
  const loopsProgress = clamp01(sat.loopsAccum / MIN_LOOPS);
  const decel = 1 - (1 - SPEED_FLOOR) * loopsProgress ** DECAY_POW;
  const keplerSpeed = BASE_OMEGA * rampIn * decel * (sat.homeR / r) ** RADIAL_POW;

  const signedErr = normAngle(sat.theta - sat.homeA);
  sat.gateElapsed = sat.loopsAccum >= MIN_LOOPS ? sat.gateElapsed + dt : 0;
  const loopGate = clamp01(sat.gateElapsed / GATE_TIME);
  const homing = clamp01(1 - e / E_HOME_ENGAGE) * clamp01(1 - Math.abs(signedErr) / HOME_ENGAGE_ANGLE) * loopGate;

  const kinematicPull = (keplerSpeed - sat.thetaVel) * 40;
  const springPull = -SPRING_K * signedErr - SPRING_D * sat.thetaVel;
  sat.accel = kinematicPull * (1 - homing) + springPull * homing;
  sat.thetaVel += sat.accel * dt;
  sat.theta += sat.thetaVel * dt;
  sat.loopsAccum += (Math.abs(sat.thetaVel) * dt) / (2 * Math.PI);

  const rNow = (A * (1 - e * e)) / (1 - e * Math.cos(sat.theta - sat.curApoAng));
  sat.x = rNow * Math.cos(sat.theta);
  sat.y = rNow * Math.sin(sat.theta);

  sat.guide =
    e > 0.01
      ? {
          cx: A * e * Math.cos(sat.curApoAng),
          cy: A * e * Math.sin(sat.curApoAng),
          rx: A,
          ry: A * Math.sqrt(Math.max(0, 1 - e * e)),
          rot: (sat.curApoAng * 180) / Math.PI,
          opacity: Math.min(0.9, e * 2.2),
          focusX: (sat.curApo - sat.curPeri) * Math.cos(sat.curApoAng),
          focusY: (sat.curApo - sat.curPeri) * Math.sin(sat.curApoAng),
        }
      : null;

  if (
    homing > 0.999 &&
    Math.abs(signedErr) < EPS_ANGLE_TIGHT &&
    Math.abs(sat.thetaVel) < EPS_VEL &&
    Math.abs(sat.curApo - sat.homeR) < EPS_SHAPE &&
    Math.abs(sat.curPeri - sat.homeR) < EPS_SHAPE &&
    env < WAKE_THRESH
  ) {
    sat.resting = true;
    sat.thetaVel = 0;
    sat.guide = null;
  }
}

function keepOffCore(sat: Sat) {
  if (sat.resting) return;
  const d = Math.hypot(sat.x, sat.y);
  if (d > 0 && d < sat.coreMinD) {
    const k = sat.coreMinD / d;
    sat.x *= k;
    sat.y *= k;
  }
}

export function OrbitCluster({ kick }: { kick: Kick | null }) {
  const clusterRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const physics = useRef<{ attractor: { x: number; y: number }; clickT0: number | null; small: Sat; ring: Sat } | null>(null);

  useEffect(() => {
    const cluster = clusterRef.current;
    const svg = svgRef.current;
    if (!cluster || !svg) return;
    const reduced = prefersReducedMotion();

    const small = makeSat(SMALL_D, SMALL_A, 0, MASS_R + SMALL_R + 6);
    const ring = makeSat(RING_D, RING_A, 0.5, MASS_R + RING_OUT + 6);
    const state = { attractor: { x: 0, y: 0 }, clickT0: null as number | null, small, ring };
    physics.current = state;

    // Intro: both satellites spiral in from far out.
    if (!reduced) {
      const intro = (sat: Sat, thetaOffset: number, apo: number, peri: number) => {
        sat.resting = false;
        sat.theta = sat.homeA - thetaOffset;
        sat.curApo = apo;
        sat.curPeri = peri;
        sat.curApoAng = sat.theta;
      };
      intro(small, 4.0, 1500, 500);
      intro(ring, 4.6, 1650, 600);
    }

    const q = (id: string) => svg.querySelector<SVGElement>(`[data-id="${id}"]`)!;
    const el = {
      mass: q("mass"),
      small: q("small"),
      ring: q("ring"),
      attractor: q("attractor"),
      guides: [
        { guide: q("guide-small"), focus: q("focus-small"), label: q("coord-small"), xy: q("coord-small-xy"), a: q("coord-small-a") },
        { guide: q("guide-ring"), focus: q("focus-ring"), label: q("coord-ring"), xy: q("coord-ring-xy"), a: q("coord-ring-a") },
      ],
    };

    const drawGuide = (sat: Sat, g: (typeof el.guides)[number], rect: DOMRect, k: number) => {
      const guide = sat.guide;
      if (!guide) {
        g.guide.setAttribute("opacity", "0");
        g.focus.setAttribute("opacity", "0");
        g.label.setAttribute("opacity", "0");
        return;
      }
      const op = guide.opacity.toFixed(3);
      g.guide.setAttribute("cx", guide.cx.toFixed(1));
      g.guide.setAttribute("cy", guide.cy.toFixed(1));
      g.guide.setAttribute("rx", guide.rx.toFixed(1));
      g.guide.setAttribute("ry", guide.ry.toFixed(1));
      g.guide.setAttribute("transform", `rotate(${guide.rot.toFixed(2)} ${guide.cx.toFixed(1)} ${guide.cy.toFixed(1)})`);
      g.guide.setAttribute("opacity", op);
      g.focus.setAttribute("cx", guide.focusX.toFixed(1));
      g.focus.setAttribute("cy", guide.focusY.toFixed(1));
      g.focus.setAttribute("opacity", op);
      const lx = (guide.focusX + 10 / k).toFixed(1);
      g.xy.setAttribute("x", lx);
      g.xy.setAttribute("y", (guide.focusY + 5 / k).toFixed(1));
      g.xy.textContent = `${Math.round(rect.left + guide.focusX * k)}, ${Math.round(rect.top + guide.focusY * k)}`;
      g.a.setAttribute("x", lx);
      g.a.setAttribute("y", (guide.focusY + 20 / k).toFixed(1));
      g.a.textContent = `a ${sat.accel.toFixed(1)}`;
      g.label.setAttribute("opacity", op);
    };

    // Size: a 1920x1080 scene is scaled to cover the
    // screen (capped at 1.12x contain in landscape, more on tall screens) and
    // the mark is drawn at 0.7 of that.
    let k = 0.58;
    const size = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const contain = Math.min(w / 1920, h / 1080);
      const cover = Math.max(w / 1920, h / 1080);
      const over = h <= w ? 1.12 : w <= 640 ? 2.3 : 1.45;
      k = Math.min(cover, contain * over) * 0.7;
      cluster.style.setProperty("--k", k.toFixed(4));
    };
    size();
    window.addEventListener("resize", size);

    let last = performance.now();
    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(cluster);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (!visible) return;

      const rect = cluster.getBoundingClientRect();

      let env = 0;
      if (state.clickT0 !== null) {
        const t = (now - state.clickT0) / 1000;
        if (t <= ENV_HOLD_SEC) env = 1;
        else {
          const u = (t - ENV_HOLD_SEC) / ENV_RELEASE_SEC;
          env = u >= 1 ? 0 : 1 - u * u * (3 - 2 * u);
        }
      }
      const dirToMouse = Math.atan2(state.attractor.y, state.attractor.x);
      const reachToMouse = Math.hypot(state.attractor.x, state.attractor.y);

      let rest = dt;
      while (rest > 1e-6) {
        const h = Math.min(rest, MAX_STEP);
        stepSat(small, h, env, dirToMouse, reachToMouse);
        stepSat(ring, h, env, dirToMouse, reachToMouse);
        keepOffCore(small);
        keepOffCore(ring);
        rest -= h;
      }

      // The mass recoils a little against the satellites.
      const homeSX = SMALL_D * Math.cos(SMALL_A);
      const homeSY = SMALL_D * Math.sin(SMALL_A);
      const homeRX = RING_D * Math.cos(RING_A);
      const homeRY = RING_D * Math.sin(RING_A);
      const recoilX = Math.max(-16, Math.min(16, -((small.x - homeSX) + (ring.x - homeRX)) * 0.045));
      const recoilY = Math.max(-16, Math.min(16, -((small.y - homeSY) + (ring.y - homeRY)) * 0.045));
      el.mass.setAttribute("transform", `translate(${recoilX.toFixed(2)} ${recoilY.toFixed(2)})`);
      el.small.setAttribute("cx", small.x.toFixed(2));
      el.small.setAttribute("cy", small.y.toFixed(2));
      el.ring.setAttribute("cx", ring.x.toFixed(2));
      el.ring.setAttribute("cy", ring.y.toFixed(2));
      drawGuide(small, el.guides[0], rect, k);
      drawGuide(ring, el.guides[1], rect, k);
      el.attractor.setAttribute("opacity", Math.min(0.9, env * 1.8).toFixed(3));
    };
    frame = requestAnimationFrame(tick);

    // Docking: scrolling past 24px spins the satellites
    // up, then (after 0.85s) the whole mark flies to the top left and docks
    // under the wordmark as the site's logo. Back above 8px it flies home.
    // Desktop only; on phones the mark simply scrolls away with the hero.
    const DOCK_AT = 24;
    const UNDOCK_AT = 8;
    const SPINUP_MS = 850;
    const FLIGHT_MS = 1800;
    const FLIGHT_EASE = "cubic-bezier(0.45, 0, 0.15, 1)";
    const DOCK_GAP = 24;
    const desktop = window.matchMedia("(min-width: 768px)");
    const smallHomeX = SMALL_D * Math.cos(SMALL_A);
    const smallHomeY = SMALL_D * Math.sin(SMALL_A);
    const ringHomeX = RING_D * Math.cos(RING_A);
    const ringHomeY = RING_D * Math.sin(RING_A);
    const logoLeft = Math.min(-MASS_R, smallHomeX - SMALL_R, ringHomeX - RING_OUT);
    const logoRight = Math.max(MASS_R, smallHomeX + SMALL_R, ringHomeX + RING_OUT);
    const logoTop = Math.min(-MASS_R, smallHomeY - SMALL_R, ringHomeY - RING_OUT);
    const logoW = logoRight - logoLeft;

    let docked = false;
    let flying = false;
    let restX = 0;
    let restY = 0;
    let dockScrollY = 0;
    let spinTimer = 0;
    let flight: Animation | null = null;

    const spin = (ax: number, ay: number) => {
      state.attractor = { x: ax, y: ay };
      state.clickT0 = performance.now();
      small.loopsAccum = 0;
      ring.loopsAccum = 0;
    };

    // Where the mass centre has to be (viewport px) and how much to scale so
    // the whole mark is as wide as the wordmark and sits 24px below it.
    const dockTarget = () => {
      const word = document.querySelector<HTMLElement>("[data-wordmark]");
      const wr = word?.getBoundingClientRect();
      const width = wr?.width ?? 48;
      const s = width / (logoW * k);
      const x = (wr?.left ?? 56) - logoLeft * k * s;
      const y = (wr?.bottom ?? 70) + DOCK_GAP - logoTop * k * s;
      return { dx: x - restX, dy: y - restY, s };
    };

    const pinAtRest = () => {
      const r = cluster.getBoundingClientRect();
      restX = r.left;
      restY = r.top;
      cluster.style.position = "fixed";
      cluster.style.left = `${restX}px`;
      cluster.style.top = `${restY}px`;
      // Above the header layer so its soft fade doesn't dim the docked mark.
      cluster.style.zIndex = "51";
    };
    const unpin = () => {
      cluster.style.zIndex = "";
      cluster.style.position = "";
      cluster.style.left = "";
      cluster.style.top = "";
      cluster.style.transform = "";
      delete cluster.dataset.docked;
    };

    const check = () => {
      if (flying) return;
      const y = window.scrollY;
      if (!docked && y > DOCK_AT && desktop.matches) dock();
      else if (docked && y < UNDOCK_AT) undock();
    };

    const dock = (instant = false) => {
      docked = true;
      dockScrollY = window.scrollY;
      pinAtRest();
      if (instant || reduced) {
        const t = dockTarget();
        cluster.style.transform = `translate(${t.dx}px, ${t.dy}px) scale(${t.s})`;
        cluster.dataset.docked = "";
        return;
      }
      flying = true;
      spin(-420, -320);
      spinTimer = window.setTimeout(() => {
        const t = dockTarget();
        flight = cluster.animate(
          [
            { transform: "translate(0px, 0px) scale(1)", offset: 0 },
            { transform: `translate(${t.dx * 0.8}px, ${t.dy * 0.8}px) scale(${1 + (t.s - 1) * 0.2})`, offset: 0.6 },
            { transform: `translate(${t.dx}px, ${t.dy}px) scale(${t.s})`, offset: 1 },
          ],
          { duration: FLIGHT_MS, easing: FLIGHT_EASE, fill: "forwards" },
        );
        flight.onfinish = () => {
          cluster.style.transform = `translate(${t.dx}px, ${t.dy}px) scale(${t.s})`;
          flight?.cancel();
          flight = null;
          cluster.dataset.docked = "";
          flying = false;
          check();
        };
      }, SPINUP_MS);
    };

    const undock = () => {
      docked = false;
      delete cluster.dataset.docked;
      // Where the mark rests now that the page is back near the top.
      const backY = dockScrollY - window.scrollY;
      if (reduced) {
        unpin();
        return;
      }
      flying = true;
      spin(320, 220);
      const from = cluster.style.transform || "none";
      flight = cluster.animate(
        [
          { transform: from, offset: 0 },
          { transform: `translate(0px, ${backY}px) scale(1)`, offset: 1 },
        ],
        { duration: FLIGHT_MS, easing: FLIGHT_EASE, fill: "forwards" },
      );
      flight.onfinish = () => {
        flight?.cancel();
        flight = null;
        unpin();
        flying = false;
        check();
      };
    };

    // Loaded part-way down the page: dock straight away.
    if (window.scrollY > DOCK_AT && desktop.matches) dock(true);
    window.addEventListener("scroll", check, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", size);
      window.removeEventListener("scroll", check);
      window.clearTimeout(spinTimer);
      flight?.cancel();
    };
  }, []);

  // A click on the hero (from HeroStage) sets the attractor.
  useEffect(() => {
    const state = physics.current;
    const cluster = clusterRef.current;
    if (!kick || !state || !cluster) return;
    const rect = cluster.getBoundingClientRect();
    const k = parseFloat(getComputedStyle(cluster).getPropertyValue("--k")) || 1;
    state.attractor = { x: (kick.x - rect.left) / k, y: (kick.y - rect.top) / k };
    state.clickT0 = performance.now();
    state.small.loopsAccum = 0;
    state.ring.loopsAccum = 0;
    const dot = svgRef.current?.querySelector('[data-id="attractor"]');
    dot?.setAttribute("cx", state.attractor.x.toFixed(1));
    dot?.setAttribute("cy", state.attractor.y.toFixed(1));
  }, [kick]);

  const smallHome = { x: SMALL_D * Math.cos(SMALL_A), y: SMALL_D * Math.sin(SMALL_A) };
  const ringHome = { x: RING_D * Math.cos(RING_A), y: RING_D * Math.sin(RING_A) };

  return (
    <div ref={clusterRef} className={styles.cluster} aria-hidden="true">
      <svg ref={svgRef} className={styles.orbitSvg} width="2" height="2" overflow="visible">
        <g className={styles.orbitWorld}>
          <ellipse data-id="guide-small" className={styles.guide} opacity="0" />
          <ellipse data-id="guide-ring" className={styles.guide} opacity="0" />
          <circle data-id="focus-small" className={styles.focus} r="5" opacity="0" />
          <circle data-id="focus-ring" className={styles.focus} r="5" opacity="0" />
          <text data-id="coord-small" className={styles.coord} opacity="0">
            <tspan data-id="coord-small-xy" />
            <tspan data-id="coord-small-a" />
          </text>
          <text data-id="coord-ring" className={styles.coord} opacity="0">
            <tspan data-id="coord-ring-xy" />
            <tspan data-id="coord-ring-a" />
          </text>
          <circle data-id="attractor" className={styles.focus} r="9" opacity="0" />
          <circle data-id="mass" className={styles.mass} r={MASS_R} cx="0" cy="0" />
          <circle data-id="ring" className={styles.ringSat} r={RING_R} strokeWidth={RING_SW} cx={ringHome.x.toFixed(2)} cy={ringHome.y.toFixed(2)} />
          <circle data-id="small" className={styles.smallSat} r={SMALL_R} cx={smallHome.x.toFixed(2)} cy={smallHome.y.toFixed(2)} />
        </g>
      </svg>
    </div>
  );
}
