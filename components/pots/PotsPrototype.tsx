"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowDown,
  BadgeCheck,
  Check,
  ChevronRight,
  CreditCard,
  Home,
  MessageCircle,
  MoreHorizontal,
  Phone,
  PieChart,
  Plus,
  QrCode,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Target,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const phone = "mx-auto w-full max-w-[420px] h-screen bg-black text-white flex flex-col";
const POT = "#c084fc";
const POT_DIM = "rgba(192,132,252,0.12)";
const INITIAL_WALLET = 3000;
const MAX_POTS = 10;

// ─── Static holdings (mock) ───────────────────────────────────────────────────
const STATIC_HOLDINGS = [
  { id: "gold",    label: "Gold",     ticker: "XAU", valueAed: 1240.50, change: +1.8, color: "#f5a623" },
  { id: "silver",  label: "Silver",   ticker: "XAG", valueAed:  318.75, change: -0.4, color: "#a0aec0" },
  { id: "btc",     label: "Bitcoin",  ticker: "BTC", valueAed:  875.20, change: +3.2, color: "#f7931a" },
  { id: "eth",     label: "Ethereum", ticker: "ETH", valueAed:  412.60, change: +1.1, color: "#627eea" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pot {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatAed(n: number) {
  return `AED ${n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pctOf(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

// ─── Emoji options ────────────────────────────────────────────────────────────

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: string) => void }) {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "calls", label: "Calls", icon: Phone },
    { id: "chats", label: "Chats", icon: MessageCircle },
    { id: "money", label: "Money", icon: Wallet },
    { id: "all", label: "All", icon: MoreHorizontal },
  ];
  return (
    <div className="border-t border-white/10 bg-black/95 backdrop-blur px-3 py-3">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavigate(id)} className="flex flex-col items-center gap-1 py-1 text-xs">
            <Icon className={`h-5 w-5 ${current === id ? "text-white" : "text-white/45"}`} />
            <span className={current === id ? "text-white font-semibold" : "text-white/45"}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Tab pill ─────────────────────────────────────────────────────────────────
function TabPill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-5 py-2 text-sm font-semibold transition"
      style={active ? { background: "rgba(255,255,255,0.14)", color: "#fff" } : { background: "transparent", color: "rgba(255,255,255,0.45)" }}
    >
      {children}
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = POT }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function PageShell({
  onBack, subtitle, badge, navCurrent = "money", onNavigate, children, gradient, headerRight,
}: {
  onBack?: () => void;
  subtitle?: string;
  badge?: string;
  navCurrent?: string;
  onNavigate?: (s: string) => void;
  children: React.ReactNode;
  gradient?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className={phone} style={{ background: gradient ?? "linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)" }}>
      <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="rounded-full bg-white/10 p-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {subtitle && (
            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold tracking-tight">botim</span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-black"
                style={{ background: POT }}
              >
                {badge ?? subtitle}
              </span>
            </div>
          )}
        </div>
        {headerRight ?? (
          <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_35%,#d4ff8e,#457a33)] ring-2 ring-white/10" />
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      <div className="shrink-0">
        <BottomNav current={navCurrent} onNavigate={onNavigate ?? (() => {})} />
      </div>
    </div>
  );
}

// ─── MoneyHub ─────────────────────────────────────────────────────────────────
function MoneyHub({
  walletTotal, spendable, potsTotal, potsCount, potsGoalTotal, onNavigate,
}: {
  walletTotal: number;
  spendable: number;
  potsTotal: number;
  potsCount: number;
  potsGoalTotal: number;
  onNavigate: (s: string) => void;
}) {
  const [tab, setTab] = useState<"pay" | "credit" | "wealth">("pay");

  const totalStatic = STATIC_HOLDINGS.reduce((s, h) => s + h.valueAed, 0);
  const totalWealth = parseFloat(totalStatic.toFixed(2));

  return (
    <PageShell
      subtitle="MONEY"
      badge="MONEY"
      navCurrent="money"
      onNavigate={onNavigate}
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        <TabPill active={tab === "pay"}    onClick={() => setTab("pay")}>Pay</TabPill>
        <TabPill active={tab === "credit"} onClick={() => setTab("credit")}>Credit</TabPill>
        <TabPill active={tab === "wealth"} onClick={() => setTab("wealth")}>Wealth</TabPill>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Pay tab ────────────────────────────────────────────────────── */}
        {tab === "pay" && (
          <motion.div key="pay" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex flex-col gap-5">
            {/* Wallet card */}
            <div
              className="rounded-[30px] border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg,rgba(20,14,40,0.95),rgba(5,5,20,0.92))" }}
            >
              <div className="text-sm text-white/55 mb-1">Wallet balance</div>
              <div className="text-4xl font-semibold tracking-tight mb-1">{formatAed(walletTotal)}</div>
              {potsTotal > 0 && (
                <div className="text-xs text-white/40 mb-4">
                  Includes <span style={{ color: POT }}>{formatAed(potsTotal)}</span> allocated to pots
                </div>
              )}
              {potsTotal > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-white/8 px-3 py-2.5">
                    <div className="text-xs text-white/45">Spendable</div>
                    <div className="text-sm font-semibold mt-0.5">{formatAed(spendable)}</div>
                  </div>
                  <button
                    onClick={() => onNavigate("pots-hub")}
                    className="rounded-xl px-3 py-2.5 text-left transition hover:brightness-110"
                    style={{ background: POT_DIM }}
                  >
                    <div className="text-xs" style={{ color: `${POT}99` }}>In pots</div>
                    <div className="text-sm font-semibold mt-0.5" style={{ color: POT }}>{formatAed(potsTotal)}</div>
                  </button>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3">
              {[{ icon: Send, label: "Send" }, { icon: QrCode, label: "QR code" }, { icon: Plus, label: "Add funds" }, { icon: ArrowDown, label: "Withdraw" }].map(({ icon: Icon, label }) => (
                <button key={label} className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-full items-center justify-center rounded-[18px] bg-white/10 text-white/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-white/70">{label}</span>
                </button>
              ))}
            </div>

            {/* Pots entry */}
            <button
              onClick={() => onNavigate("pots-hub")}
              className="w-full text-left rounded-[24px] border border-white/8 p-4 flex items-center gap-4 transition hover:brightness-110"
              style={{ background: "linear-gradient(135deg,rgba(30,10,60,0.9),rgba(10,5,20,0.85))" }}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xl" style={{ background: POT_DIM }}>
                🏺
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">My Pots</div>
                <div className="text-xs text-white/45 mt-0.5">
                  {potsCount === 0
                    ? "Save toward any goal"
                    : `${potsCount} pot${potsCount > 1 ? "s" : ""} · ${formatAed(potsTotal)} saved`}
                </div>
                {potsCount > 0 && (
                  <div className="mt-2">
                    <ProgressBar pct={potsGoalTotal > 0 ? Math.min(100, (potsTotal / potsGoalTotal) * 100) : 0} />
                  </div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-white/30 flex-shrink-0" />
            </button>

            {/* Recent transactions */}
            <div>
              <div className="text-sm font-semibold text-white/55 mb-3">Recent</div>
              <div className="rounded-[20px] bg-[#0f1117] divide-y divide-white/8">
                {[
                  { label: "Noon.com",   sub: "Online purchase", amt: "-AED 149.00"   },
                  { label: "Salary",     sub: "Bank transfer",   amt: "+AED 8,500.00" },
                  { label: "Carrefour",  sub: "POS payment",     amt: "-AED 213.50"   },
                ].map(({ label, sub, amt }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-white/45">{sub}</div>
                    </div>
                    <div className={`text-sm font-semibold ${amt.startsWith("+") ? "text-[#00c896]" : "text-white"}`}>{amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Credit tab ─────────────────────────────────────────────────── */}
        {tab === "credit" && (
          <motion.div key="credit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="rounded-[28px] bg-[#0f1117] p-6">
              <div className="text-2xl font-semibold mb-2">Credit</div>
              <p className="text-white/55 text-sm leading-relaxed">
                Buy now, pay later and credit products live here. Out of scope for this prototype.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Wealth tab ─────────────────────────────────────────────────── */}
        {tab === "wealth" && (
          <motion.div key="wealth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="flex flex-col gap-5">

            {/* Total wealth card */}
            <div
              className="rounded-[30px] border border-white/10 p-6"
              style={{ background: "linear-gradient(135deg,rgba(10,30,50,0.98),rgba(5,15,25,0.95))" }}
            >
              <div className="text-sm text-white/55 mb-1">Total wealth</div>
              <div className="text-4xl font-semibold tracking-tight">
                {formatAed(totalWealth)}
              </div>
              {/* Breakdown bar */}
              <div className="mt-4">
                <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-2">
                  {totalWealth > 0 && STATIC_HOLDINGS.map((h, i) => (
                    <div
                      key={i}
                      className="h-full"
                      style={{ width: `${(h.valueAed / totalWealth) * 100}%`, background: h.color }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {STATIC_HOLDINGS.map((h) => (
                    <div key={h.label} className="flex items-center gap-1 text-xs text-white/50">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: h.color }} />
                      {h.label} {totalWealth > 0 ? Math.round((h.valueAed / totalWealth) * 100) : 0}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My holdings */}
            <div className="rounded-[28px] bg-[#0f1117] p-5">
              <div className="mb-3 text-base font-semibold">My holdings</div>
              <div className="flex flex-col gap-2">

                {/* Static holdings */}
                {STATIC_HOLDINGS.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-[16px] bg-white/5 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full p-2 shrink-0" style={{ background: `${h.color}18`, color: h.color }}>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{h.label}</div>
                        <div className="text-xs text-white/40">{h.ticker}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatAed(h.valueAed)}</div>
                      <div className={`text-xs ${h.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {h.change >= 0 ? "+" : ""}{h.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invest more */}
            <div className="rounded-[28px] bg-[#0f1117] p-5">
              <div className="mb-3 text-base font-semibold">Invest more</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, label: "Buy Gold"   },
                  { icon: TrendingUp, label: "Buy Silver" },
                  { icon: PieChart,   label: "Crypto"     },
                  { icon: MoreHorizontal, label: "More"   },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex flex-col items-center gap-1.5 rounded-[16px] bg-white/5 py-3 hover:bg-white/8 transition">
                    <Icon className="h-5 w-5 text-white/70" />
                    <span className="text-[11px] text-white/60">{label}</span>
                  </button>
                ))}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

// ─── Pots Onboarding ─────────────────────────────────────────────────────────
function PotsOnboarding({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const faqs = [
    {
      icon: Target,
      q: "What are pots?",
      a: "Pots are virtual compartments inside your Botim wallet. Give each one a name and a savings goal — the money stays in your wallet but is earmarked just for that purpose.",
    },
    {
      icon: Wallet,
      q: "Can I use my balance anytime?",
      a: "Yes. Your pot balance is always yours. Withdraw back to your spendable wallet at any time — no lock-ins, no penalties.",
    },
    {
      icon: TrendingUp,
      q: "Can I transfer in/out of a pot anytime?",
      a: "Absolutely. Add funds from your wallet or by card, withdraw back to your wallet, or move money between pots — all instantly.",
    },
    {
      icon: Sparkles,
      q: "How do pots help me?",
      a: "By separating money for specific goals you avoid accidentally spending it. The progress bar keeps you motivated and shows exactly how close you are to each target.",
    },
  ];

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 pt-2">
        {/* Hero */}
        <div className="flex flex-col items-center text-center py-6 gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: POT_DIM }}>
            <Target className="h-7 w-7" style={{ color: POT }} />
          </div>
          <div>
            <div className="text-2xl font-bold mb-1">Save smarter with Pots</div>
            <div className="text-sm text-white/45">Divide your wallet into goal-based compartments.</div>
          </div>
        </div>

        {/* FAQ cards */}
        {faqs.map(({ icon: Icon, q, a }, i) => (
          <div key={i} className="rounded-[20px] bg-[#0f1117] border border-white/8 p-4 flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: POT_DIM }}>
              <Icon className="h-4 w-4" style={{ color: POT }} />
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">{q}</div>
              <div className="text-xs text-white/45 leading-relaxed">{a}</div>
            </div>
          </div>
        ))}

        <button
          onClick={onStart}
          className="rounded-full py-4 text-sm font-semibold text-black mt-2"
          style={{ background: POT }}
        >
          Create my first pot
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── PotsHub ─────────────────────────────────────────────────────────────────
function PotsHub({
  pots, walletTotal, spendable, onNavigate, onSelectPot,
}: {
  pots: Pot[];
  walletTotal: number;
  spendable: number;
  onNavigate: (s: string) => void;
  onSelectPot: (id: string) => void;
}) {
  const totalSaved = pots.reduce((s, p) => s + p.currentAmount, 0);
  const totalGoal = pots.reduce((s, p) => s + p.targetAmount, 0);
  const overallPct = pctOf(totalSaved, totalGoal);
  const atLimit = pots.length >= MAX_POTS;

  return (
    <PageShell
      onBack={() => onNavigate("money-hub")}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      onNavigate={onNavigate}
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
      headerRight={
        <button
          onClick={() => atLimit ? undefined : onNavigate("create-pot-1")}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: atLimit ? "rgba(255,255,255,0.08)" : POT_DIM }}
          title={atLimit ? "Max 10 pots reached" : "New pot"}
        >
          <Plus className="h-5 w-5" style={{ color: atLimit ? "rgba(255,255,255,0.3)" : POT }} />
        </button>
      }
    >
      {/* Summary card */}
      {pots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] p-5 mb-5 border border-white/8"
          style={{ background: "linear-gradient(135deg,rgba(30,10,60,0.95),rgba(10,5,20,0.9))" }}
        >
          <div className="text-xs text-white/45 mb-1">Total saved across all pots</div>
          <div className="text-3xl font-semibold tracking-tight mb-1">{formatAed(totalSaved)}</div>
          <div className="text-xs mb-3" style={{ color: `${POT}99` }}>
            of {formatAed(totalGoal)} goal · {overallPct.toFixed(0)}% there
          </div>
          <ProgressBar pct={overallPct} />
          <div className="mt-3">
            <div className="rounded-xl bg-white/8 px-3 py-2 inline-block">
              <div className="text-xs text-white/45">Pots</div>
              <div className="text-sm font-semibold">{pots.length} / {MAX_POTS}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pot list */}
      {pots.length > 0 ? (
        <div className="flex flex-col gap-3">
          {pots.map((pot, i) => {
            const pct = pctOf(pot.currentAmount, pot.targetAmount);
            const remaining = pot.targetAmount - pot.currentAmount;
            return (
              <motion.button
                key={pot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectPot(pot.id)}
                className="w-full text-left rounded-[22px] bg-[#0f1117] border border-white/8 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{pot.name}</div>
                    <div className="text-xs text-white/40">{pct.toFixed(0)}% of goal</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold">{formatAed(pot.currentAmount)}</div>
                    <div className="text-xs text-white/40">of {formatAed(pot.targetAmount)}</div>
                  </div>
                </div>
                <ProgressBar pct={pct} />
                {remaining > 0 && (
                  <div className="text-xs text-white/30 mt-1.5">{formatAed(remaining)} remaining</div>
                )}
                {remaining <= 0 && (
                  <div className="text-xs mt-1.5 font-semibold" style={{ color: POT }}>Goal reached!</div>
                )}
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center pt-16 pb-8 gap-4">
          <div className="text-5xl mb-2">🏺</div>
          <div className="font-semibold text-lg">No pots yet</div>
          <div className="text-sm text-white/45 max-w-[240px]">Create a pot to start saving toward a goal — Hajj, education, a new gadget, anything.</div>
          <button
            onClick={() => onNavigate("create-pot-1")}
            className="mt-2 rounded-full px-6 py-3 text-sm font-semibold text-black"
            style={{ background: POT }}
          >
            Create your first pot
          </button>
        </motion.div>
      )}

      {/* Max pots warning */}
      {atLimit && (
        <div className="mt-4 rounded-[16px] border border-white/10 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-400" />
          <div className="text-xs text-white/55">You've reached the maximum of 10 pots. Delete a pot to create a new one.</div>
        </div>
      )}
    </PageShell>
  );
}

// ─── Create Pot — Step 1: Name ───────────────────────────────────────────────
const NAME_ALLOWED = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/;
const NAME_MAX = 32;

function CreatePot1({
  onBack, onNext,
}: {
  onBack: () => void;
  onNext: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const hasSpecial = name.length > 0 && !NAME_ALLOWED.test(name);
  const isValid = name.trim().length > 0 && !hasSpecial;

  function handleChange(v: string) {
    if (v.length <= NAME_MAX) setName(v);
  }

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: s === 1 ? POT : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
        <div className="text-xs text-white/40">Step 1 of 3</div>

        <div>
          <div className="text-xl font-semibold mb-1">Name your pot</div>
          <div className="text-sm text-white/45">Give it a name that matches your goal.</div>
        </div>

        <div
          className="rounded-[20px] bg-[#0f1117] border px-4 py-3 transition"
          style={{ borderColor: hasSpecial ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-white/45">Pot name</div>
            <div className="text-xs" style={{ color: name.length >= NAME_MAX ? "rgb(248,113,113)" : "rgba(255,255,255,0.3)" }}>
              {name.length}/{NAME_MAX}
            </div>
          </div>
          <input
            className="w-full bg-transparent text-white text-base outline-none placeholder-white/25"
            placeholder="e.g. Hajj 2026, MacBook, Emergency"
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            autoFocus
          />
          {hasSpecial && (
            <div className="text-xs text-red-400 mt-2">Only letters, numbers, and spaces allowed</div>
          )}
        </div>

        <button
          onClick={() => isValid && onNext(name.trim())}
          disabled={!isValid}
          className="rounded-full py-4 text-sm font-semibold transition"
          style={{ background: isValid ? POT : "rgba(255,255,255,0.1)", color: isValid ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          Continue
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Create Pot — Step 2: Target Amount ──────────────────────────────────────
function CreatePot2({
  potName, onBack, onNext,
}: {
  potName: string;
  onBack: () => void;
  onNext: (target: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const amount = parseFloat(raw) || 0;

  function handleInput(v: string) {
    if (/^\d*\.?\d{0,2}$/.test(v)) setRaw(v);
  }

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: s <= 2 ? POT : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
        <div className="text-xs text-white/40">Step 2 of 3</div>

        <div className="font-semibold">{potName}</div>

        <div>
          <div className="text-xl font-semibold mb-1">Set a savings goal</div>
          <div className="text-sm text-white/45">How much do you want to save?</div>
        </div>

        {/* Amount input */}
        <div className="rounded-[24px] bg-[#0f1117] border border-white/8 px-5 py-6 flex flex-col items-center gap-2">
          <div className="text-xs text-white/45 mb-1">Target amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white/40">AED</span>
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-white outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => handleInput(e.target.value)}
              autoFocus
            />
          </div>
          <div className="text-xs text-white/30">Enter the total amount you want to reach</div>
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 flex-wrap">
          {[500, 1000, 2500, 5000, 10000].map((v) => (
            <button
              key={v}
              onClick={() => setRaw(String(v))}
              className="rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                background: amount === v ? POT_DIM : "rgba(255,255,255,0.07)",
                color: amount === v ? POT : "rgba(255,255,255,0.55)",
                border: amount === v ? `1px solid ${POT}44` : "1px solid transparent",
              }}
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>

        <button
          onClick={() => amount > 0 && onNext(amount)}
          disabled={amount <= 0}
          className="rounded-full py-4 text-sm font-semibold transition"
          style={{ background: amount > 0 ? POT : "rgba(255,255,255,0.1)", color: amount > 0 ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          Continue
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Create Pot — Step 3: Initial Deposit ────────────────────────────────────
function CreatePot3({
  potName, targetAmount, spendable, onBack, onCreate,
}: {
  potName: string;
  targetAmount: number;
  spendable: number;
  onBack: () => void;
  onCreate: (depositAmount: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const amount = parseFloat(raw) || 0;
  const isValid = amount > 0 && amount <= spendable;
  const isOverLimit = amount > spendable;

  function handleInput(v: string) {
    if (/^\d*\.?\d{0,2}$/.test(v)) setRaw(v);
  }

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: POT }} />
          ))}
        </div>
        <div className="text-xs text-white/40">Step 3 of 3</div>

        {/* Pot preview */}
        <div className="flex items-center gap-2">
          <span className="font-semibold">{potName}</span>
          <span className="text-white/40">·</span>
          <span className="text-sm text-white/45">goal {formatAed(targetAmount)}</span>
        </div>

        <div>
          <div className="text-xl font-semibold mb-1">Add a starting amount</div>
          <div className="text-sm text-white/45">Move money from your wallet into this pot.</div>
        </div>

        {/* Available balance */}
        <div className="rounded-[18px] border border-white/8 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-white/55">Available to move</div>
          <div className="text-sm font-semibold">{formatAed(spendable)}</div>
        </div>

        {/* Amount input */}
        <div
          className="rounded-[24px] bg-[#0f1117] border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: isOverLimit ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="text-xs text-white/45 mb-1">Deposit amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white/40">AED</span>
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-white outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => handleInput(e.target.value)}
              autoFocus
            />
          </div>
          {isOverLimit && (
            <div className="text-xs text-red-400 mt-1">Exceeds your spendable balance</div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => isValid && onCreate(amount)}
            disabled={!isValid}
            className="rounded-full py-4 text-sm font-semibold transition"
            style={{ background: isValid ? POT : "rgba(255,255,255,0.1)", color: isValid ? "#000" : "rgba(255,255,255,0.3)" }}
          >
            Create pot
          </button>
          <button
            onClick={() => onCreate(0)}
            className="rounded-full py-3 text-sm text-white/45 font-medium"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </PageShell>
  );
}

// ─── Create Pot — Success ────────────────────────────────────────────────────
function CreatePotSuccess({
  potName, depositAmount, onDone,
}: {
  potName: string;
  depositAmount: number;
  onDone: () => void;
}) {
  return (
    <div className={phone} style={{ background: "linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: POT_DIM, border: `2px solid ${POT}44` }}
        >
          <Check className="h-9 w-9" style={{ color: POT }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="text-2xl font-bold mb-2">Pot created!</div>
          <div className="text-lg font-semibold mb-3">{potName}</div>
          {depositAmount > 0 ? (
            <div className="text-sm text-white/55">
              <span style={{ color: POT }} className="font-semibold">{formatAed(depositAmount)}</span> moved to your pot
            </div>
          ) : (
            <div className="text-sm text-white/55">Your pot is ready. Add money whenever you like.</div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="rounded-full px-8 py-4 text-sm font-semibold text-black"
          style={{ background: POT }}
        >
          View my pots
        </motion.button>
      </div>
    </div>
  );
}

// ─── Pot Detail ───────────────────────────────────────────────────────────────
function PotDetail({
  pot, spendable, otherPotsExist, onBack, onAddMoney, onWithdraw, onTransfer, onDeleteConfirm,
}: {
  pot: Pot;
  spendable: number;
  otherPotsExist: boolean;
  onBack: () => void;
  onAddMoney: () => void;
  onWithdraw: () => void;
  onTransfer: () => void;
  onDeleteConfirm: () => void;
}) {
  const pct = pctOf(pot.currentAmount, pot.targetAmount);
  const remaining = Math.max(0, pot.targetAmount - pot.currentAmount);
  const goalReached = pot.currentAmount >= pot.targetAmount;

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
        {/* Hero card */}
        <div
          className="rounded-[28px] p-6 border border-white/8 text-center"
          style={{ background: "linear-gradient(135deg,rgba(30,10,60,0.95),rgba(10,5,20,0.9))" }}
        >
          <div className="text-xl font-semibold mb-4">{pot.name}</div>
          <div className="text-xs text-white/40 mb-1">Saved</div>
          <div className="text-4xl font-semibold tracking-tight mb-4">{formatAed(pot.currentAmount)}</div>

          <ProgressBar pct={pct} />
          <div className="flex justify-between text-xs text-white/35 mt-1.5">
            <span>{pct.toFixed(0)}% saved</span>
            <span>Goal: {formatAed(pot.targetAmount)}</span>
          </div>

          {goalReached ? (
            <div className="mt-3 rounded-full px-3 py-1 text-xs font-semibold inline-block" style={{ background: POT_DIM, color: POT }}>
              Goal reached!
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/45">{formatAed(remaining)} to go</div>
          )}
        </div>

        {/* Stats */}
        <div className="rounded-[20px] bg-[#0f1117] border border-white/8 divide-y divide-white/8">
          {[
            { label: "Saved so far", value: formatAed(pot.currentAmount) },
            { label: "Goal", value: formatAed(pot.targetAmount) },
            { label: "Remaining", value: formatAed(remaining) },
            { label: "Progress", value: `${pct.toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-white/55">{label}</div>
              <div className="text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onAddMoney}
            disabled={goalReached}
            className="rounded-full py-4 text-sm font-semibold"
            style={{ background: goalReached ? "rgba(255,255,255,0.1)" : POT, color: goalReached ? "rgba(255,255,255,0.3)" : "#000" }}
          >
            Add money
          </button>
          <button
            onClick={onWithdraw}
            disabled={pot.currentAmount <= 0}
            className="rounded-full py-4 text-sm font-semibold border"
            style={{
              borderColor: pot.currentAmount > 0 ? `${POT}55` : "rgba(255,255,255,0.1)",
              color: pot.currentAmount > 0 ? POT : "rgba(255,255,255,0.3)",
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Transfer between pots */}
        {otherPotsExist && (
          <button
            onClick={onTransfer}
            disabled={goalReached}
            className="rounded-full py-4 text-sm font-semibold border w-full"
            style={{
              borderColor: goalReached ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
              color: goalReached ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
            }}
          >
            Transfer from another pot
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDeleteConfirm}
          className="flex items-center justify-center gap-2 rounded-full py-3 text-sm text-red-400/70 border border-red-500/15"
        >
          <Trash2 className="h-4 w-4" />
          Delete pot
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Add Money — amount entry ─────────────────────────────────────────────────
function PotAddMoney({
  pot, spendable, monthlyRemaining, onBack, onNext,
}: {
  pot: Pot;
  spendable: number;
  monthlyRemaining: number;
  onBack: () => void;
  onNext: (amount: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const amount = parseFloat(raw) || 0;
  const isOverMonthlyLimit = amount > monthlyRemaining;
  const canContinue = amount > 0 && !isOverMonthlyLimit;
  const remaining = Math.max(0, pot.targetAmount - pot.currentAmount);
  const goalReached = remaining === 0;

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold">{pot.name}</div>
        <div className="text-xl font-semibold">Add money to pot</div>

        <div
          className="rounded-[24px] bg-[#0f1117] border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: isOverMonthlyLimit ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="text-xs text-white/45 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white/40">AED</span>
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-white outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setRaw(e.target.value); }}
              autoFocus
            />
          </div>
          {isOverMonthlyLimit && (
            <div className="text-xs text-red-400 mt-1">
              Monthly limit reached — you can deposit up to {formatAed(Math.max(0, monthlyRemaining))} this month
            </div>
          )}
        </div>

        {/* Goal nudge */}
        {!goalReached ? (
          <button
            onClick={() => setRaw(String(remaining))}
            className="rounded-[18px] border border-white/8 px-4 py-3.5 flex items-center justify-between text-left transition hover:brightness-110"
            style={{ background: amount === remaining ? POT_DIM : "#0f1117", borderColor: amount === remaining ? `${POT}44` : "rgba(255,255,255,0.08)" }}
          >
            <div>
              <div className="text-xs text-white/45">To reach your goal</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: amount === remaining ? POT : "white" }}>
                {formatAed(remaining)} needed
              </div>
            </div>
            <div className="text-xs rounded-full px-3 py-1 font-semibold" style={{ background: POT_DIM, color: POT }}>
              Add full amount
            </div>
          </button>
        ) : (
          <div className="rounded-[18px] border border-white/8 px-4 py-3.5 flex items-center gap-3">
            <Check className="h-4 w-4 shrink-0" style={{ color: POT }} />
            <div className="text-sm text-white/55">You've already hit your goal — any extra goes beyond it.</div>
          </div>
        )}

        <button
          onClick={() => canContinue && onNext(amount)}
          disabled={!canContinue}
          className="rounded-full py-4 text-sm font-semibold"
          style={{ background: canContinue ? POT : "rgba(255,255,255,0.1)", color: canContinue ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          Choose payment method
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Payment Method ───────────────────────────────────────────────────────────
type PayMethod = "wallet" | "debit" | "applepay";

function PotPaymentMethod({
  pot, amount, spendable, onBack, onWallet, onCard,
}: {
  pot: Pot;
  amount: number;
  spendable: number;
  onBack: () => void;
  onWallet: () => void;
  onCard: () => void;
}) {
  const [selected, setSelected] = useState<PayMethod | null>(null);
  const walletOk = spendable >= amount;

  const methods: { id: PayMethod; label: string; sub: string; icon: React.ReactNode; disabled?: boolean; badge?: string }[] = [
    {
      id: "wallet",
      label: "Botim Wallet",
      sub: walletOk ? `Balance: ${formatAed(spendable)}` : `Need ${formatAed(amount - spendable)} more`,
      icon: <Wallet className="h-5 w-5" />,
      disabled: !walletOk,
      badge: walletOk ? undefined : "Insufficient",
    },
    {
      id: "debit",
      label: "Debit card",
      sub: "Visa •••• 4782",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "applepay",
      label: "Apple Pay",
      sub: "Touch ID or Face ID",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
    },
  ];

  function handleConfirm() {
    if (!selected) return;
    if (selected === "wallet") { onWallet(); return; }
    onCard(); // debit + applepay both go to CVV / processing
  }

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold">{pot.name}</div>

        <div>
          <div className="text-xl font-semibold mb-1">How would you like to pay?</div>
          <div className="text-sm text-white/45">{formatAed(amount)} into your pot</div>
        </div>

        <div className="flex flex-col gap-3">
          {methods.map((m) => {
            const isSelected = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => !m.disabled && setSelected(m.id)}
                disabled={m.disabled}
                className="w-full rounded-[22px] border p-5 text-left transition"
                style={{
                  borderColor: isSelected ? POT : "rgba(255,255,255,0.08)",
                  background: isSelected ? POT_DIM : "#0f1117",
                  opacity: m.disabled ? 0.45 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2.5"
                      style={{ background: isSelected ? `${POT}22` : "rgba(255,255,255,0.07)", color: isSelected ? POT : "rgba(255,255,255,0.7)" }}>
                      {m.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {m.label}
                        {m.badge && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">{m.badge}</span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{m.sub}</div>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: isSelected ? POT : "rgba(255,255,255,0.2)" }}>
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full" style={{ background: POT }} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          disabled={!selected}
          onClick={handleConfirm}
          className="rounded-full py-4 text-sm font-semibold transition disabled:opacity-30"
          style={{ background: selected ? POT : "rgba(255,255,255,0.1)", color: selected ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          {selected === "debit" ? "Enter CVV" : selected === "applepay" ? "Pay with Apple Pay" : selected === "wallet" ? "Confirm deposit" : "Continue"}
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Card CVV ─────────────────────────────────────────────────────────────────
function PotCardCvv({
  pot, amount, onBack, onConfirm,
}: {
  pot: Pot;
  amount: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = cvv.length === 3;

  function handlePay() {
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 1200);
  }

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white/8 p-3">
            <CreditCard className="h-6 w-6 text-white/70" />
          </div>
          <div>
            <div className="text-lg font-semibold">Visa •••• 4782</div>
            <div className="text-sm text-white/45">Confirm {formatAed(amount)} into {pot.name}</div>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#0f1117] p-6">
          <div className="mb-2 text-xs text-white/45 uppercase tracking-wider">CVV</div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={3}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="•••"
            className="w-full bg-transparent text-4xl font-semibold tracking-[0.5em] outline-none placeholder-white/15 text-white"
            autoFocus
          />
          <div className="mt-3 text-xs text-white/35">3-digit code on the back of your card</div>
        </div>

        {/* Card visual */}
        <div className="flex justify-center">
          <div className="relative w-52 h-32 rounded-[20px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-4 flex flex-col justify-between">
            <div className="text-xs text-white/40 font-mono">VISA •••• 4782</div>
            <div className="self-end flex flex-col items-end">
              <div className="text-[10px] text-white/35 mb-0.5">CVV</div>
              <div className="rounded-md border px-3 py-1 text-xs font-mono"
                style={{ borderColor: valid ? POT : "rgba(255,255,255,0.2)", color: valid ? POT : "rgba(255,255,255,0.4)" }}>
                {cvv.length > 0 ? "•".repeat(cvv.length) : "•••"}
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={!valid || loading}
          onClick={handlePay}
          className="rounded-full py-4 text-sm font-semibold transition disabled:opacity-30"
          style={{ background: valid ? POT : "rgba(255,255,255,0.1)", color: valid ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          {loading ? "Processing…" : `Pay ${formatAed(amount)}`}
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Deposit Success ──────────────────────────────────────────────────────────
function PotDepositSuccess({
  pot, amount, payMethod, onDone,
}: {
  pot: Pot;
  amount: number;
  payMethod: PayMethod;
  onDone: () => void;
}) {
  const methodLabel = payMethod === "debit" ? "Visa •••• 4782" : payMethod === "applepay" ? "Apple Pay" : "Botim Wallet";

  return (
    <div className={phone} style={{ background: "linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: POT_DIM, border: `2px solid ${POT}44` }}
        >
          <BadgeCheck className="h-10 w-10" style={{ color: POT }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
          <div className="text-2xl font-bold mb-1">Deposit successful!</div>
          <div className="text-sm text-white/45 mb-6">
            <span style={{ color: POT }} className="font-semibold">{formatAed(amount)}</span> added to {pot.name}
          </div>

          <div className="rounded-[24px] bg-[#0f1117] divide-y divide-white/8 text-left mb-6">
            {[
              { label: "Pot",    value: pot.name },
              { label: "Amount", value: formatAed(amount) },
              { label: "Paid via", value: methodLabel },
              { label: "New pot balance", value: formatAed(pot.currentAmount) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-5 py-3.5">
                <span className="text-sm text-white/50">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="w-full rounded-full py-4 text-sm font-semibold text-black"
          style={{ background: POT }}
        >
          Back to pot
        </motion.button>
      </div>
    </div>
  );
}

// ─── Withdraw ─────────────────────────────────────────────────────────────────
function PotWithdraw({
  pot, onBack, onConfirm,
}: {
  pot: Pot;
  onBack: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const amount = parseFloat(raw) || 0;
  const isValid = amount > 0 && amount <= pot.currentAmount;
  const isOver = amount > pot.currentAmount;

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold">{pot.name}</div>
        <div className="text-xl font-semibold">Withdraw from pot</div>

        <div className="rounded-[18px] border border-white/8 px-4 py-3 flex justify-between items-center">
          <div className="text-sm text-white/55">Available in pot</div>
          <div className="text-sm font-semibold">{formatAed(pot.currentAmount)}</div>
        </div>

        <div
          className="rounded-[24px] bg-[#0f1117] border px-5 py-6 flex flex-col items-center gap-2"
          style={{ borderColor: isOver ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="text-xs text-white/45 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white/40">AED</span>
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-white outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setRaw(e.target.value); }}
              autoFocus
            />
          </div>
          {isOver && <div className="text-xs text-red-400">Exceeds pot balance</div>}
        </div>

        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => {
            const v = Math.floor((pot.currentAmount * pct) / 100 * 100) / 100;
            return (
              <button key={pct} onClick={() => setRaw(String(v))} className="flex-1 rounded-full py-2 text-xs font-semibold"
                style={{ background: amount === v ? POT_DIM : "rgba(255,255,255,0.07)", color: amount === v ? POT : "rgba(255,255,255,0.55)", border: amount === v ? `1px solid ${POT}44` : "1px solid transparent" }}>
                {pct}%
              </button>
            );
          })}
        </div>

        <div className="rounded-[16px] border border-white/8 p-3 flex gap-2 items-start">
          <Target className="h-4 w-4 mt-0.5 text-white/35 flex-shrink-0" />
          <div className="text-xs text-white/45">Withdrawn funds go back to your spendable wallet balance.</div>
        </div>

        <button
          onClick={() => isValid && onConfirm(amount)}
          disabled={!isValid}
          className="rounded-full py-4 text-sm font-semibold border"
          style={{
            borderColor: isValid ? `${POT}55` : "rgba(255,255,255,0.1)",
            color: isValid ? POT : "rgba(255,255,255,0.3)",
          }}
        >
          Withdraw {amount > 0 && isValid ? formatAed(amount) : ""}
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
  pot, onBack, onDelete,
}: {
  pot: Pot;
  onBack: () => void;
  onDelete: () => void;
}) {
  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-8">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <div className="text-xl font-semibold mb-2">Delete {pot.name}?</div>
            <div className="text-sm text-white/55 max-w-[260px] mx-auto">
              {pot.currentAmount > 0
                ? <><span className="text-white font-semibold">{formatAed(pot.currentAmount)}</span> will be returned to your spendable wallet balance.</>
                : "This pot is empty and will be permanently deleted."}
            </div>
          </div>
        </div>

        {pot.currentAmount > 0 && (
          <div className="rounded-[18px] border border-red-500/20 bg-red-500/8 p-4 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-red-300 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">Your progress toward this goal will be lost. You can always create a new pot.</div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={onDelete}
            className="rounded-full py-4 text-sm font-semibold text-white bg-red-500/80"
          >
            Yes, delete pot
          </button>
          <button
            onClick={onBack}
            className="rounded-full py-4 text-sm font-semibold text-white/55"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </PageShell>
  );
}

// ─── Pot Transfer ─────────────────────────────────────────────────────────────
function PotTransfer({
  destPot, allPots, onBack, onConfirm,
}: {
  destPot: Pot;
  allPots: Pot[];
  onBack: () => void;
  onConfirm: (amount: number, sourcePotId: string) => void;
}) {
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [raw, setRaw] = useState("");

  const eligible = allPots.filter((p) => p.id !== destPot.id && p.currentAmount > 0);
  const sourcePot = allPots.find((p) => p.id === sourceId) ?? null;
  const amount = parseFloat(raw) || 0;

  const destRemaining = Math.max(0, destPot.targetAmount - destPot.currentAmount);
  const sourceMax = sourcePot?.currentAmount ?? 0;
  const isOverSource = amount > sourceMax;
  const isOverDest = destRemaining > 0 && amount > destRemaining;
  const hasError = isOverSource || isOverDest;
  const canConfirm = amount > 0 && sourcePot !== null && !hasError;

  // Phase 1 — pick source pot
  if (!sourceId) {
    return (
      <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
          <div>
            <div className="text-xl font-semibold mb-1">Transfer to {destPot.name}</div>
            <div className="text-sm text-white/45">Choose which pot to move money from.</div>
          </div>
          {eligible.length === 0 ? (
            <div className="rounded-[20px] border border-white/8 bg-[#0f1117] px-5 py-8 flex flex-col items-center text-center gap-3">
              <div className="text-2xl">🪣</div>
              <div className="text-sm font-semibold">No pots available to transfer from</div>
              <div className="text-xs text-white/40 max-w-[220px]">Your other pots have no balance. Add money to a pot first before transferring.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {eligible.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSourceId(p.id)}
                  className="rounded-[18px] border border-white/8 bg-[#0f1117] px-4 py-3.5 flex items-center justify-between text-left transition hover:brightness-110"
                >
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{formatAed(p.currentAmount)} available</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </PageShell>
    );
  }

  // Phase 2 — enter amount
  return (
    <PageShell onBack={() => { setSourceId(null); setRaw(""); }} subtitle="POTS" badge="POTS" navCurrent="money" gradient="linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div>
          <div className="text-xl font-semibold mb-1">How much to transfer?</div>
          <div className="text-sm text-white/45">From {sourcePot!.name} → {destPot.name}</div>
        </div>

        {/* Source / dest balance info */}
        <div className="flex flex-col gap-2">
          <div className="rounded-[18px] border border-white/8 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-white/55">Available in {sourcePot!.name}</div>
            <div className="text-sm font-semibold">{formatAed(sourceMax)}</div>
          </div>
          <div className="rounded-[18px] border border-white/8 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-white/55">Remaining goal in {destPot.name}</div>
            <div className="text-sm font-semibold">{formatAed(destRemaining)}</div>
          </div>
        </div>

        {/* Amount input */}
        <div
          className="rounded-[24px] bg-[#0f1117] border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: hasError ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}
        >
          <div className="text-xs text-white/45 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-white/40">AED</span>
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-white outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setRaw(e.target.value); }}
              autoFocus
            />
          </div>
          {isOverSource && (
            <div className="text-xs text-red-400 mt-1">Exceeds available balance in {sourcePot!.name}</div>
          )}
          {!isOverSource && isOverDest && (
            <div className="text-xs text-red-400 mt-1">Exceeds remaining goal in {destPot.name} ({formatAed(destRemaining)} needed)</div>
          )}
        </div>

        <button
          onClick={() => canConfirm && onConfirm(amount, sourceId)}
          disabled={!canConfirm}
          className="rounded-full py-4 text-sm font-semibold transition"
          style={{ background: canConfirm ? POT : "rgba(255,255,255,0.1)", color: canConfirm ? "#000" : "rgba(255,255,255,0.3)" }}
        >
          Confirm transfer
        </button>
      </motion.div>
    </PageShell>
  );
}

// ─── Pot Transfer Success ──────────────────────────────────────────────────────
function PotTransferSuccess({
  amount, sourcePot, destPot, onDone,
}: {
  amount: number;
  sourcePot: Pot;
  destPot: Pot;
  onDone: () => void;
}) {
  return (
    <div className={phone} style={{ background: "linear-gradient(180deg,#000 0%,#0d0820 22%,#000 70%)" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: POT_DIM, border: `2px solid ${POT}44` }}
        >
          <Check className="h-9 w-9" style={{ color: POT }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
          <div className="text-2xl font-bold mb-1">Transfer done!</div>
          <div className="text-sm text-white/45 mb-6">
            <span style={{ color: POT }} className="font-semibold">{formatAed(amount)}</span> moved from {sourcePot.name} to {destPot.name}
          </div>

          <div className="rounded-[24px] bg-[#0f1117] divide-y divide-white/8 text-left">
            {[
              { label: "From", value: sourcePot.name },
              { label: "To",   value: destPot.name },
              { label: "Amount", value: formatAed(amount) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-5 py-3.5">
                <span className="text-sm text-white/50">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="rounded-full px-8 py-4 text-sm font-semibold text-black w-full"
          style={{ background: POT }}
        >
          Done
        </motion.button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PotsPrototype() {
  const [pots, setPots] = useState<Pot[]>([]);
  const [walletTotal, setWalletTotal] = useState(INITIAL_WALLET);
  const [screen, setScreen] = useState("money-hub");
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);

  // Create flow state
  const [draftName, setDraftName] = useState("");
  const [draftTarget, setDraftTarget] = useState(0);
  const [lastDeposit, setLastDeposit] = useState(0);

  // Add money flow state
  const [depositAmount, setDepositAmount] = useState(0);
  const [depositMethod, setDepositMethod] = useState<PayMethod>("wallet");
  const [monthlyDeposited, setMonthlyDeposited] = useState(0);

  // Transfer flow state
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferSourceId, setTransferSourceId] = useState<string | null>(null);

  const MONTHLY_LIMIT = 25_000;
  const monthlyRemaining = MONTHLY_LIMIT - monthlyDeposited;

  const potsTotal = useMemo(() => pots.reduce((s, p) => s + p.currentAmount, 0), [pots]);
  const potsGoalTotal = useMemo(() => pots.reduce((s, p) => s + p.targetAmount, 0), [pots]);
  const spendable = walletTotal - potsTotal;
  const selectedPot = pots.find((p) => p.id === selectedPotId) ?? null;

  function navigate(s: string) { setScreen(s === "money" ? "money-hub" : s); }

  function handleCreateStep1(name: string) {
    setDraftName(name);
    setScreen("create-pot-2");
  }

  function handleCreateStep2(target: number) {
    setDraftTarget(target);
    setScreen("create-pot-3");
  }

  function handleCreateStep3(deposit: number) {
    const newPot: Pot = {
      id: crypto.randomUUID(),
      name: draftName,
      targetAmount: draftTarget,
      currentAmount: deposit,
      createdAt: new Date().toISOString(),
    };
    setPots((prev) => [...prev, newPot]);
    setLastDeposit(deposit);
    setScreen("create-pot-success");
  }

  // Wallet deposit: deducts from spendable (pot allocation) — not a real deposit, no limit deduction
  function handleWalletDeposit() {
    setPots((prev) =>
      prev.map((p) => p.id === selectedPotId ? { ...p, currentAmount: p.currentAmount + depositAmount } : p)
    );
    setDepositMethod("wallet");
    setScreen("pot-deposit-success");
  }

  // Card deposit: money comes from outside, so wallet total grows too
  function handleCardDeposit() {
    setPots((prev) =>
      prev.map((p) => p.id === selectedPotId ? { ...p, currentAmount: p.currentAmount + depositAmount } : p)
    );
    setWalletTotal((prev) => prev + depositAmount);
    setMonthlyDeposited((prev) => prev + depositAmount);
    setDepositMethod("debit");
    setScreen("pot-deposit-success");
  }

  function handleWithdraw(amount: number) {
    setPots((prev) =>
      prev.map((p) => p.id === selectedPotId ? { ...p, currentAmount: p.currentAmount - amount } : p)
    );
    setScreen("pot-detail");
  }

  function handleDelete() {
    setPots((prev) => prev.filter((p) => p.id !== selectedPotId));
    setSelectedPotId(null);
    setScreen("pots-hub");
  }

  function handleTransfer(amount: number, sourcePotId: string) {
    setTransferAmount(amount);
    setTransferSourceId(sourcePotId);
    setPots((prev) => prev.map((p) => {
      if (p.id === sourcePotId) return { ...p, currentAmount: p.currentAmount - amount };
      if (p.id === selectedPotId) return { ...p, currentAmount: p.currentAmount + amount };
      return p;
    }));
    setScreen("pot-transfer-success");
  }

  const sharedProps = { walletTotal, spendable, potsTotal, potsCount: pots.length, potsGoalTotal };


  return (
    <AnimatePresence>
      {screen === "money-hub" && (
        <MoneyHub key="money-hub" {...sharedProps} onNavigate={navigate} />
      )}
      {screen === "pots-hub" && pots.length === 0 && (
        <PotsOnboarding key="pots-onboarding" onBack={() => navigate("money")} onStart={() => setScreen("create-pot-1")} />
      )}
      {screen === "pots-hub" && pots.length > 0 && (
        <PotsHub key="pots-hub" pots={pots} walletTotal={walletTotal} spendable={spendable} onNavigate={navigate} onSelectPot={(id) => { setSelectedPotId(id); setScreen("pot-detail"); }} />
      )}
      {screen === "create-pot-1" && (
        <CreatePot1 key="create-1" onBack={() => setScreen("pots-hub")} onNext={handleCreateStep1} />
      )}
      {screen === "create-pot-2" && (
        <CreatePot2 key="create-2" potName={draftName} onBack={() => setScreen("create-pot-1")} onNext={handleCreateStep2} />
      )}
      {screen === "create-pot-3" && (
        <CreatePot3 key="create-3" potName={draftName} targetAmount={draftTarget} spendable={spendable} onBack={() => setScreen("create-pot-2")} onCreate={handleCreateStep3} />
      )}
      {screen === "create-pot-success" && (
        <CreatePotSuccess key="success" potName={draftName} depositAmount={lastDeposit} onDone={() => setScreen("pots-hub")} />
      )}
      {screen === "pot-detail" && selectedPot && (
        <PotDetail key="pot-detail" pot={selectedPot} spendable={spendable} otherPotsExist={pots.length > 1} onBack={() => setScreen("pots-hub")} onAddMoney={() => setScreen("pot-add")} onWithdraw={() => setScreen("pot-withdraw")} onTransfer={() => setScreen("pot-transfer")} onDeleteConfirm={() => setScreen("pot-delete")} />
      )}
      {screen === "pot-add" && selectedPot && (
        <PotAddMoney key="pot-add" pot={selectedPot} spendable={spendable} monthlyRemaining={monthlyRemaining} onBack={() => setScreen("pot-detail")}
          onNext={(amt) => { setDepositAmount(amt); setScreen("pot-payment-method"); }} />
      )}
      {screen === "pot-payment-method" && selectedPot && (
        <PotPaymentMethod key="pot-payment-method" pot={selectedPot} amount={depositAmount} spendable={spendable}
          onBack={() => setScreen("pot-add")}
          onWallet={handleWalletDeposit}
          onCard={() => setScreen("pot-card-cvv")} />
      )}
      {screen === "pot-card-cvv" && selectedPot && (
        <PotCardCvv key="pot-card-cvv" pot={selectedPot} amount={depositAmount}
          onBack={() => setScreen("pot-payment-method")}
          onConfirm={handleCardDeposit} />
      )}
      {screen === "pot-deposit-success" && selectedPot && (
        <PotDepositSuccess key="pot-deposit-success" pot={selectedPot} amount={depositAmount} payMethod={depositMethod}
          onDone={() => setScreen("pot-detail")} />
      )}
      {screen === "pot-withdraw" && selectedPot && (
        <PotWithdraw key="pot-withdraw" pot={selectedPot} onBack={() => setScreen("pot-detail")} onConfirm={handleWithdraw} />
      )}
      {screen === "pot-delete" && selectedPot && (
        <DeleteConfirm key="pot-delete" pot={selectedPot} onBack={() => setScreen("pot-detail")} onDelete={handleDelete} />
      )}
      {screen === "pot-transfer" && selectedPot && (
        <PotTransfer key="pot-transfer" destPot={selectedPot} allPots={pots} onBack={() => setScreen("pot-detail")} onConfirm={handleTransfer} />
      )}
      {screen === "pot-transfer-success" && selectedPot && transferSourceId && (
        <PotTransferSuccess
          key="pot-transfer-success"
          amount={transferAmount}
          sourcePot={pots.find((p) => p.id === transferSourceId)!}
          destPot={selectedPot}
          onDone={() => setScreen("pot-detail")}
        />
      )}
    </AnimatePresence>
  );
}
