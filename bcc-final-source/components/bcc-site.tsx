"use client";
import {Fragment, createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue} from "motion/react";
import {usePathname} from "next/navigation";
import {ArrowRight, ArrowUp, ArrowUpRight, Bot, Building2, Check, ChevronDown, ChevronLeft, Download, Factory, HardHat, Link2, Mail, MapPin, Menu, MessageCircle, Mic, Phone, Search, Send, ShieldCheck, Users, X} from "lucide-react";
import {IMG, brand, financials, leadership, machinery, navigation, pageMeta, projects, rating} from "@/app/data";

const cx = (...s: (string | false | undefined | null)[]) => s.filter(Boolean).join(" ");
const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------
   Fixed backdrop — the whole site floats over this layer
------------------------------------------------------------------- */
type BackdropConfig = {images: string[]};
type BackdropState = BackdropConfig & {active: number; setActive: (i: number) => void};
const BackdropCtx = createContext<BackdropState>({images: [], active: 0, setActive: () => {}});

function Backdrop() {
  const {images, active} = useContext(BackdropCtx);
  const {scrollYProgress} = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14]);
  const src = images[active] ?? images[0];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      <motion.div style={{scale}} className="absolute inset-0 will-change-transform">
        <AnimatePresence initial={false}>
          <motion.img key={src} src={src} alt="" loading="eager" decoding="async" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 1.2, ease: EASE}} className="img-premium absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,16,.2)_0%,rgba(8,14,16,.36)_50%,rgba(8,14,16,.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_8%_18%,rgba(143,174,108,.16),transparent_70%),radial-gradient(50%_50%_at_95%_85%,rgba(23,133,133,.2),transparent_70%)]" />
      <div className="orb orb-leaf" />
      <div className="orb orb-teal" />
      <div className="backdrop-grid absolute inset-0" />
      <div className="noise absolute inset-0" />
    </div>
  );
}

/* Low-poly facet texture echoing the faceted "B" of the logo */
const FACETS = (() => {
  const cols = 8, rows = 5, w = 600 / cols, h = 400 / rows;
  const rnd = (n: number) => {const x = Math.sin(n * 91.345) * 43758.5453; return x - Math.floor(x);};
  const pt = (c: number, r: number) => {
    const edge = c === 0 || r === 0 || c === cols || r === rows;
    return [c * w + (edge ? 0 : (rnd(c * 17 + r) - 0.5) * w * 0.7), r * h + (edge ? 0 : (rnd(c * 31 + r * 7) - 0.5) * h * 0.7)];
  };
  const out: {p: string; o: number}[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const [a, b, d, e] = [pt(c, r), pt(c + 1, r), pt(c, r + 1), pt(c + 1, r + 1)];
    out.push({p: [a, b, e].map(x => x.join(",")).join(" "), o: 0.02 + rnd(r * 13 + c) * 0.11});
    out.push({p: [a, e, d].map(x => x.join(",")).join(" "), o: 0.02 + rnd(r * 29 + c * 3) * 0.11});
  }
  return out;
})();
function Facets({className}: {className?: string}) {
  return (
    <svg aria-hidden viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className={cx("pointer-events-none absolute inset-0 h-full w-full", className)}>
      {FACETS.map((f, i) => <polygon key={i} points={f.p} fill="#fff" opacity={f.o} stroke="rgba(255,255,255,.06)" strokeWidth=".6" />)}
    </svg>
  );
}

/* ------------------------------------------------------------------
   Primitives
------------------------------------------------------------------- */
const TONES = {
  light: "panel-light",
  white: "panel-white",
  dark: "panel-dark on-dark",
  glass: "panel-glass on-dark",
  brand: "panel-brand on-dark",
} as const;
type Tone = keyof typeof TONES;

function Panel({tone = "light", id, className, children, pad = true}: {tone?: Tone; id?: string; className?: string; children: React.ReactNode; pad?: boolean}) {
  return (
    <motion.section id={id} initial={{opacity: 0, y: 60, scale: 0.97}} whileInView={{opacity: 1, y: 0, scale: 1}} viewport={{once: true, margin: "0px 0px -8% 0px"}} transition={{duration: 1.1, ease: EASE}} className={cx("float-panel", TONES[tone], className)}>
      {tone === "brand" && <Facets />}
      <div className={cx("relative", pad && "panel-pad")}>
        <div className="wrap">{children}</div>
      </div>
    </motion.section>
  );
}

function Reveal({children, className, delay = 0}: {children: React.ReactNode; className?: string; delay?: number}) {
  return (
    <motion.div initial={{opacity: 0, y: 26}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "0px 0px -6% 0px"}} transition={{duration: 0.8, delay, ease: EASE}} className={className}>
      {children}
    </motion.div>
  );
}

function SectionHead({eyebrow, title, copy}: {eyebrow: string; title: string; copy?: string}) {
  return (
    <div className="grid items-end gap-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display max-w-3xl"><SplitWords segments={[{text: title}]} inView /></h2>
      </Reveal>
      {copy && <Reveal delay={0.1}><p className="lede max-w-xl lg:justify-self-end">{copy}</p></Reveal>}
    </div>
  );
}

function CountUp({value}: {value: string}) {
  const m = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {once: true, margin: "0px 0px -10% 0px"});
  const target = m ? parseFloat(m[2]) : 0;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [n, setN] = useState(target);
  const started = useRef(false);
  useEffect(() => {if (!inView && !started.current) setN(0);}, [inView]);
  useEffect(() => {
    if (!inView || !m || started.current) return;
    started.current = true;
    const c = animate(0, target, {duration: 1.8, ease: EASE, onUpdate: setN});
    return () => c.stop();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span>{value}</span>;
  return <span ref={ref} className="tabular-nums">{m[1]}{n.toFixed(decimals)}{m[3]}</span>;
}

/* Split a headline so its final sentence (or last words) carries the brand gradient */
type Seg = {text: string; className?: string};
function headlineSegments(text: string, highlight = true): Seg[] {
  if (!highlight) return [{text}];
  const parts = text.split(". ");
  if (parts.length > 1) return [{text: parts.slice(0, -1).join(". ") + "."}, {text: parts[parts.length - 1], className: "grad-text-light"}];
  const words = text.split(" ");
  if (words.length < 3) return [{text}];
  return [{text: words.slice(0, -2).join(" ")}, {text: words.slice(-2).join(" "), className: "grad-text-light"}];
}

/* Word-by-word masked reveal — the signature headline animation */
function SplitWords({segments, delay = 0, stagger = 0.055, inView = false}: {segments: Seg[]; delay?: number; stagger?: number; inView?: boolean}) {
  const reduce = useReducedMotion();
  const shown = {y: "0%", rotate: 0, opacity: 1};
  let idx = 0;
  return (
    <>
      {segments.map((seg, si) => seg.text.split(" ").filter(Boolean).map((w, wi) => {
        const i = idx++;
        return (
          <Fragment key={`${si}-${wi}`}>
            <span className="-mb-[0.14em] inline-block max-w-full overflow-hidden pb-[0.14em] align-bottom wrap-anywhere">
              <motion.span
                className={cx("inline-block origin-bottom-left", seg.className)}
                initial={reduce ? false : {y: "110%", rotate: 6, opacity: 0}}
                {...(inView ? {whileInView: shown, viewport: {once: true, margin: "0px 0px -10% 0px"}} : {animate: shown})}
                transition={{duration: 1, delay: delay + i * stagger, ease: EASE}}
              >{w}</motion.span>
            </span>{" "}
          </Fragment>
        );
      }))}
    </>
  );
}

/* Delay hero choreography until the first-visit intro curtain lifts */
function useIntroDelay() {
  const [d] = useState(() => (typeof document !== "undefined" && !document.documentElement.hasAttribute("data-intro-seen") ? 1.35 : 0));
  return d;
}

function Preloader() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    let seen = false;
    try {seen = !!sessionStorage.getItem("bcc-intro"); sessionStorage.setItem("bcc-intro", "1");} catch {}
    const t = setTimeout(() => setDone(true), seen ? 0 : 1500);
    // Once the curtain has lifted, client-side navigations should skip the intro entirely
    const mark = setTimeout(() => document.documentElement.setAttribute("data-intro-seen", ""), seen ? 0 : 2600);
    return () => {clearTimeout(t); clearTimeout(mark);};
  }, []);
  return (
    <AnimatePresence>
      {!done && (
        <motion.div key="intro" aria-hidden initial={{clipPath: "inset(0% 0% 0% 0%)"}} exit={{clipPath: "inset(0% 0% 100% 0%)"}} transition={{duration: 0.95, ease: [0.76, 0, 0.24, 1]}} className="preloader fixed inset-0 z-100 grid place-items-center bg-paper">
          <div className="relative flex flex-col items-center px-6">
            <motion.img src="/bcc/logo.png" alt="" initial={{opacity: 0, y: 24, scale: 0.94, filter: "blur(8px)"}} animate={{opacity: 1, y: 0, scale: 1, filter: "blur(0px)"}} transition={{duration: 0.9, ease: EASE}} className="h-28 w-auto sm:h-36" />
            <div className="mt-8 h-0.75 w-52 overflow-hidden rounded-full bg-ink/10">
              <motion.div initial={{x: "-100%"}} animate={{x: "0%"}} transition={{duration: 1.3, ease: EASE}} className="h-full w-full bg-(image:--brand-grad)" />
            </div>
            <motion.p initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.4}} className="mt-4 text-[11px] font-bold uppercase tracking-[.3em] text-steel">Paving paths to progress</motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Soft ring that trails the pointer on desktop and swells over interactive elements */
function CursorGlow() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, {stiffness: 500, damping: 40}), sy = useSpring(y, {stiffness: 500, damping: 40});
  const [hot, setHot] = useState(false);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raf = requestAnimationFrame(() => setOn(true));
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHot(!!(e.target as HTMLElement).closest?.("a,button,select,input,textarea,label"));
    };
    window.addEventListener("pointermove", move, {passive: true});
    return () => {cancelAnimationFrame(raf); window.removeEventListener("pointermove", move);};
  }, [x, y]);
  if (!on) return null;
  return (
    <motion.div aria-hidden style={{x: sx, y: sy}} className="pointer-events-none fixed left-0 top-0 z-90 mix-blend-difference">
      <motion.span animate={{scale: hot ? 1.9 : 1, opacity: hot ? 0.9 : 0.5}} transition={{type: "spring", stiffness: 300, damping: 22}} className="block h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white" />
    </motion.div>
  );
}

