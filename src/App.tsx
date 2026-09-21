import { useEffect, useMemo, useState } from "react";

const STAGES = [
  { label: "Downloading update", until: 30 },
  { label: "Verifying packages", until: 60 },
  { label: "Installing components", until: 90 },
  { label: "Finalizing", until: 100 },
];

const TIPS = [
  "Tip: Scan a cabinet's QR code to jump straight to its live inventory.",
  "Tip: Low-stock alerts can be routed to the ward pharmacist automatically.",
  "Tip: Whole-unit medicines now show a non-transferable remainder inline.",
  "Tip: Use Authorized Login on shared ward terminals — no password needed.",
  "Tip: Expiry reports export to CSV from Reports → Inventory → Expiry.",
];

const WHATS_NEW = [
  { tag: "New", title: "Whole-unit transfer rules", body: "Loose remainders are flagged as non-transferable during stock moves." },
  { tag: "Improved", title: "Faster cabinet sync", body: "RFID reconciliation is up to 40% quicker on large cabinets." },
  { tag: "New", title: "Authorized device login", body: "One-tap sign-in on pre-authorized ward terminals." },
  { tag: "Fixed", title: "Expiry alert accuracy", body: "Batch-level expiry now accounts for partial packs." },
];

function useProgress() {
  const [pct, setPct] = useState(60);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100;
        return Math.min(100, p + Math.random() * 3.5);
      });
    }, 900);
    return () => clearInterval(t);
  }, []);
  return Math.round(pct);
}

function stageIndex(pct: number) {
  return STAGES.findIndex((s) => pct < s.until) === -1
    ? STAGES.length - 1
    : STAGES.findIndex((s) => pct < s.until);
}

function WarnLine() {
  return (
    <p className="text-[15px] font-semibold text-rose-500">
      <span className="font-black">Do not power off</span> the device during the upgrade.
    </p>
  );
}

