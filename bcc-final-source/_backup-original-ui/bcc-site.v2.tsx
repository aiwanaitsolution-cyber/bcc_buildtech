"use client";
import {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {AnimatePresence, animate, motion, useInView, useScroll, useSpring, useTransform} from "motion/react";
import {usePathname} from "next/navigation";
import {ArrowRight, ArrowUp, ArrowUpRight, Building2, ChevronDown, ChevronLeft, Download, Factory, HardHat, Link2, Mail, MapPin, Menu, Phone, Search, ShieldCheck, Users, X} from "lucide-react";
import {brand, financials, leadership, machinery, navigation, pageMeta, projects, rating} from "@/app/data";

const cx = (...s: (string | false | undefined | null)[]) => s.filter(Boolean).join(" ");
const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------
   Fixed backdrop — the whole site floats over this layer
------------------------------------------------------------------- */
type BackdropConfig = {images: string[]; video?: string};
type BackdropState = BackdropConfig & {active: number; setActive: (i: number) => void};
const BackdropCtx = createContext<BackdropState>({images: [], active: 0, setActive: () => {}});

function Backdrop() {
  const {images, video, active} = useContext(BackdropCtx);
  const {scrollYProgress} = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14]);
  const src = images[active] ?? images[0];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      <motion.div style={{scale}} className="absolute inset-0 will-change-transform">
        <AnimatePresence initial={false}>
          <motion.img key={src} src={src} alt="" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 1.2, ease: EASE}} className="absolute inset-0 h-full w-full object-cover" />
        </AnimatePresence>
        {video && (
          <video autoPlay muted loop playsInline poster={src} className="backdrop-video absolute inset-0 h-full w-full object-cover opacity-35">
            <source src={video} type="video/mp4" />
          </video>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,16,.5)_0%,rgba(8,14,16,.68)_45%,rgba(8,14,16,.9)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_45%_at_8%_18%,rgba(143,174,108,.26),transparent_70%),radial-gradient(50%_50%_at_95%_85%,rgba(23,133,133,.32),transparent_70%)]" />
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
    <motion.section id={id} initial={{opacity: 0, y: 40}} whileInView={{opacity: 1, y: 0}} viewport={{once: true, margin: "0px 0px -8% 0px"}} transition={{duration: 0.9, ease: EASE}} className={cx("float-panel", TONES[tone], className)}>
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
        <h2 className="display max-w-3xl">{title}</h2>
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
function Headline({text, highlight = true}: {text: string; highlight?: boolean}) {
  if (!highlight) return <>{text}</>;
  const parts = text.split(". ");
  if (parts.length > 1) return <>{parts.slice(0, -1).join(". ")}. <span className="grad-text-light">{parts[parts.length - 1]}</span></>;
  const words = text.split(" ");
  if (words.length < 3) return <>{text}</>;
  return <>{words.slice(0, -2).join(" ")} <span className="grad-text-light">{words.slice(-2).join(" ")}</span></>;
}