/* Buttons that lean toward the pointer */
function Magnetic({children, className}: {children: React.ReactNode; className?: string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useSpring(0, {stiffness: 220, damping: 16}), y = useSpring(0, {stiffness: 220, damping: 16});
  return (
    <motion.span ref={ref} style={{x, y}} className={cx("inline-flex max-sm:w-full", className)}
      onPointerMove={e => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.28);
        y.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
      onPointerLeave={() => {x.set(0); y.set(0);}}>
      {children}
    </motion.span>
  );
}

/* 3D tilt for showcase cards */
function Tilt({children, className, max = 6}: {children: React.ReactNode; className?: string; max?: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useSpring(0, {stiffness: 180, damping: 18}), ry = useSpring(0, {stiffness: 180, damping: 18});
  return (
    <motion.div ref={ref} style={{rotateX: rx, rotateY: ry, transformPerspective: 1100}} className={className}
      onPointerMove={e => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
      }}
      onPointerLeave={() => {rx.set(0); ry.set(0);}}>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------
   Header
------------------------------------------------------------------- */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState("");
  const pathname = usePathname() || "/";
  const introDelay = useIntroDelay();

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, {passive: true});
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {document.documentElement.style.overflow = "";};
  }, [open]);

  const activeGroup = navigation.find(n => n.href === pathname) ?? navigation.find(n => n.children.some(([, h]) => h.split("#")[0] === pathname));
  const isActive = (href: string) => activeGroup?.href === href;
  const current = navigation.find(n => n.label === mega);

  return (
    <motion.header initial={{y: -110, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: introDelay + 0.2, duration: 1, ease: EASE}} className="fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-3 lg:px-6" onMouseLeave={() => setMega("")} onKeyDown={e => {if (e.key === "Escape") {setMega(""); setOpen(false);}}}>
      <div className={cx("mx-auto max-w-360 rounded-[22px] border backdrop-blur-xl backdrop-saturate-150 transition-all duration-500", scrolled || open || mega ? "border-white/80 bg-white/90 shadow-[0_20px_50px_-22px_rgba(0,0,0,.55)]" : "border-white/55 bg-white/75 shadow-[0_12px_40px_-26px_rgba(0,0,0,.6)]")}>
        <div className={cx("flex items-center justify-between gap-4 pl-3 pr-2 transition-[height] duration-500 sm:pl-4", scrolled ? "h-16.5" : "h-19.5")}>
          <a href="/" aria-label="BCC Buildtech — home" className="flex shrink-0 items-center">
            <img src="/bcc/logo.png" alt="BCC Buildtech — Paving Paths to Progress" width={422} height={264} className={cx("w-auto transition-all duration-500", scrolled ? "h-13" : "h-15.5")} />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
            <a href="/" className={cx("rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", pathname === "/" ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/6 hover:text-ink")}>Home</a>
            {navigation.map(n => (
              <div key={n.label} onMouseEnter={() => n.children.length ? setMega(n.label) : setMega("")}>
                <a href={n.href} onFocus={() => n.children.length ? setMega(n.label) : setMega("")} aria-haspopup={n.children.length ? "true" : undefined} aria-expanded={n.children.length ? mega === n.label : undefined} className={cx("flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", isActive(n.href) ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/6 hover:text-ink")}>
                  {n.label}
                  {n.children.length > 0 && <ChevronDown className={cx("h-3.5 w-3.5 opacity-60 transition-transform duration-300", mega === n.label && "rotate-180")} />}
                </a>
              </div>
            ))}
            <a href="/careers" onMouseEnter={() => setMega("")} onFocus={() => setMega("")} className={cx("rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", pathname === "/careers" ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/6 hover:text-ink")}>Careers</a>
          </nav>

          <div className="hidden items-center gap-2 xl:flex" onMouseEnter={() => setMega("")}>
            <a href="/BCC-Buildtech-Company-Profile.pdf" download className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-teal hover:text-teal-2"><Download className="h-4 w-4" />Profile</a>
            <Magnetic><a href="/contact" className="action primary min-h-0! px-5! py-2.5! text-[13px]">Enquire <ArrowRight /></a></Magnetic>
          </div>

          <button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white transition-transform active:scale-95 xl:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {current && (
            <motion.div key="mega" initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} exit={{opacity: 0, height: 0}} transition={{duration: 0.35, ease: EASE}} className="hidden overflow-hidden xl:block">
              <div className="grid grid-cols-[.75fr_2fr] gap-8 border-t border-ink/[.07] p-5">
                <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white">
                  <Facets className="opacity-60" />
                  <div className="relative">
                    <p className="eyebrow on-dark">Explore</p>
                    <p className="font-display text-2xl font-semibold">{current.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/55">Structured evidence, capabilities and credentials for clients, partners and stakeholders.</p>
                    <a href={current.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-3">Overview <ArrowRight className="h-4 w-4" /></a>
                  </div>
                </div>
                <div className="grid gap-3" style={{gridTemplateColumns: `repeat(${current.children.length}, minmax(0,1fr))`}}>
                  {current.children.map(([l, h], i) => (
                    <a key={h} href={h} className="group flex flex-col justify-between rounded-2xl border border-ink/8 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_18px_40px_-24px_rgba(11,19,21,.45)]">
                      <span className="font-display text-xs font-semibold text-teal">0{i + 1}</span>
                      <span className="mt-10 flex items-center justify-between gap-3 text-[15px] font-semibold text-ink">{l}<span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist transition-colors group-hover:bg-teal group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span></span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div key="mobile" initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: "auto"}} exit={{opacity: 0, height: 0}} transition={{duration: 0.4, ease: EASE}} className="overflow-hidden xl:hidden">
              <nav aria-label="Mobile" className="max-h-[calc(100svh-104px)] overflow-y-auto overscroll-contain border-t border-ink/[.07] px-3 pb-4 pt-2 sm:px-4">
                <a href="/" className={cx("flex items-center justify-between border-b border-ink/[.07] py-4 font-display text-lg font-semibold", pathname === "/" ? "text-teal-2" : "text-ink")}>Home<ArrowUpRight className="h-4 w-4 text-teal" /></a>
                {navigation.map((n, i) => (
                  <motion.div key={n.label} initial={{opacity: 0, x: -12}} animate={{opacity: 1, x: 0}} transition={{delay: 0.05 * i, ease: EASE}} className="border-b border-ink/[.07] py-3">
                    <a href={n.href} className="flex items-center justify-between py-1.5 font-display text-lg font-semibold text-ink">{n.label}<ArrowUpRight className="h-4 w-4 text-teal" /></a>
                    {n.children.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
                      {n.children.map(([l, h]) => <a key={h} href={h} className="rounded-full bg-mist px-3.5 py-2 text-[13px] font-medium text-ink/75">{l}</a>)}
                    </div>}
                  </motion.div>
                ))}
                <a href="/careers" className="flex items-center justify-between border-b border-ink/[.07] py-4 font-display text-lg font-semibold text-ink">Careers<ArrowUpRight className="h-4 w-4 text-teal" /></a>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <a href="/contact" className="action primary">Enquire now <ArrowRight /></a>
                  <a href="/BCC-Buildtech-Company-Profile.pdf" download className="action outline"><Download />Download profile</a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------
   Hero (transparent — sits directly on the fixed backdrop)
------------------------------------------------------------------- */
type HeroMeta = {eyebrow: string; title: string; copy: string};
export function Hero({meta, home = false, highlight = true, crumb, here}: {meta: HeroMeta; home?: boolean; highlight?: boolean; crumb?: [string, string]; here?: string}) {
  const {images, active, setActive} = useContext(BackdropCtx);
  const ref = useRef<HTMLElement>(null);
  const d = useIntroDelay();
  const {scrollYProgress} = useScroll({target: ref, offset: ["start start", "end start"]});
  const y = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  useEffect(() => {
    if (!home || images.length < 2) return;
    const timer = window.setInterval(() => setActive((active + 1) % images.length), 20000);
    return () => window.clearInterval(timer);
  }, [home, images.length, active, setActive]);
  return (
    <section ref={ref} onPointerMove={e => {const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);}} className={cx("spotlight relative flex items-end", home ? "min-h-svh" : "min-h-[74svh] lg:min-h-[80vh]")}>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,14,16,.55)_0%,rgba(8,14,16,.14)_50%,transparent_75%)]" />
      {home && (
        <motion.div aria-hidden initial={{opacity: 0, x: 40}} animate={{opacity: 1, x: 0}} transition={{delay: d + 1.1, duration: 1, ease: EASE}} className="absolute right-12 top-[20%] hidden flex-col gap-3 xl:flex 2xl:right-20">
          <div className="float-y panel-glass rounded-2xl px-5 py-4 text-white">
            <small className="text-[10.5px] font-bold uppercase tracking-[.16em] text-white/55">Execution platform</small>
            <b className="mt-1 block font-display text-2xl font-semibold"><span className="grad-text-light">EPC + HAM ready</span></b>
          </div>
          <div className="float-y panel-glass ml-10 rounded-2xl px-5 py-4 text-white [animation-delay:-3s]">
            <small className="text-[10.5px] font-bold uppercase tracking-[.16em] text-white/55">Built for</small>
            <b className="mt-1 block font-display text-lg font-semibold">Roads · Bridges · Corridors</b>
          </div>
        </motion.div>
      )}
      <motion.div style={{y, opacity}} className="wrap relative px-5 pb-12 pt-32 sm:px-8 lg:px-12 lg:pb-16">
        {!home && (
          <motion.nav aria-label="Breadcrumb" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: d, duration: 0.7, ease: EASE}} className="mb-6 flex items-center gap-2 text-[13px] font-medium text-white/55">
            <a href="/" className="hover:text-white">Home</a><span>/</span>
            {crumb && <><a href={crumb[1]} className="hover:text-white">{crumb[0]}</a><span>/</span></>}
            <span className="text-white/85">{here ?? meta.eyebrow}</span>
          </motion.nav>
        )}
        <motion.p initial={{opacity: 0, y: 14, filter: "blur(6px)"}} animate={{opacity: 1, y: 0, filter: "blur(0px)"}} transition={{delay: d, duration: 0.8, ease: EASE}} className="chip panel-glass mb-6 text-[10.5px]! tracking-[.18em]! text-white/90">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf-3 shadow-[0_0_10px_2px_rgba(183,211,140,.7)]" />{meta.eyebrow}
        </motion.p>
        <h1 className={cx("max-w-6xl text-balance pb-2 font-display [text-shadow:0_4px_40px_rgba(0,0,0,.35)] font-semibold tracking-[-.045em] text-white", home ? "text-[clamp(2.6rem,7.4vw,7rem)] leading-[.98]" : "text-[clamp(2.3rem,6vw,5.6rem)] leading-none")}>
          <SplitWords segments={headlineSegments(meta.title, highlight)} delay={d + 0.1} stagger={0.07} />
        </h1>
        <motion.p initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{delay: d + 0.55, duration: 0.8, ease: EASE}} className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-white/85 [text-shadow:0_2px_16px_rgba(0,0,0,.45)] sm:text-lg">{meta.copy}</motion.p>

        {home && (
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <motion.div initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{delay: d + 0.7, duration: 0.8, ease: EASE}}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Magnetic><a href="/projects" className="action primary">Explore projects <ArrowRight /></a></Magnetic>
                <Magnetic><a href="/about" className="action ghost">Discover BCC</a></Magnetic>
              </div>
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.2em] text-white/45">Trusted by public-sector employers</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-white/75">
                {["MoRTH", "NHAI", "NHIDCL", "PWD", "MPRDC"].map((x, i) => <motion.span key={x} initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} transition={{delay: d + 0.9 + i * 0.07, ease: EASE}}>{x}</motion.span>)}
              </div>
            </motion.div>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">Hero visual auto-rotates every 30 seconds</p>
          </div>
        )}
      </motion.div>
      {home && (
        <motion.a href="#scale" aria-label="Scroll to content" initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: d + 1.6}} className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block">
          <span className="flex h-10 w-6 justify-center rounded-full border border-white/35 pt-2"><span className="float-y h-2 w-1 rounded-full bg-white/80" /></span>
        </motion.a>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------
   Footer + Shell
------------------------------------------------------------------- */
function Footer() {
  const cols: [string, [string, string][]][] = [
    ["Company", [["About", "/about"], ["Leadership", "/leadership"], ["Financial strength", "/financials"], ["Vision", "/about#mission-vision"], ["Careers", "/careers"]]],
    ["Business & capabilities", [["EPC", "/epc"], ["HAM", "/ham"], ["Bridges & Structures", "/businesses#structures"], ["Quality & safety", "/quality-safety-sustainability"]]],
    ["Impact", [["CSR", "/csr"], ["Sustainability", "/quality-safety-sustainability#environment"], ["Media centre / Blog", "/media"]]],
  ];
  return (
    <footer className="float-panel panel-dark on-dark">
      <Facets className="opacity-40 mask-[linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="relative px-5 pb-8 pt-14 sm:px-8 lg:px-14 lg:pt-20">
        <div className="wrap">
          <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">Work with BCC</p>
              <h2 className="display max-w-2xl text-white"><SplitWords inView segments={[{text: "Let’s build the"}, {text: "next connection.", className: "grad-text-light"}]} /></h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Magnetic><a href="/contact" className="action primary">Enquire with BCC <ArrowRight /></a></Magnetic>
              <Magnetic><a href="/BCC-Buildtech-Company-Profile.pdf" download className="action ghost"><Download />Company profile</a></Magnetic>
            </div>
          </div>

          <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.3fr]">
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="/" aria-label="BCC Buildtech — home" className="inline-block rounded-2xl bg-white px-4 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,.7)]">
                <img src="/bcc/logo.png" alt="BCC Buildtech — Paving Paths to Progress" width={422} height={264} loading="lazy" className="h-20 w-auto sm:h-24" />
              </a>
              <p className="mt-6 max-w-xs text-sm leading-7 text-white/50">Engineering infrastructure. Enabling progress through disciplined execution since 2003.</p>
            </div>
            {cols.map(([t, links]) => (
              <div key={t}>
                <p className="text-[11px] font-bold uppercase tracking-[.18em] text-white/40">{t}</p>
                <ul className="mt-4 space-y-3">
                  {links.map(([l, h]) => <li key={h}><a href={h} className="text-sm text-white/70 transition-colors hover:text-teal-3">{l}</a></li>)}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-white/40">Connect</p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li><a href={`tel:${brand.phone}`} className="flex items-center gap-2.5 hover:text-teal-3"><Phone className="h-4 w-4 text-teal-3" />{brand.phone}</a></li>
                <li><a href={`mailto:${brand.email}`} className="flex items-center gap-2.5 break-all hover:text-teal-3"><Mail className="h-4 w-4 shrink-0 text-teal-3" />{brand.email}</a></li>
                <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-3" />Gurugram, Haryana</li>
                <li><a href={brand.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-teal-3"><Link2 className="h-4 w-4 text-teal-3" />LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/40 md:flex-row md:items-center">
            <span>© {new Date().getFullYear()} BCC Buildtech Limited · Paving Paths to Progress</span>
            <div className="flex flex-wrap items-center gap-5">
              <span>Privacy</span><span>Terms</span><span>Recruitment fraud warning</span>
              <button type="button" onClick={() => window.scrollTo({top: 0, behavior: "smooth"})} aria-label="Back to top" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-teal-3 hover:text-teal-3"><ArrowUp className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: unknown) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function answerAssistant(question: string) {
  const q = question.toLowerCase();
  if (q.includes("project")) return "You can explore BCC's completed and ongoing work on the Projects page.";
  if (q.includes("epc") || q.includes("ham") || q.includes("business")) return "BCC delivers EPC, HAM and Bridges & Structures projects across roads and infrastructure.";
  if (q.includes("contact") || q.includes("enquire") || q.includes("phone")) return "Use the Enquire page to send a project enquiry, or call the BCC team from the Connect section.";
  if (q.includes("career") || q.includes("job")) return "Visit Careers to view opportunities and submit your resume.";
  return "I can help with BCC projects, business capabilities, enquiries and careers. What would you like to explore?";
}

function FloatingAssist() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{from: "bot", text: "Hello. How can I help you explore BCC Buildtech?"}]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const recognition = useRef<VoiceRecognition | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => recognition.current?.stop(), []);

  const submit = (text = draft) => {
    const clean = text.trim();
    if (!clean) return;
    const answer = answerAssistant(clean);
    setMessages(current => [...current, {from: "user", text: clean}, {from: "bot", text: answer}]);
    setDraft("");
  };

  const toggleVoice = () => {
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const speechWindow = window as Window & {SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition};
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setChatOpen(true);
      setMessages(current => [...current, {from: "bot", text: "Voice input is not supported in this browser. You can still use the chat assistant here."}]);
      return;
    }
    const instance = new Recognition();
    instance.lang = "en-IN";
    instance.interimResults = false;
    instance.maxAlternatives = 1;
    instance.onresult = event => {
      const result = event as {results: ArrayLike<ArrayLike<{transcript?: string}>>};
      let text = "";
      for (let i = 0; i < result.results.length; i++) text += result.results[i]?.[0]?.transcript ?? "";
      if (text.trim()) {
        submit(text);
        if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(answerAssistant(text)));
      }
    };
    instance.onerror = () => setListening(false);
    instance.onend = () => setListening(false);
    recognition.current = instance;
    setChatOpen(true);
    setListening(true);
    instance.start();
  };

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.section initial={{opacity: 0, y: 18, scale: .96}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: 18, scale: .96}} className="fixed bottom-22 right-3 z-70 flex w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-white/15 bg-ink/95 text-white shadow-[0_24px_70px_-24px_rgba(0,0,0,.7)] backdrop-blur-xl sm:bottom-24 sm:right-5">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-(image:--brand-grad)"><Bot className="h-4 w-4" /></span><div><p className="text-sm font-semibold">BCC assistant</p><p className="text-[11px] text-white/50">Quick answers about BCC</p></div></div>
              <button type="button" onClick={() => setChatOpen(false)} aria-label="Close assistant" className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="scrollbar-none flex max-h-65 flex-col gap-2 overflow-y-auto px-4 py-3" aria-live="polite">
              {messages.map((message, i) => <p key={`${message.from}-${i}`} className={cx("max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5", message.from === "user" ? "self-end bg-teal text-white" : "self-start bg-white/10 text-white/80")}>{message.text}</p>)}
            </div>
            <form onSubmit={event => {event.preventDefault(); submit();}} className="flex gap-2 border-t border-white/10 p-3">
              <input value={draft} onChange={event => setDraft(event.target.value)} aria-label="Ask BCC assistant" placeholder="Ask about projects..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-teal-3" />
              <button type="submit" aria-label="Send message" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal text-white hover:bg-teal-2"><Send className="h-4 w-4" /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <div className="fixed bottom-4 right-3 z-70 flex items-center gap-2 sm:bottom-5 sm:right-5">
        <button type="button" onClick={() => setChatOpen(open => !open)} aria-label={chatOpen ? "Close chat assistant" : "Open chat assistant"} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-ink/90 text-white shadow-[0_14px_35px_-12px_rgba(0,0,0,.8)] backdrop-blur-lg transition-transform hover:-translate-y-1"><MessageCircle className="h-5 w-5" /></button>
        <button type="button" onClick={toggleVoice} aria-label={listening ? "Stop voice assistant" : "Start voice assistant"} className={cx("grid h-12 w-12 place-items-center rounded-full text-white shadow-[0_14px_35px_-12px_rgba(0,0,0,.8)] transition-transform hover:-translate-y-1", listening ? "bg-rose-600" : "bg-(image:--brand-grad)")}><Mic className="h-5 w-5" /></button>
        {listening && <span className="sr-only" aria-live="assertive">Listening</span>}
      </div>
      <AnimatePresence>
        {showTop && <motion.button initial={{opacity: 0, x: -12}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -12}} type="button" onClick={() => window.scrollTo({top: 0, behavior: "smooth"})} aria-label="Back to top" className="fixed bottom-4 left-3 z-70 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-ink/90 text-white shadow-[0_14px_35px_-12px_rgba(0,0,0,.8)] backdrop-blur-lg transition-transform hover:-translate-y-1 sm:bottom-5 sm:left-5"><ArrowUp className="h-5 w-5" /></motion.button>}
      </AnimatePresence>
    </>
  );
}