/* ============================================================ Option A ==== */
/* Guided progress: animated ring + live step tracker + rotating tips deck.  */
function OptionA() {
  const pct = useProgress();
  const stage = stageIndex(pct);
  const [tip, setTip] = useState(0);
  const eta = Math.max(1, Math.round(((100 - pct) / 100) * 90));

  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const R = 78;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50/50 px-6 py-10">
      <div className="w-full max-w-[440px] text-center">
        {/* ring */}
        <div className="relative mx-auto h-[200px] w-[200px]">
          <div className="absolute inset-3 rounded-full bg-blue-400/10" style={{ animation: "breathe 3s ease-in-out infinite" }} />
          <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
            <circle cx="90" cy="90" r={R} fill="none" stroke="#e0e9ff" strokeWidth="10" />
            <circle
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke="url(#g)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (pct / 100) * C}
              style={{ transition: "stroke-dashoffset 0.9s ease" }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline text-blue-600">
              <span className="text-[44px] font-bold leading-none tabular-nums">{pct}</span>
              <span className="text-[18px] font-semibold">%</span>
            </div>
            <span className="mt-1 text-[12px] font-medium text-slate-400">≈ {eta}s left</span>
          </div>
        </div>

        <h1 className="mt-6 text-[22px] font-bold text-blue-600">
          {pct >= 100 ? "Update complete" : "Updating software…"}
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">The system will restart automatically</p>

        {/* live step tracker */}
        <div className="mx-auto mt-7 max-w-[380px] space-y-2 text-left">
          {STAGES.map((s, i) => {
            const done = i < stage || pct >= 100;
            const active = i === stage && pct < 100;
            return (
              <div
                key={s.label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 transition ${
                  active ? "border-blue-200 bg-blue-50" : done ? "border-transparent bg-transparent" : "border-transparent opacity-45"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`text-[14px] ${active ? "font-semibold text-blue-700" : done ? "text-slate-500" : "text-slate-400"}`}>
                  {s.label}
                </span>
                {active && (
                  <span className="ml-auto flex gap-1">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* rotating tips — interactive, reduces boredom */}
        <div className="mx-auto mt-7 max-w-[380px] rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-start gap-3 text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">💡</div>
            <p key={tip} className="animate-swap text-[13px] leading-relaxed text-slate-600">{TIPS[tip]}</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {TIPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setTip(i)}
                aria-label={`Tip ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === tip ? "w-5 bg-blue-500" : "w-1.5 bg-slate-300 hover:bg-slate-400"}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <WarnLine />
        </div>
      </div>
    </div>
  );
}

/* --- update-scene backgrounds for Option B ------------------------------- */
const BGS = ["aurora", "stream", "pulse"] as const;
type Bg = (typeof BGS)[number];

/* Aurora: soft blurred gradient blooms drifting slowly — calm & premium. */
function AuroraBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -left-24 -top-24 h-[460px] w-[460px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, #3b82f6aa, transparent 70%)", animation: "aurora-a 14s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-20 top-1/3 h-[420px] w-[420px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, #6366f199, transparent 70%)", animation: "aurora-b 16s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-120px] left-1/3 h-[400px] w-[400px] rounded-full blur-[90px]"
        style={{ background: "radial-gradient(circle, #22d3ee66, transparent 70%)", animation: "aurora-a 18s ease-in-out 2s infinite" }}
      />
    </div>
  );
}

/* Stream: thin light trails falling toward the device — data downloading. */
function StreamBg() {
  const trails = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: (i * 5.5 + (i % 3) * 2) % 100,
        delay: (i % 6) * 0.7,
        dur: 3.2 + (i % 5) * 0.6,
        h: 60 + (i % 4) * 40,
        o: 0.25 + (i % 3) * 0.2,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_60%,transparent)]">
      {trails.map((t, i) => (
        <span
          key={i}
          className="absolute top-0 w-px"
          style={{
            left: `${t.left}%`,
            height: t.h,
            background: "linear-gradient(to bottom, transparent, #7dd3fc)",
            opacity: t.o,
            animation: `stream-fall ${t.dur}s linear ${t.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* Pulse: gentle concentric sync rings radiating from the centre. */
function PulseBg() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute h-[300px] w-[300px] rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, #3b82f655, transparent 70%)" }}
      />
      {[0, 1.3, 2.6, 3.9].map((delay) => (
        <div
          key={delay}
          className="absolute h-[560px] w-[560px] rounded-full border border-blue-400/25"
          style={{ animation: `sync-pulse 5.2s ease-out ${delay}s infinite` }}
        />
      ))}
    </div>
  );
}

/* ============================================================ Option B ==== */
/* Ambient "what's new" experience: floating scene + swipeable changelog.    */
function OptionB() {
  const pct = useProgress();
  const stage = stageIndex(pct);
  const [card, setCard] = useState(0);
  const [bg, setBg] = useState<Bg>("aurora");

  useEffect(() => {
    const t = setInterval(() => setCard((c) => (c + 1) % WHATS_NEW.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b1220] px-6 py-10">
      {/* ambient gradient wash */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(90% 70% at 50% 10%, #1e3a8a55, transparent 60%), radial-gradient(80% 60% at 80% 100%, #6d28d955, transparent 55%)" }} />
      {/* selectable update-scene background */}
      {bg === "aurora" && <AuroraBg />}
      {bg === "stream" && <StreamBg />}
      {bg === "pulse" && <PulseBg />}

      {/* background picker */}
      <div className="absolute right-5 top-5 z-10 flex items-center gap-1 rounded-full bg-white/10 p-1 text-[12px] font-semibold text-white/70 ring-1 ring-white/15 backdrop-blur">
        {BGS.map((b) => (
          <button
            key={b}
            onClick={() => setBg(b)}
            className={`rounded-full px-3 py-1 capitalize transition ${bg === b ? "bg-white/90 text-slate-900" : "hover:text-white"}`}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[460px] text-center text-white">
        {/* floating badge + big percent */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur" style={{ animation: "float 4s ease-in-out infinite" }}>
          <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-blue-300" aria-hidden>
            <path d="M12 4v9m0 0 3.5-3.5M12 13 8.5 9.5M5 15v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="mt-6 flex items-baseline justify-center text-white">
          <span className="text-[56px] font-black leading-none tabular-nums">{pct}</span>
          <span className="text-[22px] font-bold text-blue-300">%</span>
        </div>
        <h1 className="mt-1 text-[20px] font-bold text-blue-200">
          {pct >= 100 ? "Update complete" : "Updating software…"}
        </h1>
        <p className="text-[14px] text-slate-400">The system will restart automatically · {STAGES[stage].label}</p>

        {/* animated progress bar */}
        <div className="mx-auto mt-5 h-2.5 w-full max-w-[380px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              transition: "width 0.9s ease",
              background: "linear-gradient(90deg,#60a5fa,#818cf8,#60a5fa)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s linear infinite",
            }}
          />
        </div>

        {/* what's new — swipeable card deck */}
        <div className="mx-auto mt-7 max-w-[380px] rounded-2xl bg-white/[0.06] p-5 text-left ring-1 ring-white/10 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-blue-300">What&apos;s new in v1.3.0</span>
            <div className="flex gap-1.5">
              <button onClick={() => setCard((c) => (c - 1 + WHATS_NEW.length) % WHATS_NEW.length)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">‹</button>
              <button onClick={() => setCard((c) => (c + 1) % WHATS_NEW.length)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">›</button>
            </div>
          </div>
          <div key={card} className="animate-swap">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                WHATS_NEW[card].tag === "New" ? "bg-emerald-400/20 text-emerald-300" : WHATS_NEW[card].tag === "Fixed" ? "bg-amber-400/20 text-amber-300" : "bg-blue-400/20 text-blue-300"
              }`}
            >
              {WHATS_NEW[card].tag}
            </span>
            <h3 className="mt-2 text-[16px] font-bold text-white">{WHATS_NEW[card].title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{WHATS_NEW[card].body}</p>
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
            {WHATS_NEW.map((_, i) => (
              <button key={i} onClick={() => setCard(i)} aria-label={`Card ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === card ? "w-5 bg-blue-400" : "w-1.5 bg-white/25 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[15px] font-semibold text-rose-400">
            <span className="font-black">Do not power off</span> the device during the upgrade.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [option, setOption] = useState<"A" | "B">("A");
  return (
    <>
      {option === "A" ? <OptionA /> : <OptionB />}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-1 shadow-xl ring-1 ring-black/10">
        {(["A", "B"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOption(o)}
            className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${option === o ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            {o === "A" ? "Option A · Guided" : "Option B · Ambient"}
          </button>
        ))}
      </div>
    </>
  );
}