/* ------------------------------------------------------------------
   Header
------------------------------------------------------------------- */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState("");
  const pathname = usePathname() || "/";

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

  const isActive = (href: string) => {
    const group = navigation.find(n => n.href === href);
    return pathname === href || !!group?.children.some(([, h]) => h.split("#")[0] === pathname);
  };
  const current = navigation.find(n => n.label === mega);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-4 sm:pt-3 lg:px-6" onMouseLeave={() => setMega("")} onKeyDown={e => {if (e.key === "Escape") {setMega(""); setOpen(false);}}}>
      <div className={cx("mx-auto max-w-[1440px] rounded-[22px] border backdrop-blur-xl backdrop-saturate-150 transition-all duration-500", scrolled || open || mega ? "border-white/80 bg-white/90 shadow-[0_20px_50px_-22px_rgba(0,0,0,.55)]" : "border-white/55 bg-white/75 shadow-[0_12px_40px_-26px_rgba(0,0,0,.6)]")}>
        <div className={cx("flex items-center justify-between gap-4 pl-3 pr-2 transition-[height] duration-500 sm:pl-4", scrolled ? "h-[66px]" : "h-[78px]")}>
          <a href="/" aria-label="BCC Buildtech — home" className="flex shrink-0 items-center">
            <img src="/bcc/logo.png" alt="BCC Buildtech — Paving Paths to Progress" width={422} height={264} className={cx("w-auto transition-all duration-500", scrolled ? "h-[52px]" : "h-[62px]")} />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
            {navigation.map(n => (
              <div key={n.label} onMouseEnter={() => setMega(n.label)}>
                <a href={n.href} onFocus={() => setMega(n.label)} aria-haspopup="true" aria-expanded={mega === n.label} className={cx("flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", isActive(n.href) ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/[.06] hover:text-ink")}>
                  {n.label}
                  <ChevronDown className={cx("h-3.5 w-3.5 opacity-60 transition-transform duration-300", mega === n.label && "rotate-180")} />
                </a>
              </div>
            ))}
            <a href="/careers" onMouseEnter={() => setMega("")} onFocus={() => setMega("")} className={cx("rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors", pathname === "/careers" ? "bg-ink text-white" : "text-ink/75 hover:bg-ink/[.06] hover:text-ink")}>Careers</a>
          </nav>

          <div className="hidden items-center gap-2 xl:flex" onMouseEnter={() => setMega("")}>
            <a href="/BCC-Buildtech-Company-Profile.pdf" download className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-teal hover:text-teal-2"><Download className="h-4 w-4" />Profile</a>
            <a href="/contact" className="action primary !min-h-0 !px-5 !py-2.5 text-[13px]">Enquire <ArrowRight /></a>
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
                    <a key={h} href={h} className="group flex flex-col justify-between rounded-2xl border border-ink/[.08] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-[0_18px_40px_-24px_rgba(11,19,21,.45)]">
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
                {navigation.map((n, i) => (
                  <motion.div key={n.label} initial={{opacity: 0, x: -12}} animate={{opacity: 1, x: 0}} transition={{delay: 0.05 * i, ease: EASE}} className="border-b border-ink/[.07] py-3">
                    <a href={n.href} className="flex items-center justify-between py-1.5 font-display text-lg font-semibold text-ink">{n.label}<ArrowUpRight className="h-4 w-4 text-teal" /></a>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {n.children.map(([l, h]) => <a key={h} href={h} className="rounded-full bg-mist px-3.5 py-2 text-[13px] font-medium text-ink/75">{l}</a>)}
                    </div>
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
    </header>
  );
}

/* ------------------------------------------------------------------
   Hero (transparent — sits directly on the fixed backdrop)
------------------------------------------------------------------- */
type HeroMeta = {eyebrow: string; title: string; copy: string};
const SCENES = ["Build", "Connect", "Cross"];

export function Hero({meta, home = false, highlight = true, crumb, here}: {meta: HeroMeta; home?: boolean; highlight?: boolean; crumb?: [string, string]; here?: string}) {
  const {images, active, setActive} = useContext(BackdropCtx);
  return (
    <section className={cx("relative flex items-end", home ? "min-h-[100svh]" : "min-h-[74svh] lg:min-h-[80vh]")}>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,14,16,.72)_0%,rgba(8,14,16,.3)_55%,transparent_100%)]" />
      <div className="wrap relative px-5 pb-12 pt-[128px] sm:px-8 lg:px-12 lg:pb-16">
        {!home && (
          <motion.nav aria-label="Breadcrumb" initial={{opacity: 0}} animate={{opacity: 1}} className="mb-6 flex items-center gap-2 text-[13px] font-medium text-white/55">
            <a href="/" className="hover:text-white">Home</a><span>/</span>
            {crumb && <><a href={crumb[1]} className="hover:text-white">{crumb[0]}</a><span>/</span></>}
            <span className="text-white/85">{here ?? meta.eyebrow}</span>
          </motion.nav>
        )}
        <motion.p initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{duration: 0.7, ease: EASE}} className="chip panel-glass mb-6 !text-[10.5px] !tracking-[.18em] text-white/90">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf-3 shadow-[0_0_10px_2px_rgba(183,211,140,.7)]" />{meta.eyebrow}
        </motion.p>
        <div className="overflow-hidden pb-2">
          <motion.h1 initial={{y: "105%"}} animate={{y: 0}} transition={{duration: 1, ease: EASE}} className={cx("max-w-6xl text-balance font-display font-semibold tracking-[-.045em] text-white", home ? "text-[clamp(2.6rem,7.4vw,7rem)] leading-[.98]" : "text-[clamp(2.3rem,6vw,5.6rem)] leading-[1]")}>
            <Headline text={meta.title} highlight={highlight} />
          </motion.h1>
        </div>
        <motion.p initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{delay: 0.45, duration: 0.8, ease: EASE}} className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-white/72 sm:text-lg">{meta.copy}</motion.p>

        {home && (
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <motion.div initial={{opacity: 0, y: 14}} animate={{opacity: 1, y: 0}} transition={{delay: 0.6, duration: 0.8, ease: EASE}}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="/projects" className="action primary">Explore projects <ArrowRight /></a>
                <a href="/about" className="action ghost">Discover BCC</a>
              </div>
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[.2em] text-white/45">Trusted by public-sector employers</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-display text-sm font-semibold text-white/75">
                {["MoRTH", "NHAI", "NHIDCL", "PWD", "MPRDC"].map(x => <span key={x}>{x}</span>)}
              </div>
            </motion.div>

            {images.length > 1 && (
              <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.8, duration: 0.9, ease: EASE}} className="panel-glass w-full rounded-[22px] p-2.5 lg:w-[460px]">
                <div className="flex items-center justify-between px-2 pb-2.5 pt-1 text-[11px] font-semibold uppercase tracking-[.16em] text-white/60">
                  <span>Change the view</span><span className="tabular-nums">0{active + 1} / 0{images.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <button key={image} type="button" onClick={() => setActive(index)} aria-label={`Show background: ${SCENES[index] ?? index + 1}`} aria-pressed={active === index} className={cx("group relative h-20 overflow-hidden rounded-2xl text-left transition-all duration-500 sm:h-24", active === index ? "ring-2 ring-teal-3 ring-offset-2 ring-offset-transparent" : "opacity-60 hover:opacity-100")}>
                      <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2 text-[11px] font-bold uppercase tracking-[.14em] text-white">{SCENES[index]}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
      {home && (
        <motion.a href="#scale" aria-label="Scroll to content" initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1.4}} className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block">
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
    ["Company", [["About", "/about"], ["Leadership", "/leadership"], ["Vision 2031", "/vision-2031"], ["Careers", "/careers"]]],
    ["Capabilities", [["EPC", "/epc"], ["HAM", "/ham"], ["Projects", "/projects"], ["Plant & machinery", "/capabilities#machinery"]]],
    ["Impact", [["CSR", "/csr"], ["Quality & safety", "/quality-safety-sustainability"], ["Media centre", "/media"], ["Contact", "/contact"]]],
  ];
  return (
    <footer className="float-panel panel-dark on-dark">
      <Facets className="opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="relative px-5 pb-8 pt-14 sm:px-8 lg:px-14 lg:pt-20">
        <div className="wrap">
          <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="eyebrow">Work with BCC</p>
              <h2 className="display max-w-2xl text-white">Let’s build the <span className="grad-text-light">next connection.</span></h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a href="/contact" className="action primary">Start a conversation <ArrowRight /></a>
              <a href="/BCC-Buildtech-Company-Profile.pdf" download className="action ghost"><Download />Company profile</a>
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

export function Shell({children, backdrop}: {children: React.ReactNode; backdrop: BackdropConfig}) {
  const [active, setActive] = useState(0);
  const {scrollYProgress} = useScroll();
  const scaleX = useSpring(scrollYProgress, {stiffness: 140, damping: 30, restDelta: 0.001});
  return (
    <BackdropCtx.Provider value={{...backdrop, active, setActive}}>
      <motion.div aria-hidden style={{scaleX, background: "var(--brand-grad)"}} className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left" />
      <Backdrop />
      <Header />
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
  const stats = [["₹265.97 Cr", "FY25 revenue"], ["₹867 Cr", "Order book"], ["20+", "Years of delivery"], ["187", "Fleet units"], ["34", "Key personnel"], ["9", "Disclosed projects"]];
  return (
    <motion.section id="scale" initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{duration: 0.9, ease: EASE}} className="float-panel panel-glass on-dark">
      <div className="wrap">
        <div className="overflow-hidden">
        <div className="-mb-px -mr-px grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.map(([v, l]) => (
            <div key={l} className="border-b border-r border-white/10 px-5 py-7 sm:px-7 sm:py-9">
              <b className="block whitespace-nowrap font-display text-[1.6rem] font-semibold tracking-tight text-white sm:text-4xl lg:text-[1.85rem] 2xl:text-4xl"><span className="grad-text-light"><CountUp value={v} /></span></b>
              <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[.16em] text-white/55">{l}</span>
            </div>
          ))}
        </div>
        </div>
        <p className="px-5 py-3.5 text-[11px] text-white/45 sm:px-7">FY25 figures are audited. Order book is the unexecuted value reported as of 30 November 2025.</p>
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
    </Panel>
  );
}