export function Shell({children, backdrop}: {children: React.ReactNode; backdrop: BackdropConfig}) {
  const [active, setActive] = useState(0);
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {stiffness: 140, damping: 30, restDelta: 0.001});
  useEffect(() => {
    const f = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.(".card, .card-dark") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", f, {passive: true});
    return () => window.removeEventListener("pointermove", f);
  }, []);
  return (
    <BackdropCtx.Provider value={{...backdrop, active, setActive}}>
      <Preloader />
      <CursorGlow />
      <motion.div aria-hidden style={{scaleX, background: "var(--brand-grad)"}} className="fixed inset-x-0 top-0 z-80 h-0.75 origin-left" />
      <Backdrop />
      <Header />
      <FloatingAssist />
      <div className="site-stack">
        {children}
        <Footer />
      </div>
    </BackdropCtx.Provider>
  );
}

/* ------------------------------------------------------------------
   Sections
------------------------------------------------------------------- */
function ScaleStrip() {
  const stats = [["Approx. ₹900+ Cr", "Order book"], ["200+", "Fleet size"], ["Approx. 40", "Completed projects"], ["20+", "Years of delivery"]];
  return (
    <motion.section id="scale" initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{duration: 0.9, ease: EASE}} className="float-panel panel-glass on-dark">
      <div className="wrap">
        <div className="overflow-hidden">
        <div className="-mb-px -mr-px grid grid-cols-2 md:grid-cols-4">
          {stats.map(([v, l], i) => (
            <motion.div key={l} initial={{opacity: 0, y: 24}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{delay: i * 0.08, duration: 0.8, ease: EASE}} className="group relative border-b border-r border-white/10 px-5 py-7 transition-colors hover:bg-white/4 sm:px-7 sm:py-9">
              <b className="block whitespace-nowrap font-display text-[1.6rem] font-semibold tracking-tight text-white sm:text-4xl lg:text-[1.85rem] 2xl:text-4xl"><span className="grad-text-light">{v}</span></b>
              <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[.16em] text-white/55">{l}</span>
              <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-0 bg-(image:--brand-grad) transition-all duration-700 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
        </div>
        <p className="px-5 py-3.5 text-[11px] text-white/45 sm:px-7">Approximate public-facing indicators for orientation; detailed disclosures remain in formal company materials.</p>
      </div>
    </motion.section>
  );
}

function Intro() {
  const features: [typeof Building2, string, string][] = [
    [Building2, "Government infrastructure", "Roads, highways, buildings and structures for central and state agencies."],
    [HardHat, "Integrated delivery", "Planning, mobilisation, construction and handover under one accountable team."],
    [ShieldCheck, "Institutional control", "Quality, safety and project governance embedded from award to completion."],
  ];
  return (
    <Panel tone="light">
      <SectionHead eyebrow="An execution-led company" title="Infrastructure built with discipline." copy="Originating as Bharat Construction Company in 2003, BCC has developed a proven public-infrastructure execution platform serving MoRTH, NHAI, NHIDCL, PWD and other government entities." />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {features.map(([I, t, c], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <article className="card h-full overflow-hidden p-7 lg:p-8">
              <div className="icon-tile"><I /></div>
              <h3 className="mt-12 font-display text-2xl font-semibold tracking-tight">{t}</h3>
              <p className="mt-3 leading-7 text-[#5b676a]">{c}</p>
              <span aria-hidden className="absolute right-6 top-6 font-display text-sm font-semibold text-ink/20">0{i + 1}</span>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href="/about" className="action primary">Our story <ArrowRight /></a>
        <a href="/businesses" className="action outline">What we build</a>
      </div>
    </Panel>
  );
}

function FinancialStrength() {
  const figures: [string, string, string][] = [["FY23", "₹90.50 Cr", "Starting base"], ["FY24", "₹190.93 Cr", "Acceleration"], ["FY25", "₹265.97 Cr", "Current scale"]];
  const signals: [string, string, string][] = [["Growth trajectory", "~71%", "Operating-income CAGR from FY23 to FY25"], ["Profitability", `${financials.ebitdaMargin25}%`, `FY25 EBITDA margin · PAT margin ${financials.patMargin25}%`], ["Balance sheet", `${financials.gearing25}x`, "FY25 overall gearing"], ["Debt protection", `${financials.interestCoverage25}x`, "FY25 interest coverage"]];
  return (
    <>
      <Panel tone="dark" pad={false}>
        <div className="relative isolate overflow-hidden rounded-[30px]">
          <img src="/bcc/financial-strength-hero.png" alt="Aerial highway interchange at dusk" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-65" />
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/85 to-ink/25" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-transparent to-transparent" />
          <div className="grid min-h-145 items-end gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_.95fr] lg:p-16">
            <Reveal>
              <p className="eyebrow on-dark">Financial strength</p>
              <h2 className="mt-5 max-w-3xl font-display text-[clamp(2.7rem,6vw,6.4rem)] font-semibold leading-[.95] tracking-[-.055em] text-white">Scale supported by performance.</h2>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">A disciplined operating platform, improving profitability and a measured capital structure give BCC the footing to deliver larger public-infrastructure programmes.</p>
              <div className="mt-9 flex flex-wrap gap-2">
                <span className="chip panel-glass text-white">FY23–FY25 momentum</span>
                <span className="chip panel-glass text-white">Infomerics rated</span>
                <span className="chip panel-glass text-white">EPC + HAM ready</span>
              </div>
            </Reveal>
            <Reveal delay={0.12} className="rounded-[26px] border border-white/15 bg-ink/45 p-6 backdrop-blur-md sm:p-8">
              <p className="eyebrow on-dark">At a glance</p>
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                {[[`₹${financials.fy25} Cr`, "FY25 operating income"], [`₹${financials.netWorth} Cr`, "Net worth"], [`${financials.ebitdaMargin25}%`, "EBITDA margin"], [`${financials.interestCoverage25}x`, "Interest cover"]].map(([v, l]) => (
                  <div key={l} className="bg-ink/65 p-5"><b className="font-display text-2xl font-semibold text-white sm:text-3xl">{v}</b><span className="mt-2 block text-xs leading-5 text-white/55">{l}</span></div>
                ))}
              </div>
              <a href="/BCC-Buildtech-Credit-Rating-December-2025.pdf" target="_blank" rel="noreferrer" className="action ghost mt-7">View rating report <ArrowRight /></a>
            </Reveal>
          </div>
        </div>
      </Panel>

      <Panel tone="white">
        <SectionHead eyebrow="Performance path" title="A stronger base for the next corridor." copy="Operating income has expanded across the last three reported financial years, with profitability and debt-protection indicators supporting the platform." />
        <div className="relative mt-14">
          <div aria-hidden className="absolute left-0 right-0 top-13 hidden h-px bg-linear-to-r from-ink/10 via-teal to-leaf lg:block" />
          <div className="grid gap-4 lg:grid-cols-3">
            {figures.map(([year, value, note], i) => (
              <Reveal key={year} delay={i * 0.08}>
                <article className={cx("relative overflow-hidden rounded-[26px] border p-7 sm:p-9", i === 2 ? "border-teal/40 bg-ink text-white shadow-[0_24px_70px_-35px_rgba(23,133,133,.75)]" : "border-line bg-paper")}>
                  <div className="flex items-center justify-between"><span className={cx("chip", i === 2 ? "bg-white/10 text-white" : "bg-white text-ink")}>{year}</span><span className={cx("grid h-10 w-10 place-items-center rounded-full font-display text-sm font-semibold", i === 2 ? "bg-teal-3 text-ink" : "bg-ink text-white")}>0{i + 1}</span></div>
                  <b className="mt-16 block font-display text-4xl font-semibold tracking-tight sm:text-5xl">{value}</b>
                  <p className={cx("mt-3 text-sm font-semibold uppercase tracking-[.14em]", i === 2 ? "text-teal-3" : "text-teal-2")}>{note}</p>
                  <div className={cx("mt-8 h-1.5 rounded-full", i === 2 ? "bg-white/15" : "bg-ink/10")}><motion.div initial={{width: 0}} whileInView={{width: `${45 + i * 25}%`}} viewport={{once: true}} transition={{duration: 1, delay: i * 0.12, ease: EASE}} className={cx("h-full rounded-full", i === 2 ? "bg-(image:--brand-grad)" : "bg-ink")} /></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map(([label, value, copy]) => <Reveal key={label}><article className="card p-6"><span className="eyebrow">{label}</span><b className="mt-7 block font-display text-4xl font-semibold tracking-tight">{value}</b><p className="mt-3 text-sm leading-6 text-steel">{copy}</p></article></Reveal>)}
        </div>
      </Panel>

      <Panel tone="dark">
        <SectionHead eyebrow="Credit profile" title="Capacity with guardrails." copy="The credit view is a combination of execution scale, operating profitability and a capital structure designed to support responsible growth." />
        <div className="mt-14 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal className="card-dark p-7 sm:p-9">
            <p className="eyebrow on-dark">External assessment</p>
            <div className="mt-7 border-b border-white/10 pb-7"><small className="text-white/50">Long-term facilities</small><b className="mt-2 block font-display text-3xl font-semibold text-white">{rating.longTerm}</b></div>
            <div className="border-b border-white/10 py-7"><small className="text-white/50">Short-term facilities</small><b className="mt-2 block font-display text-3xl font-semibold text-white">{rating.shortTerm}</b></div>
            <p className="mt-7 text-sm leading-6 text-white/50">Rated by Infomerics · {rating.date}</p>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-4 sm:grid-cols-2">
            {[["Order book", `Approx. ₹${financials.orderBook} Cr`, "Visible opportunity across active and awarded work"], ["Rated facilities", rating.facilities, "Banking relationships supporting execution"], ["Operating model", "EPC + HAM", "Integrated delivery with long-horizon capability"], ["Control system", "Measured", "Planning, QA/QC and safety discipline on site"]].map(([t, v, c]) => <article key={t} className="card-dark p-7"><span className="text-[11px] font-bold uppercase tracking-[.16em] text-teal-3">{t}</span><b className="mt-8 block font-display text-3xl font-semibold text-white">{v}</b><p className="mt-3 text-sm leading-6 text-white/55">{c}</p></article>)}
          </Reveal>
        </div>
      </Panel>
    </>
  );
}

function HomeProofStrip() {
  const items = [["EPC delivery", "Engineering, procurement and construction under one accountable team."], ["HAM readiness", "Selective hybrid annuity capability for long-life corridors."], ["Public-sector discipline", "Execution aligned to NHAI, NHIDCL, PWD and corridor standards."], ["Built to connect", "Roads, bridges and structures that keep regions moving."]];
  return (
    <motion.section initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{duration: 0.9, ease: EASE}} className="float-panel panel-glass on-dark">
      <div className="wrap grid gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([title, copy], i) => <div key={title} className="bg-ink/55 p-6 sm:p-7"><span className="font-display text-sm font-semibold text-teal-3">0{i + 1}</span><h2 className="mt-8 font-display text-xl font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-white/55">{copy}</p></div>)}
      </div>
    </motion.section>
  );
}

function ModelCompare({initial = "EPC"}: {initial?: "EPC" | "HAM"}) {
  const [mode, setMode] = useState<"EPC" | "HAM">(initial);
  const data = {
    EPC: {title: "Engineering, Procurement & Construction", copy: "Integrated responsibility from engineering coordination and mobilisation through construction, quality control and handover.", steps: ["Plan", "Procure", "Mobilise", "Construct", "Handover"]},
    HAM: {title: "Hybrid Annuity Model", copy: "Long-horizon delivery combining government support, private execution, contractual discipline and asset-performance responsibility.", steps: ["Evaluate", "Finance", "Construct", "Commission", "Maintain"]},
  }[mode];
  return (
    <Panel tone="dark">
      <SectionHead eyebrow="Delivery models" title="EPC discipline. HAM readiness." copy="A clear view of how responsibilities, timelines and long-term commitments change by delivery model." />
      <div className="mt-12 inline-flex rounded-full border border-white/12 bg-white/5 p-1.5" role="tablist" aria-label="Delivery model">
        {(["EPC", "HAM"] as const).map(x => (
          <button key={x} type="button" role="tab" aria-selected={mode === x} onClick={() => setMode(x)} className={cx("relative rounded-full px-8 py-3 font-display text-lg font-semibold transition-colors sm:px-10", mode === x ? "text-white" : "text-white/55 hover:text-white")}>
            {mode === x && <motion.span layoutId="model-pill" transition={{type: "spring", stiffness: 380, damping: 32}} className="absolute inset-0 rounded-full bg-(image:--brand-grad) shadow-[0_10px_30px_-10px_rgba(23,133,133,.9)]" />}
            <span className="relative">{x}</span>
          </button>
        ))}
      </div>
      <motion.div key={mode} initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, ease: EASE}} className="card-dark mt-6 p-6 sm:p-9 lg:p-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-3">{mode} model</p>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h3>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">{data.copy}</p>
        <ol className="relative mt-12 grid gap-4 md:grid-cols-5 md:gap-0">
          <span aria-hidden className="absolute left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-linear-to-r from-leaf-2 via-teal-3 to-teal md:block" />
          <span aria-hidden className="absolute bottom-5 left-5 top-5 w-px bg-linear-to-b from-leaf-2 to-teal md:hidden" />
          {data.steps.map((s, i) => (
            <motion.li key={s} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.08 * i, ease: EASE}} className="relative flex items-center gap-4 md:block">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-teal-3/50 bg-ink font-display text-sm font-semibold text-teal-3">0{i + 1}</span>
              <b className="block font-display text-lg font-semibold md:mt-5">{s}</b>
            </motion.li>
          ))}
        </ol>
      </motion.div>
    </Panel>
  );
}

const PINS = [
  {n: "Haryana", x: 29, y: 31, hq: true},
  {n: "Himachal Pradesh", x: 33, y: 17},
  {n: "Madhya Pradesh", x: 40, y: 58},
  {n: "Meghalaya", x: 70, y: 44},
  {n: "Manipur", x: 80, y: 60},
  {n: "Nagaland", x: 80, y: 40},
];
function PresenceMap() {
  const [state, setState] = useState("Meghalaya");
  const p = projects.find(x => x.state === state)!;
  const count = (s: string) => projects.filter(x => x.state === s).length;
  const hq = PINS[0];
  return (
    <Panel tone="glass" id="presence">
      <SectionHead eyebrow="Market presence" title="A six-state project footprint." copy="Select a state to review its project record, delivery model, employer and disclosed contract value." />
      <div className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PINS.map(s => (
          <button key={s.n} type="button" onClick={() => setState(s.n)} aria-pressed={state === s.n} className={cx("shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all", state === s.n ? "border-transparent bg-white text-ink" : "border-white/15 text-white/70 hover:border-white/40 hover:text-white")}>
            {s.n} <span className="ml-1 opacity-50">{count(s.n)}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-90 overflow-hidden rounded-[26px] border border-white/10 bg-ink/60 sm:min-h-120">
          <div className="dot-grid absolute inset-0" />
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs><linearGradient id="arc" x1="0" x2="1"><stop offset="0" stopColor="#b7d38c" /><stop offset="1" stopColor="#5cc4bf" /></linearGradient></defs>
            {PINS.slice(1).map(s => {
              const on = s.n === state;
              const dx = s.x - hq.x, dy = s.y - hq.y, len = Math.hypot(dx, dy) || 1;
              const bend = dx >= 0 ? -0.28 : 0.28;
              const d = `M${hq.x} ${hq.y} Q${(hq.x + s.x) / 2 - (dy / len) * len * bend} ${(hq.y + s.y) / 2 + (dx / len) * len * bend} ${s.x} ${s.y}`;
              return <motion.path key={s.n + (on ? "-on" : "")} d={d} fill="none" stroke={on ? "url(#arc)" : "rgba(255,255,255,.16)"} strokeWidth={on ? 2.2 : 1} vectorEffect="non-scaling-stroke" initial={{pathLength: 0, opacity: 0}} whileInView={{pathLength: 1, opacity: 1}} viewport={{once: true}} transition={{duration: on ? 1.1 : 1.6, ease: EASE}} />;
            })}
          </svg>
          {PINS.map(s => {
            const on = state === s.n;
            return (
              <button key={s.n} type="button" onClick={() => setState(s.n)} aria-label={`${s.n} projects`} aria-pressed={on} style={{left: `${s.x}%`, top: `${s.y}%`}} className="group absolute -translate-x-1/2 -translate-y-1/2 p-2">
                {on && <span className="pulse-ring absolute inset-0 rounded-full bg-teal-3/40" />}
                <span className={cx("relative block rounded-full border-2 transition-all duration-300", on ? "h-5 w-5 border-white bg-(image:--brand-grad) shadow-[0_0_24px_4px_rgba(92,196,191,.6)]" : "h-3.5 w-3.5 border-white/50 bg-ink-3 group-hover:border-white")} />
                <span className={cx("absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all", on ? "bg-white text-ink" : "hidden text-white/70 sm:block")}>
                  {s.n}{s.hq && <span className="ml-1 text-teal">· HQ</span>}
                </span>
              </button>
            );
          })}
          <p className="absolute bottom-4 left-5 text-[11px] font-semibold uppercase tracking-[.16em] text-white/35">Schematic · not to scale</p>
        </div>

        <motion.div key={state} initial={{opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, ease: EASE}} className="flex flex-col overflow-hidden rounded-[26px] border border-white/10 bg-ink/70">
          <div className="relative h-44 overflow-hidden">
            <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
            <span className="chip absolute left-5 top-5 bg-white/90 text-ink">{p.state}</span>
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h3>
            <p className="mt-4 leading-7 text-white/60">{p.summary}</p>
            <div className="mt-7 grid grid-cols-2 gap-2">
              {[["Employer", p.authority], ["Model", p.model], ["Value", p.value], ["Status", p.status]].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/4 p-4"><small className="text-[11px] font-semibold uppercase tracking-[.12em] text-white/40">{l}</small><b className="mt-1.5 block">{v}</b></div>
              ))}
            </div>
            <a href={`/projects/${p.id}`} className="action primary mt-7 self-start">View credential <ArrowRight /></a>
          </div>
        </motion.div>
      </div>
    </Panel>
  );
}

function StatusChip({status}: {status: string}) {
  const done = status === "Completed";
  return (
    <span className={cx("chip backdrop-blur-md", done ? "bg-white/90 text-leaf" : "bg-teal/90 text-white")}>
      <span className={cx("h-1.5 w-1.5 rounded-full", done ? "bg-leaf" : "animate-pulse bg-white")} />{status}
    </span>
  );
}

function ProjectCard({p}: {p: (typeof projects)[number]}) {
  return (
    <a href={`/projects/${p.id}`} className="card group flex h-full flex-col overflow-hidden rounded-[26px]!">
      <div className="relative aspect-16/11 overflow-hidden bg-ink">
        <img src={p.image} alt={`${p.title} project photography`} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-ink/20" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className="chip bg-ink/60 text-white backdrop-blur-md">{p.state}</span>
          <StatusChip status={p.status} />
        </div>
        <b className="absolute bottom-4 left-5 font-display text-2xl font-semibold text-white">Approx. project scope</b>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">{p.title}</h3>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
          {[["Employer", p.authority], ["Model", p.model], ["Approx. scope", p.length]].map(([l, v]) => (
            <div key={l}><dt className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-steel">{l}</dt><dd className="mt-1 font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-auto pt-7">
          <div className="flex items-center justify-between text-xs font-semibold text-steel"><span>Progress</span><span className="text-ink">{p.progress}%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
            <motion.div initial={{width: 0}} whileInView={{width: `${p.progress}%`}} viewport={{once: true}} transition={{duration: 1.2, ease: EASE}} className="h-full rounded-full bg-(image:--brand-grad)" />
          </div>
        </div>
      </div>
    </a>
  );
}

function ProjectExplorer() {
  const [q, setQ] = useState(""), [state, setState] = useState("All"), [model, setModel] = useState("All"), [status, setStatus] = useState("All");
  const states = ["All", ...new Set(projects.map(p => p.state))];
  const list = useMemo(() => projects.filter(p => (state === "All" || p.state === state) && (model === "All" || p.model === model) && (status === "All" || p.status === status) && (p.title + " " + p.state + " " + p.authority).toLowerCase().includes(q.toLowerCase())), [q, state, model, status]);
  return (
    <Panel tone="light" id="featured">
      <SectionHead eyebrow="Project database" title="Search verified credentials." copy="Nine disclosed projects organised by state, employer, delivery model, status, length and contract value." />
      <div className="mt-12 grid gap-3 rounded-[22px] border border-line bg-white p-3 shadow-[0_20px_50px_-35px_rgba(11,19,21,.4)] md:grid-cols-[1fr_220px_auto]">
        <label className="flex items-center gap-3 rounded-2xl bg-paper px-4">
          <Search className="h-4 w-4 shrink-0 text-steel" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search project, state or employer" aria-label="Search projects" className="min-h-12.5 w-full bg-transparent text-[15px] outline-none placeholder:text-steel" />
        </label>
        <div className="relative">
          <select value={state} onChange={e => setState(e.target.value)} aria-label="Filter by state" className="field h-full appearance-none border-transparent! bg-paper! pr-10 text-[15px]">
            {states.map(x => <option key={x} value={x}>{x === "All" ? "All states" : x}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
        </div>
        <div className="flex rounded-2xl bg-paper p-1" role="group" aria-label="Filter by model">
          {["All", "EPC", "HAM"].map(x => (
            <button key={x} type="button" onClick={() => setModel(x)} aria-pressed={model === x} className={cx("flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all", model === x ? "bg-ink text-white shadow" : "text-steel hover:text-ink")}>{x}</button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by project status">
        {["All", "Ongoing", "Completed"].map(x => <button key={x} type="button" onClick={() => setStatus(x)} aria-pressed={status === x} className={cx("rounded-full border px-4 py-2.5 text-sm font-semibold transition-all", status === x ? "border-ink bg-ink text-white" : "border-line text-steel hover:border-teal hover:text-ink")}>{x === "All" ? "All projects" : x}</button>)}
      </div>
      <p className="mt-5 text-sm text-steel">Showing <b className="text-ink">{list.length}</b> of {projects.length} credentials</p>
      <motion.div layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map(p => (
            <motion.div layout key={p.id} initial={{opacity: 0, scale: 0.96}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.96}} transition={{duration: 0.4, ease: EASE}}>
              <Tilt className="h-full"><ProjectCard p={p} /></Tilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && (
        <div className="rounded-[22px] border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg font-semibold">No matching project record.</p>
          <button type="button" onClick={() => {setQ(""); setState("All"); setModel("All"); setStatus("All");}} className="mt-3 text-sm font-semibold text-teal">Clear filters</button>
        </div>
      )}
    </Panel>
  );
}

function Leadership() {
  return (
    <Panel tone="white">
      <SectionHead eyebrow="Management strength" title="Leadership built on execution experience." copy="A focused four-person leadership team keeps delivery, finance and technical accountability close to the work." />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {leadership.map((x, i) => (
          <Reveal key={x.name} delay={i * 0.06}>
            <article className="card group overflow-hidden p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-ink">
                <img src={x.image} alt={`${x.name}, ${x.role}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/15 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">{x.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-teal-3">{x.role}</p>
                </div>
              </div>
              <div className="px-2 pb-2 pt-4">
                <p className="text-sm leading-6 text-steel">{x.qualification}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function MachineryExplorer() {
  const [cat, setCat] = useState("All");
  const [all, setAll] = useState(false);
  const cats = ["All", ...new Set(machinery.map(x => x[2]))];
  const filtered = machinery.filter(x => cat === "All" || x[2] === cat);
  const shown = all || cat !== "All" ? filtered : filtered.slice(0, 8);
  return (
    <Panel tone="dark" id="machinery">
      <SectionHead eyebrow="Plant & machinery" title="187 disclosed fleet units." copy="Thirty equipment categories spanning asphalt, earthwork, compaction, pavement, materials, concrete, logistics and supporting plant." />
      <Reveal className="mt-12 grid overflow-hidden rounded-[28px] border border-white/10 bg-white/3 lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative min-h-64 overflow-hidden">
          <motion.img src="/bcc/machinery-plant-hd.jpg" alt="BCC machinery and concrete plant" loading="lazy" initial={{scale: 1.3}} whileInView={{scale: 1}} viewport={{once: true}} transition={{duration: 1.8, ease: EASE}} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-ink/40" />
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="eyebrow">Equipment base</p>
          <b className="block font-display text-7xl font-semibold tracking-tight"><span className="grad-text-light"><CountUp value="187" /></span></b>
          <p className="mt-3 text-white/60">machines and equipment units listed in the company profile</p>
          <div className="mt-8 grid grid-cols-2 gap-2">
            {[["42", "Excavators"], ["43", "Dumpers"], ["5", "Motor graders"], ["5", "RMC plants"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/4 p-4"><b className="font-display text-2xl font-semibold text-teal-3">{n}</b><span className="mt-0.5 block text-sm text-white/60">{l}</span></div>
            ))}
          </div>
        </div>
      </Reveal>
      <div className="mt-10 flex gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
        {cats.map(x => (
          <button key={x} type="button" onClick={() => setCat(x)} aria-pressed={cat === x} className={cx("shrink-0 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all", cat === x ? "border-transparent bg-white text-ink" : "border-white/15 text-white/65 hover:border-white/40 hover:text-white")}>{x}</button>
        ))}
      </div>
      <motion.div layout className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {shown.map(([name, make, category, qty]) => (
            <motion.article layout key={name} initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} transition={{duration: 0.4, ease: EASE}} className="card-dark flex flex-col p-6">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/6 text-teal-3"><Factory className="h-5 w-5" /></span>
                <b className="font-display text-4xl font-semibold tracking-tight text-white">{qty}</b>
              </div>
              <h3 className="mt-8 font-display text-lg font-semibold leading-snug">{name}</h3>
              <p className="mt-1.5 text-sm leading-6 text-white/50">{make}</p>
              <small className="mt-auto pt-5 text-[10.5px] font-bold uppercase tracking-[.16em] text-leaf-3/80">{category}</small>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
      {cat === "All" && (
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setAll(!all)} className="action ghost inline-w">{all ? "Show fewer" : `Show all ${machinery.length} categories`}<ChevronDown className={cx("transition-transform", all && "rotate-180")} /></button>
        </div>
      )}
    </Panel>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <form onSubmit={e => {e.preventDefault(); setSent(true);}} className="rounded-[28px] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,19,21,.55)] sm:p-9">
      <h3 className="font-display text-2xl font-semibold tracking-tight">Start a conversation</h3>
      <p className="mt-2 text-sm text-steel">Our Gurugram team typically responds within one business day.</p>
      <div className="grid gap-4 pt-7 sm:grid-cols-2">
        {[["Full name", "text", "name"], ["Business email", "email", "email"], ["Phone number", "tel", "tel"], ["Organization", "text", "organization"]].map(([x, t, ac]) => (
          <label key={x} className="text-[13px] font-semibold text-ink/80">{x}<input required type={t} autoComplete={ac} className="field mt-2" /></label>
        ))}
      </div>
      <label className="mt-4 block text-[13px] font-semibold text-ink/80">Enquiry type
        <span className="relative mt-2 block">
          <select className="field appearance-none pr-10"><option>Business enquiry</option><option>Project partnership</option><option>Vendor registration</option><option>Careers</option></select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
        </span>
      </label>
      <label className="mt-4 block text-[13px] font-semibold text-ink/80">Message<textarea required className="field mt-2 min-h-32 resize-y" /></label>
      <button className="action primary mt-6">Submit enquiry <ArrowRight /></button>
      {sent && <p role="status" className="mt-5 rounded-2xl border-l-4 border-teal bg-teal/[.07] p-4 text-sm">Thank you. Prototype submission captured. Production routing will connect to BCC’s approved mailbox or CRM.</p>}
    </form>
  );
}

function Vision() {
  return (
    <Panel tone="brand" id="mission-vision">
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-7 backdrop-blur-md sm:p-10">
          <div aria-hidden className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-leaf/20 blur-3xl" />
          <div className="relative">
            <p className="eyebrow text-white/85! before:[background:rgba(255,255,255,.7)]!">01 · Mission</p>
            <h2 className="mt-8 max-w-xl font-display text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-.045em] text-white">Build infrastructure people can depend on.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/70">To deliver dependable roads, highways, bridges and public infrastructure through disciplined execution, transparent partnerships, safer sites and respect for the communities we connect.</p>
            <div className="mt-9 flex flex-wrap gap-2">
              {["Execution discipline", "Safer sites", "Long-term trust"].map(x => <span key={x} className="chip border border-white/15 bg-white/10 text-white">{x}</span>)}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="relative overflow-hidden rounded-[28px] bg-white p-7 text-ink sm:p-10">
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-teal/15 to-transparent" />
          <div className="relative">
            <p className="eyebrow">02 · Vision</p>
            <h2 className="mt-8 max-w-xl font-display text-[clamp(2rem,4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-.045em]">Acquire more HAM-centric and EPC projects.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-steel">Build an order book of 5000 Cr and surpass 1000 Cr in scale by 2031 through selective growth, stronger systems and infrastructure that performs for the long term.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {["Selective growth", "EPC + HAM", "2031 horizon"].map((x, i) => <div key={x} className="rounded-2xl border border-line bg-paper p-4"><span className="font-display text-sm font-semibold text-teal-2">0{i + 1}</span><b className="mt-5 block text-sm leading-5">{x}</b></div>)}
            </div>
          </div>
        </Reveal>
      </div>
    </Panel>
  );
}

function Media() {
  const items: [string, string, string][] = [
    ["Project milestones", "Mobilisation, completion and handover moments across active corridors.", IMG.siteCrew],
    ["Engineering & safety", "Methods, materials and site-safety practices from our teams.", IMG.sparks],
    ["People & community", "Stories from our workforce and the communities along our roads.", IMG.hands],
  ];
  return (
    <Panel tone="glass">
      <SectionHead eyebrow="Media centre" title="Progress, documented." copy="Verified milestones, engineering stories, leadership perspectives and community impact." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map(([x, c, img], i) => (
          <Reveal key={x} delay={i * 0.08}>
            <Tilt max={3} className="h-full">
              <article className="card-dark group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-16/10 overflow-hidden">
                  <img src={img} alt="" loading="lazy" className="img-premium h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-ink/80 to-transparent" />
                  <span className="chip absolute left-4 top-4 bg-white/90 text-ink">Update 0{i + 1}</span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{x}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">{c}</p>
                  <p className="mt-auto pt-6 text-xs text-white/35">CMS-ready category awaiting approved stories and photography.</p>
                </div>
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
      <a href={brand.linkedin} target="_blank" rel="noreferrer" className="action ghost mt-9"><Link2 /> Follow on LinkedIn</a>
    </Panel>
  );
}

function Contact() {
  const rows: [typeof MapPin, string, React.ReactNode][] = [
    [MapPin, "Registered office", brand.address],
    [MapPin, "Branch office", "SCO 99, Sector 17, HUDA, Jagadhri, Yamuna Nagar, Haryana 135003"],
    [Phone, "Phone", <a key="p" href={`tel:${brand.phone}`} className="hover:text-teal">{brand.phone}</a>],
    [Mail, "Email", <a key="m" href="mailto:office@bcc-buildtech.com" className="hover:text-teal">office@bcc-buildtech.com</a>],
  ];
  return (
    <Panel tone="light" id="contact">
      <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Office network</p>
          <h2 className="display">Gurugram & Yamuna Nagar</h2>
          <p className="lede mt-5 max-w-md">Business, partnership, vendor, career and media enquiries are handled through our Gurugram head office.</p>
          <div className="mt-10 grid gap-3">
            {rows.map(([I, t, v]) => (
              <div key={t} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal"><I className="h-5 w-5" /></span>
                <div><b className="text-[13px] font-semibold uppercase tracking-widest text-steel">{t}</b><p className="mt-1 leading-7 text-ink">{v}</p></div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}><ContactForm /></Reveal>
      </div>
    </Panel>
  );
}

/* Infinite capability ticker */
function Marquee() {
  const items = ["Highways", "Bridges", "Structures", "EPC", "HAM", "NHIDCL", "MoRTH", "NHAI", "PWD", "Six states", "187 fleet units"];
  return (
    <motion.div aria-hidden initial={{opacity: 0}} whileInView={{opacity: 1}} viewport={{once: true}} transition={{duration: 1}} className="marquee-mask float-panel panel-glass on-dark py-6 sm:py-8">
      <div className="marquee flex w-max">
        {[...items, ...items].map((x, i) => (
          <span key={i} className={cx("flex items-center whitespace-nowrap pr-10 font-display text-3xl font-semibold tracking-[-.03em] sm:pr-14 sm:text-5xl", i % 2 ? "text-outline" : "text-white/90")}>
            {x}
            <svg viewBox="0 0 20 20" className="ml-10 h-4 w-4 sm:ml-14 sm:h-5 sm:w-5"><path d="M10 0 20 10 10 20 0 10Z" fill="url(#mq)" /><defs><linearGradient id="mq" x1="0" x2="1"><stop stopColor="#b7d38c" /><stop offset="1" stopColor="#5cc4bf" /></linearGradient></defs></svg>
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* Statement that lights up word by word as it scrolls through the viewport */
const MANIFESTO = "For more than two decades we have turned *difficult* *terrain* into *dependable* *connectivity* — from the hills of the North-East to the plains of Haryana and the heart of India.";
function ScrollWord({children, progress, range, accent}: {children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return <motion.span style={{opacity, y}} className={cx("inline-block", accent && "grad-text-light")}>{children}&nbsp;</motion.span>;
}
function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const {scrollYProgress} = useScroll({target: ref, offset: ["start 0.85", "end 0.45"]});
  const words = MANIFESTO.split(" ");
  return (
    <Panel tone="dark">
      <div ref={ref}>
        <p className="eyebrow">Our promise</p>
        <p className="max-w-6xl font-display text-[clamp(1.75rem,4.2vw,3.9rem)] font-semibold leading-[1.18] tracking-[-.03em]">
          {words.map((w, i) => {
            const accent = w.startsWith("*");
            const text = w.replace(/\*/g, "");
            return reduce
              ? <span key={i} className={cx(accent && "grad-text-light")}>{text} </span>
              : <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} accent={accent}>{text}</ScrollWord>;
          })}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-5">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white p-2"><img src="/bcc/logo-mark.png" alt="" className="h-full w-full object-contain" /></span>
          <div><b className="block font-display text-lg">BCC Buildtech Limited</b><span className="text-sm text-white/55">Paving paths to progress · since 2003</span></div>
        </div>
      </div>
    </Panel>
  );
}

/* Pinned horizontal showcase on desktop, swipe carousel on touch screens */
const CORRIDOR_IDS = ["akegwo-avangkhu", "maram-peren", "nh40-meghalaya", "narmadapuram-timarni", "kesri-bihta-rob", "nh72-himachal"];
function CorridorCard({p, i, className}: {p: (typeof projects)[number]; i: number; className?: string}) {
  return (
    <a href={`/projects/${p.id}`} className={cx("group relative block shrink-0 overflow-hidden rounded-[30px] border border-white/15 bg-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]", className)}>
      <img src={p.image} alt={`${p.title} project`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-[1.4s] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-ink/10" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <span className="font-display text-sm font-semibold text-white/70">0{i + 1}</span>
        <StatusChip status={p.status} />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <span className="chip panel-glass text-white">{p.state} · {p.model}</span>
        <h3 className="mt-4 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-[1.7rem]">{p.title}</h3>
        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/15 pt-5">
          <div><small className="text-[10.5px] font-bold uppercase tracking-[.16em] text-white/50">Approx. project scope</small><b className="mt-1 block font-display text-2xl font-semibold"><span className="grad-text-light">Approx. scope</span></b></div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-ink transition-all duration-500 group-hover:-rotate-45 group-hover:bg-teal-3"><ArrowRight className="h-5 w-5" /></span>
        </div>
      </div>
    </a>
  );
}
function CorridorsHead() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className="eyebrow on-dark">Signature corridors</p>
        <h2 className="display max-w-3xl text-white"><SplitWords inView segments={[{text: "Roads that climb,"}, {text: "cross and connect.", className: "grad-text-light"}]} /></h2>
      </div>
      <a href="/projects" className="action ghost inline-w">All credentials <ArrowRight /></a>
    </div>
  );
}
function Corridors() {
  const reduce = useReducedMotion();
  const list = CORRIDOR_IDS.map(id => projects.find(p => p.id === id)!).filter(Boolean);
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const measure = () => {if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));};
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {ro.disconnect(); window.removeEventListener("resize", measure);};
  }, []);
  const {scrollYProgress} = useScroll({target: ref, offset: ["start start", "end end"]});
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const carousel = (
    <section className={cx("relative", !reduce && "lg:hidden")}>
      <div className="px-5 sm:px-8"><CorridorsHead /></div>
      <div className="scrollbar-none mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:px-8">
        {list.map((p, i) => <CorridorCard key={p.id} p={p} i={i} className="h-115 w-[82vw] max-w-105 snap-start" />)}
      </div>
    </section>
  );
  if (reduce) return carousel;
  return (
    <>
      {carousel}
      <section ref={ref} className="relative hidden lg:block" style={{height: `calc(100vh + ${dist}px)`}}>
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-24">
          <div className="wrap px-12"><CorridorsHead /></div>
          <motion.div ref={track} style={{x}} className="mt-8 flex w-max gap-6 pl-[max(3rem,calc((100vw-1440px)/2+3rem))] pr-12">
            {list.map((p, i) => (
              <Tilt key={p.id} max={4}>
                <CorridorCard p={p} i={i} className="h-[min(56vh,560px)] w-[min(34vw,480px)]" />
              </Tilt>
            ))}
            <a href="/projects" className="group relative flex h-[min(56vh,560px)] w-[min(28vw,380px)] shrink-0 flex-col justify-between overflow-hidden rounded-[30px] bg-(image:--brand-grad-deep) p-8 text-white">
              <Facets />
              <span className="relative font-display text-sm font-semibold text-white/70">+{projects.length - list.length} more</span>
              <div className="relative">
                <h3 className="font-display text-4xl font-semibold leading-tight tracking-tight">Explore all {projects.length} disclosed credentials</h3>
                <span className="mt-8 grid h-14 w-14 place-items-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:translate-x-2"><ArrowRight className="h-5 w-5" /></span>
              </div>
            </a>
          </motion.div>
          <div className="wrap mt-8 px-12">
            <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10"><motion.div style={{width: bar}} className="h-full bg-(image:--brand-grad)" /></div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------
   Page building blocks
------------------------------------------------------------------- */
const HOME_IMAGES = ["/bcc/home-road-generated.png", "/bcc/home-bridge-generated.png", "/bcc/home-construction-generated.png", "/bcc/project-nagaland-hd.jpg", "/bcc/hero-asphalt-hd.jpg"];
const isDark = (t: Tone) => t === "dark" || t === "glass" || t === "brand";

type Feature = {title: string; copy: string; image: string; href?: string; tag?: string};

/* Image-led card grid */
function FeatureGrid({eyebrow, title, copy, items, tone = "light", id}: {eyebrow: string; title: string; copy?: string; items: Feature[]; tone?: Tone; id?: string}) {
  const dark = isDark(tone);
  const cols = items.length === 4 ? "lg:grid-cols-4" : items.length === 5 ? "lg:grid-cols-5" : items.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <Panel tone={tone} id={id}>
      <SectionHead eyebrow={eyebrow} title={title} copy={copy} />
      <div className={cx("mt-14 grid gap-5 sm:grid-cols-2", cols)}>
        {items.map((f, i) => {
          const body = (
            <>
              <div className="relative aspect-4/3 overflow-hidden bg-ink">
                <img src={f.image} alt="" loading="lazy" className="img-premium h-full w-full object-cover transition duration-[1.4s] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-ink/60 via-transparent to-transparent" />
                <span className="chip absolute left-4 top-4 bg-white/90 text-ink backdrop-blur-md">{f.tag ?? `0${i + 1}`}</span>
              </div>
              <div className="flex flex-1 flex-col p-6 lg:p-7">
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight lg:text-2xl">{f.title}</h3>
                <p className={cx("mt-3 text-sm leading-6", dark ? "text-white/60" : "text-steel")}>{f.copy}</p>
                {f.href && <span className={cx("mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold", dark ? "text-teal-3" : "text-teal")}>Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>}
              </div>
            </>
          );
          const cls = cx(dark ? "card-dark" : "card", "group flex h-full flex-col overflow-hidden rounded-[26px]!");
          return (
            <Reveal key={f.title} delay={i * 0.06}>
              <Tilt max={3} className="h-full">
                {f.href ? <a href={f.href} className={cls}>{body}</a> : <article className={cls}>{body}</article>}
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </Panel>
  );
}

/* Editorial image + copy split with parallax photography */
function SplitFeature({id, tone = "white", eyebrow, title, copy, points, image, reverse = false, cta, stat}: {id?: string; tone?: Tone; eyebrow: string; title: string; copy: string; points?: string[]; image: string; reverse?: boolean; cta?: [string, string]; stat?: [string, string]}) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = isDark(tone);
  const {scrollYProgress} = useScroll({target: ref, offset: ["start end", "end start"]});
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  return (
    <Panel tone={tone} id={id}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div ref={ref} className={cx("relative aspect-5/4 overflow-hidden rounded-[28px] bg-ink shadow-[0_40px_80px_-45px_rgba(11,19,21,.7)] lg:aspect-4/5", reverse && "lg:order-2")}>
          <motion.img src={image} alt="" loading="lazy" style={{y, scale: 1.18}} className="img-premium absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink/55 via-transparent to-transparent" />
          {stat && (
            <div className="panel-glass absolute bottom-5 left-5 rounded-2xl px-5 py-4 text-white">
              <b className="block font-display text-3xl font-semibold"><span className="grad-text-light"><CountUp value={stat[0]} /></span></b>
              <small className="mt-1 block text-[11px] font-bold uppercase tracking-[.14em] text-white/70">{stat[1]}</small>
            </div>
          )}
        </div>
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display"><SplitWords inView segments={[{text: title}]} /></h2>
          <p className="lede mt-6 max-w-xl">{copy}</p>
          {points && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {points.map(pt => (
                <li key={pt} className={cx("flex items-start gap-3 rounded-2xl border p-4 text-[15px] leading-6", dark ? "border-white/10 bg-white/4 text-white/80" : "border-line bg-paper text-ink/85")}>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-(image:--brand-grad) text-white"><Check className="h-3.5 w-3.5" /></span>{pt}
                </li>
              ))}
            </ul>
          )}
          {cta && <a href={cta[1]} className="action primary mt-9">{cta[0]} <ArrowRight /></a>}
        </Reveal>
      </div>
    </Panel>
  );
}

/* Numbered process with a sticky heading */
function ProcessSteps({eyebrow, title, steps, tone = "white"}: {eyebrow: string; title: string; steps: [string, string][]; tone?: Tone}) {
  const dark = isDark(tone);
  return (
    <Panel tone={tone}>
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display"><SplitWords inView segments={[{text: title}]} /></h2>
        </div>
        <ol className="relative">
          <span aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-linear-to-b from-leaf-2 via-teal to-transparent" />
          {steps.map(([t, c], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <li className="relative flex gap-6 pb-10 last:pb-0">
                <span className={cx("relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border font-display text-sm font-semibold", dark ? "border-teal-3/40 bg-ink text-teal-3" : "border-teal/30 bg-white text-teal")}>0{i + 1}</span>
                <div className={cx("flex-1 rounded-[22px] border p-6 lg:p-7", dark ? "border-white/10 bg-white/4" : "border-line bg-paper")}>
                  <h3 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">{t}</h3>
                  <p className={cx("mt-2 leading-7", dark ? "text-white/60" : "text-steel")}>{c}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

/* Home bento linking out to the main pages */
function ExploreGrid() {
  const items = [
    {title: "Businesses", copy: "Highways, bridges and structures delivered under EPC, with HAM readiness.", href: "/businesses", image: IMG.bridge},
    {title: "Projects", copy: "Nine disclosed credentials across six states.", href: "/projects", image: IMG.mountainRoad},
      {title: "Capabilities", copy: "Approx. 200+ fleet size and specialised site teams.", href: "/capabilities", image: IMG.paving},
    {title: "Financial strength", copy: "Audited growth and an IVR BBB+ / Stable rating.", href: "/financials", image: IMG.tower},
    {title: "Leadership", copy: "Decades of execution experience at the top.", href: "/leadership", image: IMG.engineers},
  ];
  return (
    <Panel tone="light">
      <SectionHead eyebrow="Explore BCC" title="Everything we build, one click away." copy="Dive into our businesses, credentials, capabilities, finances and the people who lead them." />
      <div className="mt-14 grid gap-4 md:h-170 md:grid-cols-4 md:grid-rows-2">
        {items.map((it, i) => (
          <Reveal key={it.href} delay={i * 0.06} className={cx("h-80 md:h-auto", i === 0 && "md:col-span-2 md:row-span-2")}>
            <a href={it.href} className="group relative block h-full overflow-hidden rounded-[26px] bg-ink">
              <img src={it.image} alt="" loading="lazy" className="img-premium absolute inset-0 h-full w-full object-cover transition duration-[1.6s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/25 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
              <span className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-teal-3"><ArrowUpRight className="h-5 w-5" /></span>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <span className="font-display text-sm font-semibold text-white/60">0{i + 1}</span>
                <h3 className={cx("mt-2 font-display font-semibold tracking-tight", i === 0 ? "text-3xl sm:text-5xl" : "text-2xl")}>{it.title}</h3>
                <p className={cx("mt-2 text-white/70", i === 0 ? "max-w-md text-base leading-7" : "text-sm leading-6")}>{it.copy}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

/* Bottom-of-page navigation to related pages */
const PAGE_LABEL: Record<string, string> = {
  about: "About BCC", leadership: "Leadership", financials: "Financial strength", "vision-2031": "Vision 2031", businesses: "Our businesses", epc: "EPC expertise", ham: "HAM capability", projects: "Projects", capabilities: "Capabilities", "quality-safety-sustainability": "Quality, safety & sustainability", csr: "CSR", media: "Media centre", careers: "Careers", contact: "Enquire",
};
function ContinueExploring({slugs}: {slugs: string[]}) {
  return (
    <Panel tone="glass">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Continue exploring</p>
          <h2 className="display text-white"><SplitWords inView segments={[{text: "Where to"}, {text: "next?", className: "grad-text-light"}]} /></h2>
        </div>
        <a href="/contact" className="action primary inline-w">Talk to our team <ArrowRight /></a>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {slugs.map((s, i) => (
          <Reveal key={s} delay={i * 0.07}>
            <a href={`/${s}`} className="group relative block h-72 overflow-hidden rounded-[26px] border border-white/10 bg-ink">
              <img src={pageMeta[s].image} alt="" loading="lazy" className="img-premium absolute inset-0 h-full w-full object-cover opacity-80 transition duration-[1.4s] ease-out group-hover:scale-110 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                <div>
                  <small className="text-[10.5px] font-bold uppercase tracking-[.16em] text-teal-3">{pageMeta[s].eyebrow}</small>
                  <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-white">{PAGE_LABEL[s]}</h3>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:-rotate-45"><ArrowRight className="h-4 w-4" /></span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function Timeline() {
  const items = [["2003", "Bharat Construction Company established"], ["2023", "Reconstituted as a private limited company"], ["2025", "Converted to BCC Buildtech Limited"], ["2031", "Strategic growth horizon"]];
  return (
    <div className="relative mt-14 grid gap-4 md:grid-cols-4">
      {items.map(([a, b], i) => (
        <Reveal key={a} delay={i * 0.08}>
          <div className="card h-full p-7">
            <b className={cx("font-display text-5xl font-semibold tracking-tight", i === 3 ? "grad-text" : "text-ink")}>{a}</b>
            <span className="mt-5 block h-2.5 w-2.5 rounded-full bg-(image:--brand-grad) ring-4 ring-teal/15" />
            <p className="mt-8 leading-7 text-steel">{b}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function CapabilityIntro() {
  const items: [typeof Users, string, string][] = [
    [Users, "Management", "Senior leaders with 18 to 45 years of experience across projects, technical, finance and plant."],
    [Factory, "Machinery", "187 disclosed units, from hot-mix plants and sensor pavers to crushers and RMC plants."],
    [HardHat, "Manpower", "34 key personnel listed, supported by site engineers, supervisors and skilled crews."],
    [ShieldCheck, "Systems", "Planning, QA/QC and safety controls applied consistently from site to head office."],
  ];
  return (
    <Panel tone="light" id="people">
      <SectionHead eyebrow="Four execution pillars" title="Ready at project scale." copy="Every BCC project is underwritten by the same four pillars: leadership, fleet, people and process." />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([I, x, c], i) => (
          <Reveal key={x} delay={i * 0.06}>
            <article className="card h-full p-7">
              <div className="icon-tile"><I /></div>
              <h3 className="mt-14 font-display text-2xl font-semibold tracking-tight">{x}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">{c}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function RatingHighlights() {
  const items: [string, string, string][] = [
    ["Sustained growth", "~71%", "Operating-income CAGR, FY23 to FY25"],
    ["Healthy profitability", `${financials.ebitdaMargin25}%`, `EBITDA margin in FY25 · PAT margin ${financials.patMargin25}%`],
    ["Comfortable capital structure", `${financials.gearing25}x`, "Overall gearing, FY25"],
    ["Debt protection", `${financials.interestCoverage25}x`, "Interest coverage, FY25"],
  ];
  return (
    <Panel tone="dark">
      <SectionHead eyebrow="Rating rationale" title="What the credit rating recognises." copy={`Infomerics rates BCC’s long-term facilities ${rating.longTerm} and short-term facilities ${rating.shortTerm} (${rating.date}). These are the strengths behind it.`} />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([t, v, c], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <article className="card-dark h-full p-7">
              <span className="text-[11px] font-bold uppercase tracking-[.16em] text-teal-3">{t}</span>
              <b className="mt-10 block font-display text-5xl font-semibold tracking-tight"><span className="grad-text-light"><CountUp value={v} /></span></b>
              <p className="mt-3 text-sm leading-6 text-white/55">{c}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function Documents() {
  const docs: [string, string, string][] = [
    ["Company profile", "Credentials, fleet, leadership and financial overview.", "/BCC-Buildtech-Company-Profile.pdf"],
    ["Credit rating report", `Infomerics rating rationale · ${rating.date}.`, "/BCC-Buildtech-Credit-Rating-December-2025.pdf"],
  ];
  return (
    <Panel tone="white">
      <SectionHead eyebrow="Disclosures" title="Documents for due diligence." />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {docs.map(([t, c, href], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <a href={href} target="_blank" rel="noreferrer" className="card group flex items-center gap-6 p-6 sm:p-8">
              <span className="icon-tile shrink-0"><Download /></span>
              <div className="flex-1"><h3 className="font-display text-xl font-semibold tracking-tight">{t}</h3><p className="mt-1 text-sm text-steel">{c}</p></div>
              <span className="hidden text-xs font-bold uppercase tracking-[.14em] text-teal sm:block">PDF</span>
            </a>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function OfficeMap() {
  return (
    <Panel tone="dark" pad={false}>
      <div className="grid lg:grid-cols-[.8fr_1.2fr]">
        <div className="panel-pad">
          <p className="eyebrow">Head office</p>
          <h2 className="display text-white">JMD Megapolis, Gurugram</h2>
          <p className="lede mt-5">{brand.address}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=JMD+Megapolis+Sohna+Road+Sector+48+Gurugram" target="_blank" rel="noreferrer" className="action ghost mt-8">Get directions <ArrowUpRight /></a>
        </div>
        <iframe title="BCC Buildtech head office location" src="https://www.google.com/maps?q=JMD+Megapolis+Sohna+Road+Sector+48+Gurugram&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-95 w-full border-0 opacity-90 filter-[grayscale(.6)_contrast(1.05)] lg:h-full lg:min-h-130" />
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------
   Pages
------------------------------------------------------------------- */
const VERTICAL_STORIES = [
  {label: "EPC", title: "One accountable team from award to handover.", copy: "Engineering coordination, procurement, earthwork, pavement and structures delivered under one execution rhythm.", image: IMG.paving, href: "/epc"},
  {label: "HAM", title: "Long-life corridors with whole-life thinking.", copy: "Selective hybrid annuity delivery that connects construction discipline with operations and maintenance responsibility.", image: IMG.highway, href: "/ham"},
  {label: "Bridges & Structures", title: "Structures that make the network resilient.", copy: "ROB/LHS, bridge works, retaining structures, drainage and concrete packages integrated into the corridor.", image: IMG.bridge, href: "/businesses#structures"},
];

function VerticalScrollStories() {
  return <Panel tone="light" id="verticals"><SectionHead eyebrow="Our verticals" title="Scroll through the way BCC builds." copy="Explore the business models and project capabilities that connect our cross-segment execution platform." /><div className="mt-14 grid gap-6">{VERTICAL_STORIES.map((x, i) => <Reveal key={x.label} delay={i * 0.05}><a href={x.href} className={cx("group grid overflow-hidden rounded-[28px] bg-ink lg:grid-cols-2", i % 2 === 1 && "lg:[&>div:first-child]:order-2")}><div className="relative min-h-65 overflow-hidden"><motion.img src={x.image} alt={`${x.label} infrastructure delivery`} loading="lazy" whileInView={{scale: 1}} initial={{scale: 1.12}} viewport={{once: true}} transition={{duration: 1.2, ease: EASE}} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-ink/75 via-transparent to-transparent" /><span className="absolute bottom-5 left-5 chip panel-glass text-white">{x.label}</span></div><div className="flex flex-col justify-center p-7 text-white sm:p-10"><p className="eyebrow on-dark">0{i + 1} · Delivery model</p><h3 className="mt-4 font-display text-3xl font-semibold tracking-tight">{x.title}</h3><p className="mt-4 max-w-lg leading-7 text-white/65">{x.copy}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal-3">Explore {x.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div></a></Reveal>)}</div></Panel>;
}

function PrincipalsHighlight() {
  const principals = [["NHAI", "National highways and corridor-scale public infrastructure.", IMG.interchange], ["NHIDCL", "North-East connectivity where terrain and logistics demand discipline.", IMG.mountainRoad], ["PWD", "State road and structure programmes close to communities.", IMG.highway]];
  return <Panel tone="dark" id="principals"><SectionHead eyebrow="Key principals" title="Institutional standards behind every corridor." copy="BCC’s execution platform is aligned with the expectations of national and state infrastructure agencies." /><div className="mt-12 grid gap-4 md:grid-cols-3">{principals.map(([name, copy, image], i) => <Reveal key={name} delay={i * .07}><article className="group relative min-h-75 overflow-hidden rounded-3xl border border-white/10"><img src={image} alt={`${name} infrastructure context`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-linear-to-t from-ink via-ink/20 to-transparent" /><div className="relative flex h-full min-h-75 flex-col justify-end p-6"><span className="font-display text-3xl font-bold text-white">{name}</span><p className="mt-2 text-sm leading-6 text-white/70">{copy}</p><span className="mt-5 text-[11px] font-bold uppercase tracking-[.16em] text-teal-3">Trusted execution</span></div></article></Reveal>)}</div></Panel>;
}

function CareerApplyForm() {
  const [sent, setSent] = useState(false);
  return <Panel tone="light" id="apply"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><Reveal><p className="eyebrow">Apply to BCC</p><h2 className="display">Bring judgement to the site.</h2><p className="lede mt-5">Select a role, share your profile and attach a resume for the team to review.</p></Reveal><form onSubmit={e => {e.preventDefault(); setSent(true);}} className="rounded-[28px] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(11,19,21,.55)] sm:p-9"><div className="grid gap-4 sm:grid-cols-2"><label className="text-[13px] font-semibold text-ink/80">Full name<input required className="field mt-2" /></label><label className="text-[13px] font-semibold text-ink/80">Email<input required type="email" className="field mt-2" /></label><label className="text-[13px] font-semibold text-ink/80">Phone<input required type="tel" className="field mt-2" /></label><label className="text-[13px] font-semibold text-ink/80">Location<input className="field mt-2" /></label></div><label className="mt-4 block text-[13px] font-semibold text-ink/80">Position applying for<select required className="field mt-2"><option value="">Select a position</option><option>Project Manager — Highways</option><option>Planning & Controls Engineer</option><option>Quantity Surveyor</option><option>Site Safety Engineer</option></select></label><label className="mt-4 block text-[13px] font-semibold text-ink/80">Experience<input className="field mt-2" placeholder="e.g. 5 years" /></label><label className="mt-4 block text-[13px] font-semibold text-ink/80">Resume<input required type="file" accept=".pdf,.doc,.docx" className="field mt-2 p-3" /></label><label className="mt-4 block text-[13px] font-semibold text-ink/80">Cover note<textarea className="field mt-2 min-h-28" /></label><button className="action primary mt-6">Submit application <ArrowRight /></button>{sent && <p role="status" className="mt-5 rounded-2xl border-l-4 border-teal bg-teal/[.07] p-4 text-sm">Thank you. Your application is ready for review.</p>}</form></div></Panel>;
}

function AutoStoryGallery({model, images}: {model: string; images: string[]}) {
  const [active, setActive] = useState(0);
  useEffect(() => {const timer = window.setInterval(() => setActive(i => (i + 1) % images.length), 5000); return () => window.clearInterval(timer);}, [images.length]);
  return <Panel tone="dark"><SectionHead eyebrow={`${model} delivery story`} title="Before. During. After." copy="A visual narrative of how disciplined execution moves a corridor from existing conditions to a dependable finished asset." /><div className="mt-12 grid gap-4 md:grid-cols-3">{images.map((src, i) => <motion.div key={src} animate={{opacity: active === i ? 1 : .58, y: active === i ? -6 : 0}} transition={{duration: .7, ease: EASE}} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"><img src={src} alt={`${model} ${["before", "during", "after"][i]} construction`} className="aspect-[1.2] w-full object-cover" /><div className="p-5"><p className="eyebrow on-dark">0{i + 1} · {["Before construction", "During construction", "After completion"][i]}</p></div></motion.div>)}</div><div className="mt-6 flex gap-2">{images.map((_, i) => <button key={i} type="button" aria-label={`Show ${model} stage ${i + 1}`} aria-pressed={active === i} onClick={() => setActive(i)} className={cx("h-2 rounded-full transition-all", active === i ? "w-10 bg-teal-3" : "w-2 bg-white/30")} />)}</div></Panel>;
}

export function HomePage() {
  const home = {eyebrow: "20+ years of infrastructure execution", title: "Building roads. Connecting regions. Accelerating India.", copy: "BCC Buildtech Limited delivers highways, bridges and strategic road infrastructure, backed by an approximate ₹900+ Cr order book and EPC/HAM capability."};
  return (
    <Shell backdrop={{images: HOME_IMAGES}}>
      <main className="site-stack p-0!">
        <Hero meta={home} home />
        <HomeProofStrip />
        <Marquee />
        <Intro />
        <VerticalScrollStories />
        <PrincipalsHighlight />
        <ExploreGrid />
        <Manifesto />
        <Corridors />
        <Vision />
      </main>
    </Shell>
  );
}

const EPC_STEPS: [string, string][] = [
  ["Plan", "Design review, surveys, programme and resource planning aligned to the contract and the employer’s milestones."],
  ["Procure", "Materials, plant and subcontract packages secured against the schedule, with vendor quality checks built in."],
  ["Mobilise", "Camps, batching and hot-mix plants, fleet and site teams established on the corridor."],
  ["Construct", "Earthwork, structures and pavement delivered with QA/QC at every layer and daily progress control."],
  ["Handover", "Testing, as-built documentation and completion to the employer’s acceptance."],
];
const HAM_STEPS: [string, string][] = [
  ["Evaluate", "Corridor, traffic and contractual risk assessed before commitment."],
  ["Finance", "Construction-period funding structured alongside the authority’s support."],
  ["Construct", "The same EPC execution discipline, measured against HAM milestones."],
  ["Commission", "Completion, testing and commercial operation declared."],
  ["Maintain", "Operations and maintenance responsibility through the annuity period."],
];

function pageContent(slug: string): React.ReactNode {
  switch (slug) {
    case "leadership":
      return <>
        <Leadership />
        <SplitFeature tone="light" eyebrow="How we lead" title="Close to the site. Accountable for the outcome." copy="Our leadership stays close to execution, with weekly progress reviews, direct engagement with employers and one owner for every commitment." points={["Hands-on project reviews", "Clear single-point accountability", "Commercial and technical discipline", "Long-standing government relationships"]} image={IMG.workshop} stat={["34", "Key personnel"]} />
        <ContinueExploring slugs={["about", "careers", "financials"]} />
      </>;
    case "financials":
      return <>
        <FinancialStrength />
        <Documents />
        <ContinueExploring slugs={["about", "projects", "leadership"]} />
      </>;
    case "vision-2031":
      return <>
        <Vision />
        <FeatureGrid eyebrow="The five pillars" title="Ambition with guardrails." copy="A roadmap that grows capability and reach without compromising execution quality or governance." items={[
          {title: "Expand EPC order book", copy: "Deepen our core EPC franchise with national and state road agencies.", image: IMG.interchange},
          {title: "Selective HAM portfolio", copy: "Pursue HAM projects where risk, returns and capability align.", image: IMG.highway},
          {title: "Geographic reach", copy: "Build on our six-state footprint with disciplined entry into new markets.", image: IMG.mountainRoad},
          {title: "Assets & technology", copy: "Invest in fleet, plants and digital project controls.", image: IMG.paving},
          {title: "Governance", copy: "Institutionalise systems, reporting and board oversight.", image: IMG.drawings},
        ]} />
        <ContinueExploring slugs={["businesses", "financials", "about"]} />
      </>;
    case "businesses":
      return <>
        <SplitFeature id="roads" eyebrow="Roads & highways" title="Corridors built for decades of traffic." copy="From two-lane widening in the hills of the North-East to four-laning across Haryana, we deliver complete road packages: earthwork, pavement, drainage and road furniture." points={["Two-lane, paved-shoulder and four-lane widening", "DBM, BC and WMM pavement layers", "Hill-road construction in the North-East", "Drainage, retaining walls and road furniture"]} image={IMG.interchange} cta={["View road credentials", "/projects"]} stat={["9", "Disclosed projects"]} />
        <SplitFeature id="structures" tone="dark" reverse eyebrow="Bridges & structures" title="Structures that carry the network." copy="Rail over-bridges, retaining structures and concrete works backed by in-house batching, pumping and placing capacity." points={["ROB/LHS in lieu of rail level crossings", "RMC batching and concrete pumping", "Retaining walls and protection works", "Buildings and structures for public clients"]} image={IMG.bridge} cta={["Explore capabilities", "/capabilities"]} />
        <ModelCompare />
        <FeatureGrid eyebrow="Integrated scope" title="Integrated from mobilisation to handover." items={[
          {title: "Highways & pavement", copy: "Flexible pavement layers laid with sensor pavers and tandem rollers.", image: IMG.paving},
          {title: "Bridges & structures", copy: "Reinforced concrete works from foundations to deck.", image: IMG.rebarAerial},
          {title: "Drainage & protection", copy: "Earthwork, drainage and slope protection for resilient corridors.", image: IMG.earthworks},
          {title: "Planning & controls", copy: "Programmes, quantities and progress tracked against milestones.", image: IMG.drawings},
          {title: "Quality & testing", copy: "Material testing and layer-by-layer inspection.", image: IMG.welding},
          {title: "Safety & environment", copy: "Safe, responsible sites on live corridors.", image: IMG.hardHat},
        ]} />
        <ContinueExploring slugs={["epc", "ham", "projects"]} />
      </>;
    case "epc":
      return <>
        <ModelCompare />
        <AutoStoryGallery model="EPC" images={[IMG.earthworks, IMG.siteCrew, IMG.paving]} />
        <ProcessSteps eyebrow="How EPC works at BCC" title="Five stages. One accountable team." steps={EPC_STEPS} />
        <SplitFeature tone="dark" eyebrow="On the ground" title="Owned from award to handover." copy="One team owns engineering coordination, procurement, construction and quality, so employers get a single point of accountability and a predictable programme." points={["Single-point accountability", "In-house plant and fleet", "Layer-by-layer QA/QC", "Milestone-based reporting"]} image={IMG.siteCrew} stat={["187", "Fleet units"]} />
        <ContinueExploring slugs={["ham", "capabilities", "projects"]} />
      </>;
    case "ham":
      return <>
        <ModelCompare initial="HAM" />
        <AutoStoryGallery model="HAM" images={[IMG.highway, IMG.siteCrew, IMG.interchange]} />
        <ProcessSteps eyebrow="HAM lifecycle" title="Delivery that lasts the whole concession." steps={HAM_STEPS} />
        <SplitFeature tone="dark" reverse eyebrow="HAM credential" title="A live HAM programme in Madhya Pradesh." copy="Narmadapuram–Timarni Road, our ongoing HAM package for MPRDC: upgrading an intermediate-lane road to two lanes with paved shoulders." image={IMG.highway} stat={["₹380 Cr", "Contract value"]} cta={["View credential", "/projects/narmadapuram-timarni"]} />
        <ContinueExploring slugs={["epc", "financials", "projects"]} />
      </>;
    case "projects":
      return <>
        <Corridors />
        <ProjectExplorer />
        <PresenceMap />
        <ContinueExploring slugs={["businesses", "capabilities", "financials"]} />
      </>;
    case "capabilities":
      return <>
        <CapabilityIntro />
        <SplitFeature eyebrow="Built-in quality" title="Quality is a process, not an inspection." copy="Every layer we lay is tested, logged and signed off before the next begins, backed by site laboratories and documented procedures." points={["Material testing at source", "Layer-by-layer sign-off", "Calibrated weighbridges", "Documented inspection records"]} image={IMG.welding} cta={["Quality, safety & sustainability", "/quality-safety-sustainability"]} />
        <ContinueExploring slugs={["quality-safety-sustainability", "projects", "careers"]} />
      </>;
    case "quality-safety-sustainability":
      return <>
        <FeatureGrid id="quality" eyebrow="QHSE framework" title="Controls that live on site." copy="Quality, health, safety and environment are managed as one system, applied the same way on every corridor." items={[
          {title: "Quality management", copy: "Material testing, layer-by-layer QA/QC and documented inspections at every stage.", image: IMG.welding},
          {title: "Health & safety", copy: "PPE, toolbox talks, traffic management and permit-to-work discipline on live roads.", image: IMG.hardHat},
          {title: "Environmental controls", copy: "Dust, water, waste and slope management built into site planning.", image: IMG.forest},
          {title: "Policies & certification", copy: "Management-approved policies and certifications will be published here.", image: IMG.drawings},
        ]} />
        <SplitFeature id="environment" tone="dark" eyebrow="Sustainability" title="Responsible construction, corridor by corridor." copy="Roads last for generations, and so does their footprint. We plan every site to reduce disturbance and leave the landscape stable." points={["Dust suppression and water management", "Topsoil conservation and slope protection", "Responsible disposal of construction waste", "Compliance with project environmental conditions"]} image={IMG.hills} />
        <ContinueExploring slugs={["capabilities", "csr", "careers"]} />
      </>;
    case "csr":
      return <>
        <FeatureGrid eyebrow="Focus areas" title="Every initiative, measured." copy="Our CSR platform concentrates on the communities that live along the corridors we build." items={[
          {title: "Community development", copy: "Local infrastructure, access and welfare initiatives near our project sites.", image: IMG.hands},
          {title: "Education & skills", copy: "Support for schools and skill-building for local youth in construction trades.", image: IMG.classroom},
          {title: "Environment & welfare", copy: "Plantation, water conservation and worker welfare programmes.", image: IMG.forest},
        ]} />
        <SplitFeature tone="dark" reverse eyebrow="Our approach" title="Progress that stays after we leave." copy="A road changes a region. We want the communities along it to share in that change, through programmes planned with local stakeholders and reported transparently." points={["Needs assessed with local stakeholders", "Programmes linked to project locations", "Transparent reporting of outcomes", "Worker welfare on every site"]} image={IMG.children} />
        <ContinueExploring slugs={["quality-safety-sustainability", "careers", "media"]} />
      </>;
    case "media":
      return <>
        <Media />
        <ContinueExploring slugs={["projects", "csr", "contact"]} />
      </>;
    case "careers":
      return <>
        <SplitFeature eyebrow="Why BCC" title="Build what connects people." copy="Work on national-highway and hill-road projects, learn from leaders with decades of site experience, and grow with a company that is scaling with discipline." points={["National-highway and hill-road projects", "Mentorship from senior leaders", "Hands-on exposure to a 200+ fleet", "Growth across EPC and HAM delivery"]} image={IMG.rebarAerial} stat={["20+", "Years building India"]} />
        <FeatureGrid eyebrow="Where you could fit" title="Teams we are always building." copy="Share your profile through the form below and choose ‘Careers’ as the enquiry type." items={[
          {title: "Site engineering", copy: "Highway, structures and pavement engineers.", image: IMG.siteCrew},
          {title: "Planning & QS", copy: "Planning, billing and quantity surveying.", image: IMG.drawings},
          {title: "Plant & machinery", copy: "Plant operations, maintenance and fleet management.", image: IMG.plant},
          {title: "Safety & quality", copy: "QA/QC engineers and safety officers.", image: IMG.hardHat},
          {title: "Finance & administration", copy: "Accounts, commercial and HR roles.", image: IMG.workshop},
          {title: "Graduate engineers", copy: "Early-career civil engineers ready for site.", image: IMG.engineers},
        ]} />
        <CareerApplyForm />
      </>;
    case "contact":
      return <>
        <Contact />
        <OfficeMap />
      </>;
    default: // about
      return <>
        <ScaleStrip />
        <SplitFeature eyebrow="Our story" title="From Bharat Construction Company to BCC Buildtech." copy="What began in 2003 as Bharat Construction Company has grown into an execution-led roads and infrastructure enterprise serving MoRTH, NHAI, NHIDCL, PWD and other government entities, with credentials across states and an approximate ₹900+ Cr order book." points={["20+ years of delivery", "BCC Buildtech Limited since 2025", "Credentials across states", "EPC delivery with HAM readiness"]} image={IMG.siteCrew} stat={["20+", "Years of delivery"]} />
        <Panel tone="light">
          <SectionHead eyebrow="Milestones" title="Built around proof." copy="An execution-led company with public-sector experience, field capability and long-term ambition across EPC and HAM." />
          <Timeline />
        </Panel>
        <FeatureGrid tone="white" eyebrow="Our values" title="What every BCC site stands for." items={[
          {title: "Execution discipline", copy: "Programmes kept, milestones met, commitments honoured.", image: IMG.earthworks},
          {title: "Safety first", copy: "Everyone goes home safe, every day.", image: IMG.hardHat},
          {title: "Measurable quality", copy: "Tested, documented and signed off, layer by layer.", image: IMG.welding},
          {title: "Long-term partnership", copy: "Relationships with employers and communities that last.", image: IMG.hands},
        ]} />
        <Manifesto />
        <Vision />
        <ContinueExploring slugs={["leadership", "financials", "projects"]} />
      </>;
  }
}

export function CorporatePage({slug}: {slug: string}) {
  const meta = pageMeta[slug] || pageMeta.about;
  const here = navigation.flatMap(n => n.children).find(([, h]) => h === `/${slug}`)?.[0] ?? PAGE_LABEL[slug] ?? meta.eyebrow;
  return (
    <Shell backdrop={{images: [meta.image]}}>
      <main className="site-stack p-0!">
        <Hero meta={meta} here={here} />
        {pageContent(slug)}
      </main>
    </Shell>
  );
}

export function ProjectDetail({id}: {id: string}) {
  const idx = Math.max(0, projects.findIndex(x => x.id === id));
  const p = projects[idx];
  const next = projects[(idx + 1) % projects.length];
  const facts = [["Employer", p.authority], ["Model", p.model], ["State", p.state], ["Status", p.status], ["Project value", p.value], ["Length / scope", p.length]];
  const stages = ["Award", "Mobilisation", "Earthwork", "Structures", "Completion"];
  const reached = p.status === "Completed" ? stages.length : Math.max(1, Math.round((p.progress / 100) * stages.length));
  return (
    <Shell backdrop={{images: [[IMG.highway, IMG.bridge, IMG.mountainRoad, IMG.paving, IMG.interchange][idx % 5]]}}>
      <main className="site-stack p-0!">
        <Hero meta={{eyebrow: `${p.state} · ${p.model}`, title: p.title, copy: p.summary}} highlight={false} crumb={["Projects", "/projects"]} here={p.state} />
        <Panel tone="light">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
            <Reveal className="grid grid-cols-2 gap-3 self-start">
              {facts.map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-line bg-white p-5">
                  <small className="text-[11px] font-semibold uppercase tracking-[.12em] text-steel">{l}</small>
                  <b className="mt-1.5 block font-display text-lg font-semibold">{v}</b>
                </div>
              ))}
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-wrap items-center gap-3"><p className="eyebrow mb-0!">Project overview</p><StatusChip status={p.status} /></div>
              <h2 className="display mt-5">A disclosed BCC credential.</h2>
              <p className="lede mt-6">{p.summary} Project title, value, employer, status and model are taken from BCC’s company profile.</p>
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm font-semibold"><span className="text-steel">Execution progress</span><span>{p.progress}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist"><motion.div initial={{width: 0}} whileInView={{width: `${p.progress}%`}} viewport={{once: true}} transition={{duration: 1.3, ease: EASE}} className="h-full rounded-full bg-(image:--brand-grad)" /></div>
              </div>
            </Reveal>
          </div>

          <ol className="mt-16 grid gap-3 sm:grid-cols-5">
            {stages.map((x, i) => {
              const done = i < reached;
              return (
                <li key={x} className={cx("rounded-2xl border p-5", done ? "border-teal/30 bg-white" : "border-dashed border-line")}>
                  <span className={cx("grid h-9 w-9 place-items-center rounded-full font-display text-xs font-semibold", done ? "bg-(image:--brand-grad) text-white" : "bg-mist text-steel")}>0{i + 1}</span>
                  <b className="mt-6 block font-display">{x}</b>
                  <small className="mt-1 block text-steel">{done ? (p.status === "Completed" ? "Delivered" : "In execution") : "Upcoming"}</small>
                </li>
              );
            })}
          </ol>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-3xl bg-ink"><img src={p.image} alt={`${p.title} project work`} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] hover:scale-105" /></div>
            <div className="aspect-video overflow-hidden rounded-3xl bg-ink"><img src={p.image === "/bcc/hero-asphalt-hd.jpg" ? "/bcc/machinery-plant-hd.jpg" : "/bcc/hero-asphalt-hd.jpg"} alt={p.image === "/bcc/hero-asphalt-hd.jpg" ? "BCC plant and machinery" : "BCC road paving execution"} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] hover:scale-105" /></div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <a href="/projects" className="action outline"><ChevronLeft />All projects</a>
            <a href={`/projects/${next.id}`} className="group flex items-center justify-between gap-6 rounded-2xl border border-line bg-white p-4 pl-6 transition-colors hover:border-teal/40 sm:max-w-md">
              <span><small className="text-[11px] font-semibold uppercase tracking-[.12em] text-steel">Next credential</small><b className="mt-1 block font-display leading-snug">{next.title}</b></span>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-teal"><ArrowRight className="h-4 w-4" /></span>
            </a>
          </div>
        </Panel>
      </main>
    </Shell>
  );
}