function FinancialStrength() {
  const figures: [string, number][] = [["FY23", financials.fy23], ["FY24", financials.fy24], ["FY25", financials.fy25]];
  const max = financials.fy25;
  const kpis = [["EBITDA margin", `${financials.ebitdaMargin25}%`], ["PAT margin", `${financials.patMargin25}%`], ["Net worth", `₹${financials.netWorth} Cr`], ["Interest cover", `${financials.interestCoverage25}x`]];
  return (
    <Panel tone="white">
      <SectionHead eyebrow="Financial strength" title="Scale supported by performance." copy="Infomerics reports sustained growth, healthy profitability, a comfortable capital structure and satisfactory debt protection metrics." />
      <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <Reveal className="rounded-[26px] border border-line bg-paper p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-display text-lg font-semibold">Total operating income</p>
            <span className="chip bg-leaf/10 text-leaf">~71% CAGR · FY23–25</span>
          </div>
          <div className="relative mt-14 flex h-72 items-end gap-4 sm:gap-8">
            <div aria-hidden className="absolute inset-0 flex flex-col justify-between">{[0, 1, 2, 3].map(i => <span key={i} className="border-t border-dashed border-ink/10" />)}</div>
            {figures.map(([year, value], i) => (
              <div key={year} className="relative flex h-full flex-1 flex-col justify-end">
                <motion.div initial={{height: 0}} whileInView={{height: `${(value / max) * 100}%`}} viewport={{once: true}} transition={{duration: 1.2, delay: i * 0.15, ease: EASE}} className={cx("relative min-h-12 rounded-t-2xl", i === 2 ? "bg-[image:var(--brand-grad)] shadow-[0_20px_40px_-18px_rgba(23,133,133,.8)]" : "bg-ink/85")}>
                  <b className="absolute -top-8 left-0 right-0 text-center font-display text-sm font-semibold sm:text-base">₹{value.toFixed(2)} Cr</b>
                </motion.div>
                <span className="mt-3 text-center text-sm font-semibold text-steel">{year}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-line bg-white p-4">
                <small className="text-[11px] font-semibold uppercase tracking-[.12em] text-steel">{l}</small>
                <b className="mt-1.5 block font-display text-xl font-semibold">{v}</b>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative overflow-hidden rounded-[26px] bg-ink p-7 text-white sm:p-9 lg:p-10">
          <Facets className="opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          <div className="relative">
            <p className="eyebrow on-dark">Credit profile</p>
            <div className="mt-6 border-b border-white/10 pb-6"><small className="text-white/50">Long-term facilities</small><b className="mt-2 block font-display text-3xl font-semibold">{rating.longTerm}</b></div>
            <div className="border-b border-white/10 py-6"><small className="text-white/50">Short-term facilities</small><b className="mt-2 block font-display text-3xl font-semibold">{rating.shortTerm}</b></div>
            <div className="grid grid-cols-2 gap-5 pt-6">
              <div><small className="text-white/50">Rated facilities</small><b className="mt-2 block text-xl">{rating.facilities}</b></div>
              <div><small className="text-white/50">Order book</small><b className="mt-2 block text-xl">₹{financials.orderBook} Cr</b></div>
            </div>
            <p className="mt-6 text-xs text-white/40">Rated by Infomerics · {rating.date}</p>
            <a href="/BCC-Buildtech-Credit-Rating-December-2025.pdf" target="_blank" rel="noreferrer" className="action ghost mt-7">View rating report <ArrowRight /></a>
          </div>
        </Reveal>
      </div>
    </Panel>
  );
}

function ModelCompare() {
  const [mode, setMode] = useState<"EPC" | "HAM">("EPC");
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
            {mode === x && <motion.span layoutId="model-pill" transition={{type: "spring", stiffness: 380, damping: 32}} className="absolute inset-0 rounded-full bg-[image:var(--brand-grad)] shadow-[0_10px_30px_-10px_rgba(23,133,133,.9)]" />}
            <span className="relative">{x}</span>
          </button>
        ))}
      </div>
      <motion.div key={mode} initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}} transition={{duration: 0.6, ease: EASE}} className="card-dark mt-6 p-6 sm:p-9 lg:p-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-3">{mode} model</p>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h3>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">{data.copy}</p>
        <ol className="relative mt-12 grid gap-4 md:grid-cols-5 md:gap-0">
          <span aria-hidden className="absolute left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-gradient-to-r from-leaf-2 via-teal-3 to-teal md:block" />
          <span aria-hidden className="absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-leaf-2 to-teal md:hidden" />
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
        <div className="relative min-h-[360px] overflow-hidden rounded-[26px] border border-white/10 bg-ink/60 sm:min-h-[480px]">
          <div className="dot-grid absolute inset-0" />
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs><linearGradient id="arc" x1="0" x2="1"><stop offset="0" stopColor="#b7d38c" /><stop offset="1" stopColor="#5cc4bf" /></linearGradient></defs>
            {PINS.slice(1).map(s => {
              const on = s.n === state;
              const dx = s.x - hq.x, dy = s.y - hq.y, len = Math.hypot(dx, dy) || 1;
              const bend = dx >= 0 ? -0.28 : 0.28;
              const d = `M${hq.x} ${hq.y} Q${(hq.x + s.x) / 2 - (dy / len) * len * bend} ${(hq.y + s.y) / 2 + (dx / len) * len * bend} ${s.x} ${s.y}`;
              return <path key={s.n} d={d} fill="none" stroke={on ? "url(#arc)" : "rgba(255,255,255,.18)"} strokeWidth={on ? 2 : 1} strokeDasharray={on ? "0" : "3 4"} vectorEffect="non-scaling-stroke" className="transition-all duration-500" />;
            })}
          </svg>
          {PINS.map(s => {
            const on = state === s.n;
            return (
              <button key={s.n} type="button" onClick={() => setState(s.n)} aria-label={`${s.n} projects`} aria-pressed={on} style={{left: `${s.x}%`, top: `${s.y}%`}} className="group absolute -translate-x-1/2 -translate-y-1/2 p-2">
                {on && <span className="pulse-ring absolute inset-0 rounded-full bg-teal-3/40" />}
                <span className={cx("relative block rounded-full border-2 transition-all duration-300", on ? "h-5 w-5 border-white bg-[image:var(--brand-grad)] shadow-[0_0_24px_4px_rgba(92,196,191,.6)]" : "h-3.5 w-3.5 border-white/50 bg-ink-3 group-hover:border-white")} />
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
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <span className="chip absolute left-5 top-5 bg-white/90 text-ink">{p.state}</span>
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h3>
            <p className="mt-4 leading-7 text-white/60">{p.summary}</p>
            <div className="mt-7 grid grid-cols-2 gap-2">
              {[["Employer", p.authority], ["Model", p.model], ["Value", p.value], ["Status", p.status]].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><small className="text-[11px] font-semibold uppercase tracking-[.12em] text-white/40">{l}</small><b className="mt-1.5 block">{v}</b></div>
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
    <a href={`/projects/${p.id}`} className="card group flex h-full flex-col overflow-hidden !rounded-[26px]">
      <div className="relative aspect-[16/11] overflow-hidden bg-ink">
        <img src={p.image} alt={`${p.title} project photography`} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className="chip bg-ink/60 text-white backdrop-blur-md">{p.state}</span>
          <StatusChip status={p.status} />
        </div>
        <b className="absolute bottom-4 left-5 font-display text-2xl font-semibold text-white">{p.value}</b>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-semibold leading-snug tracking-tight">{p.title}</h3>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
          {[["Employer", p.authority], ["Model", p.model], ["Length", p.length]].map(([l, v]) => (
            <div key={l}><dt className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-steel">{l}</dt><dd className="mt-1 font-semibold text-ink">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-auto pt-7">
          <div className="flex items-center justify-between text-xs font-semibold text-steel"><span>Progress</span><span className="text-ink">{p.progress}%</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mist">
            <motion.div initial={{width: 0}} whileInView={{width: `${p.progress}%`}} viewport={{once: true}} transition={{duration: 1.2, ease: EASE}} className="h-full rounded-full bg-[image:var(--brand-grad)]" />
          </div>
        </div>
      </div>
    </a>
  );
}

function ProjectExplorer() {
  const [q, setQ] = useState(""), [state, setState] = useState("All"), [model, setModel] = useState("All");
  const states = ["All", ...new Set(projects.map(p => p.state))];
  const list = useMemo(() => projects.filter(p => (state === "All" || p.state === state) && (model === "All" || p.model === model) && (p.title + " " + p.state + " " + p.authority).toLowerCase().includes(q.toLowerCase())), [q, state, model]);
  return (
    <Panel tone="light" id="featured">
      <SectionHead eyebrow="Project database" title="Search verified credentials." copy="Nine disclosed projects organised by state, employer, delivery model, status, length and contract value." />
      <div className="mt-12 grid gap-3 rounded-[22px] border border-line bg-white p-3 shadow-[0_20px_50px_-35px_rgba(11,19,21,.4)] md:grid-cols-[1fr_220px_auto]">
        <label className="flex items-center gap-3 rounded-2xl bg-paper px-4">
          <Search className="h-4 w-4 shrink-0 text-steel" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search project, state or employer" aria-label="Search projects" className="min-h-[50px] w-full bg-transparent text-[15px] outline-none placeholder:text-steel" />
        </label>
        <div className="relative">
          <select value={state} onChange={e => setState(e.target.value)} aria-label="Filter by state" className="field h-full appearance-none !border-transparent !bg-paper pr-10 text-[15px]">
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
      <p className="mt-5 text-sm text-steel">Showing <b className="text-ink">{list.length}</b> of {projects.length} credentials</p>
      <motion.div layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map(p => (
            <motion.div layout key={p.id} initial={{opacity: 0, scale: 0.96}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.96}} transition={{duration: 0.4, ease: EASE}}>
              <ProjectCard p={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {!list.length && (
        <div className="rounded-[22px] border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg font-semibold">No matching project record.</p>
          <button type="button" onClick={() => {setQ(""); setState("All"); setModel("All");}} className="mt-3 text-sm font-semibold text-teal">Clear filters</button>
        </div>
      )}
    </Panel>
  );
}

function Leadership() {
  const initials = (n: string) => n.replace(/^Mr\.\s*/, "").split(" ").map(w => w[0]).slice(0, 2).join("");
  return (
    <Panel tone="white">
      <SectionHead eyebrow="Management strength" title="Leadership built on execution experience." copy="BCC’s senior team combines technical, project, finance, plant and commercial expertise, with 34 key personnel listed in the company profile." />
      <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Reveal className="group relative min-h-[480px] overflow-hidden rounded-[28px] bg-ink text-white sm:min-h-[560px]">
          <img src="/bcc/bhoop-singh.jpg" alt="Mr. Bhoop Singh, Managing Director" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top opacity-70 transition duration-[1.2s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
            <span className="chip panel-glass text-white">Managing Director</span>
            <h3 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Mr. Bhoop Singh</h3>
            <p className="mt-4 max-w-xl leading-7 text-white/70">Founder of Bharat Construction Company in 2003, with more than two decades of industry experience and established relationships across government departments and suppliers.</p>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {leadership.slice(1).map((x, i, arr) => (
            <Reveal key={x.name} delay={i * 0.05} className={cx(arr.length % 2 === 1 && i === arr.length - 1 && "sm:col-span-2")}>
              <article className="card flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[image:var(--brand-grad)] font-display text-sm font-semibold text-white">{initials(x.name)}</span>
                  <span className="chip bg-leaf/10 text-leaf">{x.experience}</span>
                </div>
                <h3 className="mt-8 font-display text-lg font-semibold tracking-tight">{x.name}</h3>
                <p className="mt-1 text-sm font-semibold text-teal-2">{x.role}</p>
                <p className="mt-2 text-sm text-steel">{x.qualification}</p>
              </article>
            </Reveal>
          ))}
        </div>
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
      <Reveal className="mt-12 grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[.03] lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative min-h-64 overflow-hidden">
          <img src="/bcc/machinery-plant.jpg" alt="BCC machinery and concrete plant" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink/40" />
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="eyebrow">Equipment base</p>
          <b className="block font-display text-7xl font-semibold tracking-tight"><span className="grad-text-light"><CountUp value="187" /></span></b>
          <p className="mt-3 text-white/60">machines and equipment units listed in the company profile</p>
          <div className="mt-8 grid grid-cols-2 gap-2">
            {[["42", "Excavators"], ["43", "Dumpers"], ["5", "Motor graders"], ["5", "RMC plants"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><b className="font-display text-2xl font-semibold text-teal-3">{n}</b><span className="mt-0.5 block text-sm text-white/60">{l}</span></div>
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
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-teal-3"><Factory className="h-5 w-5" /></span>
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
  const pillars = ["Expand EPC order book", "Build selective HAM portfolio", "Increase geographic reach", "Strengthen assets & technology", "Institutionalise governance"];
  return (
    <Panel tone="brand">
      <Reveal>
        <p className="eyebrow !text-white/85 before:![background:rgba(255,255,255,.7)]">Vision 2031</p>
        <h2 className="max-w-5xl text-balance font-display text-[clamp(2.3rem,5.5vw,5rem)] font-semibold leading-[1.02] tracking-[-.04em]">Scaling with discipline. Growing with purpose.</h2>
      </Reveal>
      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {pillars.map((x, i) => (
          <Reveal key={x} delay={i * 0.06}>
            <div className="flex h-full flex-col rounded-[22px] border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-colors hover:bg-white/15">
              <span className="font-display text-sm font-semibold text-white/60">0{i + 1}</span>
              <b className="mt-10 block font-display text-lg font-semibold leading-snug lg:mt-14">{x}</b>
            </div>
          </Reveal>
        ))}
      </div>
      <a href="/vision-2031" className="action light mt-10">Explore roadmap <ArrowRight /></a>
    </Panel>
  );
}

function Media() {
  const items = [["Project milestones", "Mobilisation, completion and handover moments across active corridors."], ["Engineering & safety", "Methods, materials and site-safety practices from our teams."], ["People & community", "Stories from our workforce and the communities along our roads."]];
  return (
    <Panel tone="glass">
      <SectionHead eyebrow="Media centre" title="Progress, documented." copy="A system for verified milestones, engineering stories, leadership perspectives and community impact." />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {items.map(([x, c], i) => (
          <Reveal key={x} delay={i * 0.08}>
            <article className="card-dark h-full overflow-hidden p-7">
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-[image:var(--brand-grad)] opacity-80" />
              <span className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-3">Update 0{i + 1}</span>
              <h3 className="mt-16 font-display text-2xl font-semibold tracking-tight">{x}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{c}</p>
              <p className="mt-6 text-xs text-white/35">CMS-ready category awaiting approved stories and photography.</p>
            </article>
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
                <div><b className="text-[13px] font-semibold uppercase tracking-[.1em] text-steel">{t}</b><p className="mt-1 leading-7 text-ink">{v}</p></div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.1}><ContactForm /></Reveal>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------
   Pages
------------------------------------------------------------------- */
const HOME_IMAGES = ["/bcc/acc.jpg", "/bcc/bcc.jpg", "/bcc/ccc.jpg"];

export function HomePage() {
  const home = {eyebrow: "₹265.97 Crore FY25 infrastructure enterprise", title: "Building roads. Connecting regions. Accelerating India.", copy: "BCC Buildtech Limited delivers highways, bridges and strategic road infrastructure backed by a ₹867 crore order book and EPC/HAM capability."};
  return (
    <Shell backdrop={{images: HOME_IMAGES}}>
      <main className="site-stack !p-0">
        <Hero meta={home} home />
        <ScaleStrip />
        <Intro />
        <FinancialStrength />
        <ModelCompare />
        <PresenceMap />
        <ProjectExplorer />
        <Leadership />
        <MachineryExplorer />
        <Vision />
        <Media />
        <Contact />
      </main>
    </Shell>
  );
}

function Timeline() {
  const items = [["2003", "Bharat Construction Company established"], ["2023", "Reconstituted as a private limited company"], ["2025", "Converted to BCC Buildtech Limited"], ["2031", "Strategic growth horizon"]];
  return (
    <div className="relative mt-14 grid gap-4 md:grid-cols-4">
      {items.map(([a, b], i) => (
        <Reveal key={a} delay={i * 0.08}>
          <div className="card h-full p-7">
            <b className={cx("font-display text-4xl font-semibold tracking-tight", i === 3 ? "grad-text" : "text-ink")}>{a}</b>
            <span className="mt-4 block h-2.5 w-2.5 rounded-full bg-[image:var(--brand-grad)] ring-4 ring-teal/15" />
            <p className="mt-8 text-sm leading-6 text-steel">{b}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function CapabilityIntro() {
  const items: [typeof Users, string][] = [[Users, "Management"], [Factory, "Machinery"], [HardHat, "Manpower"], [ShieldCheck, "Systems"]];
  return (
    <Panel tone="light" id="people">
      <SectionHead eyebrow="Four execution pillars" title="Ready at project scale." />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([I, x], i) => (
          <Reveal key={x} delay={i * 0.06}>
            <article className="card h-full p-7">
              <div className="icon-tile"><I /></div>
              <h3 className="mt-14 font-display text-2xl font-semibold tracking-tight">{x}</h3>
              <p className="mt-3 text-sm leading-6 text-steel">Auditable capability records ready for verified quantities and deployment data.</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

function SimpleGrid({title, items, tone = "light"}: {title: string; items: string[]; tone?: Tone}) {
  const dark = tone !== "light" && tone !== "white";
  return (
    <Panel tone={tone}>
      <SectionHead eyebrow="Corporate evidence" title={title} />
      <div className={cx("mt-14 grid gap-4 sm:grid-cols-2", items.length % 3 === 0 ? "lg:grid-cols-3" : items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
        {items.map((x, i) => (
          <Reveal key={x} delay={i * 0.06}>
            <article className={cx(dark ? "card-dark" : "card", "h-full overflow-hidden p-7 lg:p-8")}>
              <span className={cx("font-display text-sm font-semibold", dark ? "text-teal-3" : "text-teal")}>0{i + 1}</span>
              <h3 className="mt-14 font-display text-2xl font-semibold tracking-tight">{x}</h3>
              <p className={cx("mt-4 text-sm leading-6", dark ? "text-white/55" : "text-steel")}>Structured for management-approved evidence and documentation.</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Panel>
  );
}

export function CorporatePage({slug}: {slug: string}) {
  const meta = pageMeta[slug] || pageMeta.about;
  let content: React.ReactNode;
  if (slug === "projects") content = <><ProjectExplorer /><PresenceMap /></>;
  else if (slug === "capabilities") content = <><CapabilityIntro /><MachineryExplorer /></>;
  else if (["businesses", "epc", "ham"].includes(slug)) content = <><ModelCompare /><SimpleGrid title="Integrated from mobilisation to handover." items={["Highways & pavement", "Bridges & structures", "Drainage & protection", "Planning & controls", "Quality & testing", "Safety & environment"]} /></>;
  else if (slug === "leadership") content = <Leadership />;
  else if (slug === "quality-safety-sustainability") content = <SimpleGrid title="Controls that live on site." items={["Quality management", "Health & safety", "Environmental controls", "Policies & certification"]} />;
  else if (slug === "csr") content = <SimpleGrid title="Every initiative, measured." items={["Community development", "Education & skills", "Environment & welfare"]} />;
  else if (slug === "media") content = <Media />;
  else if (slug === "contact") content = <Contact />;
  else if (slug === "careers") content = <><SimpleGrid title="Build what connects people." items={["Current opportunities", "Graduate engineers", "Life at BCC"]} /><Contact /></>;
  else if (slug === "vision-2031") content = <><Vision /><SimpleGrid tone="dark" title="Ambition with guardrails." items={["Expand EPC", "Selective HAM", "Geographic reach", "Assets & technology", "Governance"]} /></>;
  else content = (
    <>
      <ScaleStrip />
      <Panel tone="light">
        <SectionHead eyebrow="Company overview" title="Built around proof." copy="An execution-led roads and infrastructure company with public-sector experience, field capability and long-term ambition across EPC and HAM." />
        <Timeline />
      </Panel>
      <ModelCompare />
    </>
  );
  return (
    <Shell backdrop={{images: [meta.image], video: meta.video}}>
      <main className="site-stack !p-0">
        <Hero meta={meta} here={navigation.flatMap(n => n.children).find(([, h]) => h === `/${slug}`)?.[0] ?? (slug === "careers" ? "Careers" : slug === "contact" ? "Contact" : slug === "businesses" ? "Businesses" : meta.eyebrow)} />
        {content}
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
    <Shell backdrop={{images: [p.image]}}>
      <main className="site-stack !p-0">
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
              <div className="flex flex-wrap items-center gap-3"><p className="eyebrow !mb-0">Project overview</p><StatusChip status={p.status} /></div>
              <h2 className="display mt-5">A disclosed BCC credential.</h2>
              <p className="lede mt-6">{p.summary} Project title, value, employer, status and model are taken from BCC’s company profile.</p>
              <div className="mt-8">
                <div className="flex items-center justify-between text-sm font-semibold"><span className="text-steel">Execution progress</span><span>{p.progress}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist"><motion.div initial={{width: 0}} whileInView={{width: `${p.progress}%`}} viewport={{once: true}} transition={{duration: 1.3, ease: EASE}} className="h-full rounded-full bg-[image:var(--brand-grad)]" /></div>
              </div>
            </Reveal>
          </div>

          <ol className="mt-16 grid gap-3 sm:grid-cols-5">
            {stages.map((x, i) => {
              const done = i < reached;
              return (
                <li key={x} className={cx("rounded-2xl border p-5", done ? "border-teal/30 bg-white" : "border-dashed border-line")}>
                  <span className={cx("grid h-9 w-9 place-items-center rounded-full font-display text-xs font-semibold", done ? "bg-[image:var(--brand-grad)] text-white" : "bg-mist text-steel")}>0{i + 1}</span>
                  <b className="mt-6 block font-display">{x}</b>
                  <small className="mt-1 block text-steel">{done ? (p.status === "Completed" ? "Delivered" : "In execution") : "Upcoming"}</small>
                </li>
              );
            })}
          </ol>

          <div className="mt-16 grid gap-4 md:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-[24px] bg-ink"><img src={p.image} alt={`${p.title} project work`} loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] hover:scale-105" /></div>
            <div className="aspect-video overflow-hidden rounded-[24px] bg-ink"><img src="/bcc/hero-asphalt.jpg" alt="BCC road paving execution" loading="lazy" className="h-full w-full object-cover transition duration-[1.2s] hover:scale-105" /></div>
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
