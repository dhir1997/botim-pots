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
  Globe,
  Home,
  LayoutGrid,
  MessageCircle,
  MoreHorizontal,
  Phone,
  PieChart,
  Plus,
  QrCode,
  Receipt,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Target,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const phone = "mx-auto w-full max-w-[420px] h-screen bg-[#f5f5f5] text-gray-900 flex flex-col border border-gray-300 shadow-xl overflow-hidden";
const POT = "#1A4FDB";
const POT_DIM = "rgba(26,79,219,0.1)";
const HERO_GRADIENT = "linear-gradient(160deg,#0d1b6b 0%,#1e3a9f 60%,#2952cc 100%)";
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
  targetDate?: string;
}

// ─── Dirham symbol ───────────────────────────────────────────────────────────
function DirhemSign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 72" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        d="M8,4 L8,68 L26,68 C53,68 55,52 55,36 C55,20 53,4 26,4 Z M18,14 L18,58 C40,58 45,50 45,36 C45,22 40,14 18,14 Z"
      />
      <rect x="0" y="26" width="63" height="7" />
      <rect x="0" y="40" width="63" height="7" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatAed(n: number) {
  return n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DhAmt({ v, className }: { v: number; className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className ?? ""}`}>
      <DirhemSign className="h-[0.85em] w-auto relative top-[0.05em] shrink-0" />
      {formatAed(v)}
    </span>
  );
}

function pctOf(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, (current / target) * 100);
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: string) => void }) {
  const items = [
    { id: "home", label: "Home", icon: Home },
    { id: "calls", label: "Calls", icon: Phone },
    { id: "chats", label: "Chats", icon: MessageCircle },
    { id: "money", label: "Money", icon: Wallet },
    { id: "all", label: "All", icon: LayoutGrid },
  ];
  return (
    <div className="border-t border-gray-200 bg-white/95 backdrop-blur px-3 py-3">
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavigate(id)} className="flex flex-col items-center gap-1 py-1 text-xs">
            <Icon className={`h-5 w-5 ${current === id ? "text-[#1A4FDB]" : "text-gray-400"}`} />
            <span className={current === id ? "text-[#1A4FDB] font-semibold" : "text-gray-400"}>{label}</span>
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
      style={active ? { background: "rgba(26,79,219,0.1)", color: "#1A4FDB" } : { background: "transparent", color: "rgba(17,24,39,0.45)" }}
    >
      {children}
    </button>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color = POT }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
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
    <div className={phone} style={{ background: gradient ?? "#f5f5f5" }}>
      <div className="shrink-0 flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="rounded-full bg-gray-200/70 p-2">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          {subtitle && (
            <div className="flex items-center gap-2">
              <span className="text-[28px] font-bold tracking-tight text-gray-900">botim</span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: POT }}
              >
                {badge ?? subtitle}
              </span>
            </div>
          )}
        </div>
        {headerRight ?? (
          <div className="h-10 w-10 rounded-full bg-[radial-gradient(circle_at_35%_35%,#d4ff8e,#457a33)] ring-2 ring-gray-200" />
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
              className="rounded-[30px] p-6"
              style={{ background: HERO_GRADIENT }}
            >
              <div className="text-sm text-white/70 mb-1">Wallet balance</div>
              <div className="text-4xl font-semibold tracking-tight text-white"><DhAmt v={spendable} /></div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3">
              {[{ icon: Send, label: "Send" }, { icon: QrCode, label: "QR code" }, { icon: Plus, label: "Add funds" }, { icon: ArrowDown, label: "Withdraw" }].map(({ icon: Icon, label }) => (
                <button key={label} className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-full items-center justify-center rounded-[18px] bg-white border border-gray-100 text-gray-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-gray-500">{label}</span>
                </button>
              ))}
            </div>

            {/* Recent transactions */}
            <div>
              <div className="text-sm font-semibold text-gray-500 mb-3">Recent</div>
              <div className="rounded-[20px] bg-white border border-gray-100 divide-y divide-gray-100">
                {[
                  { label: "Noon.com",   sub: "Online purchase", amt: "-AED 149.00"   },
                  { label: "Salary",     sub: "Bank transfer",   amt: "+AED 8,500.00" },
                  { label: "Carrefour",  sub: "POS payment",     amt: "-AED 213.50"   },
                ].map(({ label, sub, amt }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{sub}</div>
                    </div>
                    <div className={`text-sm font-semibold ${amt.startsWith("+") ? "text-[#00c896]" : "text-gray-900"}`}>{amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Credit tab ─────────────────────────────────────────────────── */}
        {tab === "credit" && (
          <motion.div key="credit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            <div className="rounded-[28px] bg-white border border-gray-100 p-6">
              <div className="text-2xl font-semibold mb-2 text-gray-900">Credit</div>
              <p className="text-gray-500 text-sm leading-relaxed">
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
              className="rounded-[30px] p-6"
              style={{ background: HERO_GRADIENT }}
            >
              <div className="text-sm text-white/70 mb-1">Total wealth</div>
              <div className="text-4xl font-semibold tracking-tight text-white">
                <DhAmt v={totalWealth} />
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
                    <div key={h.label} className="flex items-center gap-1 text-xs text-white/60">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: h.color }} />
                      {h.label} {totalWealth > 0 ? Math.round((h.valueAed / totalWealth) * 100) : 0}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* My holdings */}
            <div className="rounded-[28px] bg-white border border-gray-100 p-5">
              <div className="mb-3 text-base font-semibold text-gray-900">My holdings</div>
              <div className="flex flex-col gap-2">

                {/* Static holdings */}
                {STATIC_HOLDINGS.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-[16px] bg-gray-50 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full p-2 shrink-0" style={{ background: `${h.color}18`, color: h.color }}>
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{h.label}</div>
                        <div className="text-xs text-gray-400">{h.ticker}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900"><DhAmt v={h.valueAed} /></div>
                      <div className={`text-xs ${h.change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                        {h.change >= 0 ? "+" : ""}{h.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invest more */}
            <div className="rounded-[28px] bg-white border border-gray-100 p-5">
              <div className="mb-3 text-base font-semibold text-gray-900">Invest more</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, label: "Buy Gold"   },
                  { icon: TrendingUp, label: "Buy Silver" },
                  { icon: PieChart,   label: "Crypto"     },
                  { icon: MoreHorizontal, label: "More"   },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex flex-col items-center gap-1.5 rounded-[16px] bg-gray-50 py-3 hover:bg-gray-100 transition">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="text-[11px] text-gray-500">{label}</span>
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

// ─── All Services ─────────────────────────────────────────────────────────────
function AllServices({ onNavigate }: { onNavigate: (s: string) => void }) {
  const categories = [
    {
      label: "Save & Grow",
      items: [
        { emoji: "🏺", label: "My Pots", sub: "Goal-based saving", action: "pots-hub" },
        { icon: TrendingUp, label: "Investments", sub: "Gold, crypto & more", action: null },
        { icon: PieChart, label: "Portfolios", sub: "Managed funds", action: null },
        { icon: ShieldCheck, label: "Insurance", sub: "Protect what matters", action: null },
      ],
    },
    {
      label: "Send & Pay",
      items: [
        { icon: Send, label: "Send money", sub: "To contacts & accounts", action: null },
        { icon: Globe, label: "Remittance", sub: "International transfers", action: null },
        { icon: Receipt, label: "Pay bills", sub: "Utilities & services", action: null },
        { icon: QrCode, label: "QR Pay", sub: "Scan to pay", action: null },
      ],
    },
  ];

  return (
    <PageShell subtitle="SERVICES" badge="ALL" navCurrent="all" onNavigate={onNavigate}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pb-4">
        {categories.map(({ label, items }) => (
          <div key={label}>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">{label}</div>
            <div className="grid grid-cols-2 gap-3">
              {items.map(({ emoji, icon: Icon, label: itemLabel, sub, action }) => (
                <button
                  key={itemLabel}
                  onClick={() => action && onNavigate(action)}
                  className="rounded-[20px] bg-white border border-gray-100 p-4 text-left flex flex-col gap-3 transition hover:shadow-sm"
                  style={{ opacity: action ? 1 : 0.5, cursor: action ? "pointer" : "default" }}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                    style={{ background: POT_DIM }}
                  >
                    {emoji ? (
                      <span>{emoji}</span>
                    ) : (
                      Icon && <Icon className="h-5 w-5" style={{ color: POT }} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{itemLabel}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </PageShell>
  );
}

// ─── Pots Onboarding ─────────────────────────────────────────────────────────
function PotsOnboarding({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const [showFaqs, setShowFaqs] = useState(false);

  const heroPots = [
    { emoji: "✈️", name: "Home Trip", current: 3200, target: 5000 },
    { emoji: "📱", name: "New Phone", current: 850, target: 2500 },
    { emoji: "🛡️", name: "Emergency", current: 4100, target: 8000 },
  ];

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
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2 pb-4">

        {/* Hero — stacked pot cards */}
        <div className="relative h-44 mx-2 mt-2">
          {heroPots.map((p, i) => {
            const offsets = [
              { top: 24, scale: 0.88, zIndex: 0, opacity: 0.55 },
              { top: 12, scale: 0.94, zIndex: 1, opacity: 0.75 },
              { top: 0,  scale: 1,    zIndex: 2, opacity: 1 },
            ];
            const o = offsets[i];
            const pct = Math.round((p.current / p.target) * 100);
            return (
              <div
                key={i}
                className="absolute inset-x-0 rounded-[22px] bg-white border border-gray-100 shadow-sm px-4 py-3"
                style={{ top: o.top, transform: `scale(${o.scale})`, transformOrigin: "bottom center", zIndex: o.zIndex, opacity: o.opacity }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-sm font-semibold text-gray-800">{p.name}</span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: POT }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: POT }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-400"><DhAmt v={p.current} /></span>
                  <span className="text-xs text-gray-400"><DhAmt v={p.target} /></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Headline + subheadline */}
        <div className="text-center px-2">
          <div className="text-[22px] font-bold leading-snug text-gray-900 mb-2">
            Your money, sorted by<br />what matters
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            Create pots for your goals — flight home, new phone, emergency fund. Watch them fill up. Withdraw anytime.
          </div>
        </div>

        {/* Value pills */}
        <div className="flex gap-2 justify-center px-1 flex-wrap">
          {[
            { icon: "🎯", label: "Goal-based" },
            { icon: "⚡", label: "Instant access" },
            { icon: "🔒", label: "No lock-ins" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-gray-700"
              style={{ borderColor: "rgba(26,79,219,0.25)", background: POT_DIM }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Reassurance */}
        <div className="text-center text-[11px] text-gray-400 leading-relaxed px-4">
          Money stays in your Botim wallet — always yours, always accessible.
        </div>

        {/* CTA */}
        <button
          onClick={onStart}
          className="rounded-full py-4 text-sm font-semibold text-white mx-0"
          style={{ background: POT }}
        >
          Create my first pot
        </button>

        {/* Ghost link to FAQs */}
        <button
          onClick={() => setShowFaqs(v => !v)}
          className="text-sm text-center font-medium pb-1"
          style={{ color: POT }}
        >
          How do pots work? {showFaqs ? "↑" : "→"}
        </button>

        {/* Collapsible FAQs */}
        <AnimatePresence>
          {showFaqs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              {faqs.map(({ icon: Icon, q, a }, i) => (
                <div key={i} className="rounded-[20px] bg-white border border-gray-100 p-4 flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: POT_DIM }}>
                    <Icon className="h-4 w-4" style={{ color: POT }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1 text-gray-900">{q}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{a}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </PageShell>
  );
}

// ─── PotsHub ─────────────────────────────────────────────────────────────────
function PotsHub({
  pots, walletTotal, spendable, onNavigate, onSelectPot, onWithdrawPot, onNewPot,
}: {
  pots: Pot[];
  walletTotal: number;
  spendable: number;
  onNavigate: (s: string) => void;
  onSelectPot: (id: string) => void;
  onWithdrawPot: (id: string) => void;
  onNewPot: () => void;
}) {
  const totalSaved = pots.reduce((s, p) => s + p.currentAmount, 0);
  const totalGoal = pots.reduce((s, p) => s + p.targetAmount, 0);
  const overallPct = pctOf(totalSaved, totalGoal);
  const atLimit = pots.length >= MAX_POTS;

  return (
    <PageShell
      onBack={() => onNavigate("all-services")}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
      onNavigate={onNavigate}
      headerRight={
        <button
          onClick={() => atLimit ? undefined : onNavigate("create-pot-1")}
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: atLimit ? "rgba(17,24,39,0.06)" : POT_DIM }}
          title={atLimit ? "Max 10 pots reached" : "New pot"}
        >
          <Plus className="h-5 w-5" style={{ color: atLimit ? "rgba(17,24,39,0.3)" : POT }} />
        </button>
      }
    >
      {/* Summary banner */}
      {pots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[12px] p-4 mb-5"
          style={{ background: "#F0F4FF", border: "1px solid #DDE3F5" }}
        >
          <div className="text-xs mb-1" style={{ color: "#6B7280" }}>Total saved across all pots</div>
          <div className="text-[28px] font-bold leading-tight mb-1" style={{ color: POT }}><DhAmt v={totalSaved} /></div>
          <div className="text-xs mb-3" style={{ color: "#6B7280" }}>
            of <DhAmt v={totalGoal} /> goal · {overallPct.toFixed(0)}% there
          </div>
          {/* Slim 6px progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "#DDE3F5" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ background: POT }}
            />
          </div>
          {/* Pots count pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-[6px] px-2.5 py-1" style={{ background: "#E8EDFB" }}>
              <span className="text-[11px]" style={{ color: "#6B7280" }}>Pots</span>
              <span className="text-[11px] font-bold" style={{ color: POT }}>{pots.length} / {MAX_POTS}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pot list */}
      {pots.length > 0 ? (
        <div className="flex flex-col gap-3">
          {pots.map((pot, i) => {
            const pct = pctOf(pot.currentAmount, pot.targetAmount);
            const remaining = Math.max(0, pot.targetAmount - pot.currentAmount);
            const goalReached = pot.currentAmount >= pot.targetAmount;
            return (
              <motion.div
                key={pot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectPot(pot.id)}
                className="w-full rounded-[20px] p-5 cursor-pointer"
                style={{ background: HERO_GRADIENT, boxShadow: "0 4px 16px rgba(26,79,219,0.25)" }}
              >
                {goalReached ? (
                  <>
                    {/* Top row — name + celebration badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-base text-white">{pot.name}</div>
                      <div className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "rgba(255,255,255,0.2)" }}>
                        <span className="text-xs">🎉</span>
                        <span className="text-[11px] font-semibold text-white">Goal!</span>
                      </div>
                    </div>
                    {/* Amount row — mirrors in-progress structure */}
                    <div className="flex items-end gap-5 mb-4">
                      <div>
                        <div className="text-3xl font-bold text-white leading-none mb-1.5"><DhAmt v={pot.currentAmount} /></div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Saved</div>
                      </div>
                      <div className="mb-0.5">
                        <div className="text-[22px] font-normal leading-none mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}><DhAmt v={pot.targetAmount} /></div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Goal</div>
                      </div>
                    </div>
                    {/* Full progress bar */}
                    <div className="h-2.5 rounded-full mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.9)" }} />
                    </div>
                    {/* Below bar — text action links */}
                    <div className="flex justify-between items-center" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onWithdrawPot(pot.id)}
                        className="text-xs font-medium"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        Withdraw
                      </button>
                      <button
                        onClick={onNewPot}
                        className="text-xs font-bold text-white"
                      >
                        New pot →
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-base text-white">{pot.name}</div>
                      <MoreHorizontal className="h-5 w-5" style={{ color: "rgba(255,255,255,0.5)" }} />
                    </div>
                    {/* Amount row */}
                    <div className="flex items-end gap-5 mb-4">
                      <div>
                        <div className="text-3xl font-bold text-white leading-none mb-1.5"><DhAmt v={pot.currentAmount} /></div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Saved</div>
                      </div>
                      <div className="mb-0.5">
                        <div className="text-[22px] font-normal leading-none mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}><DhAmt v={pot.targetAmount} /></div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Goal</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2.5 rounded-full mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ background: "rgba(255,255,255,0.9)" }}
                      />
                    </div>
                    {/* Below bar */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{pct.toFixed(0)}% saved</div>
                      <div className="text-xs font-bold text-white"><DhAmt v={remaining} /> to go</div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center pt-16 pb-8 gap-4">
          <div className="text-5xl mb-2">🏺</div>
          <div className="font-semibold text-lg text-gray-900">No pots yet</div>
          <div className="text-sm text-gray-500 max-w-[240px]">Create a pot to start saving toward a goal — Hajj, education, a new gadget, anything.</div>
          <button
            onClick={() => onNavigate("create-pot-1")}
            className="mt-2 rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ background: POT }}
          >
            Create your first pot
          </button>
        </motion.div>
      )}

      {/* Max pots warning */}
      {atLimit && (
        <div className="mt-4 rounded-[16px] border border-gray-200 bg-white p-4 flex gap-3 items-start">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-500" />
          <div className="text-xs text-gray-500">You've reached the maximum of 10 pots. Delete a pot to create a new one.</div>
        </div>
      )}
    </PageShell>
  );
}

// ─── Create Pot — Step 1: Name ───────────────────────────────────────────────
const NAME_ALLOWED = /^[a-zA-Z0-9؀-ۿ\s]*$/;
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
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: s === 1 ? POT : "rgba(17,24,39,0.1)" }} />
          ))}
        </div>
        <div className="text-xs text-gray-400">Step 1 of 3</div>

        <div>
          <div className="text-xl font-semibold mb-1 text-gray-900">Name your pot</div>
          <div className="text-sm text-gray-500">Give it a name that matches your goal.</div>
        </div>

        <div
          className="rounded-[20px] bg-white border px-4 py-3 transition"
          style={{ borderColor: hasSpecial ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="flex justify-between items-center mb-1">
            <div className="text-xs text-gray-500">Pot name</div>
            <div className="text-xs" style={{ color: name.length >= NAME_MAX ? "rgb(248,113,113)" : "rgba(17,24,39,0.3)" }}>
              {name.length}/{NAME_MAX}
            </div>
          </div>
          <input
            className="w-full bg-transparent text-gray-900 text-base outline-none placeholder-gray-300"
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
          style={{ background: isValid ? POT : "rgba(17,24,39,0.08)", color: isValid ? "#fff" : "rgba(17,24,39,0.3)" }}
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
  onNext: (target: number, targetDate?: string) => void;
}) {
  const TARGET_MIN = 100;
  const TARGET_MAX = 100_000;
  const todayStr = new Date().toISOString().split("T")[0];

  const [raw, setRaw] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const amount = parseFloat(raw) || 0;
  const isBelowMin = amount > 0 && amount < TARGET_MIN;
  const isAboveMax = amount > TARGET_MAX;
  const hasError = isBelowMin || isAboveMax;
  const isValid = amount >= TARGET_MIN && amount <= TARGET_MAX;

  const dateIsPast = targetDate ? targetDate < todayStr : false;

  const dateLabel = useMemo(() => {
    if (!targetDate || dateIsPast) return null;
    const days = Math.round((new Date(targetDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} away`;
    const months = Math.round(days / 30.44);
    return `${months} month${months !== 1 ? "s" : ""} away`;
  }, [targetDate, dateIsPast, todayStr]);

  function handleInput(v: string) {
    if (/^\d*\.?\d{0,2}$/.test(v)) setRaw(v);
  }

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: s <= 2 ? POT : "rgba(17,24,39,0.1)" }} />
          ))}
        </div>
        <div className="text-xs text-gray-400">Step 2 of 3</div>

        <div className="font-semibold text-gray-900">{potName}</div>

        <div>
          <div className="text-xl font-semibold mb-1 text-gray-900">Set a savings goal</div>
          <div className="text-sm text-gray-500">How much do you want to save?</div>
        </div>

        {/* Amount input */}
        <div
          className="rounded-[24px] bg-white border px-5 py-5 flex flex-col gap-1.5 transition"
          style={{ borderColor: hasError ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="text-xs text-gray-500">Target amount</div>
          <div className="flex items-baseline gap-2">
            <DirhemSign className="h-8 w-auto text-gray-400 shrink-0" />
            <input
              type="text"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-gray-900 outline-none flex-1 min-w-0"
              placeholder="0.00"
              value={raw}
              onChange={(e) => handleInput(e.target.value)}
              autoFocus
            />
          </div>
          {isBelowMin && (
            <div className="text-xs text-red-400 flex items-center gap-1">Minimum target is <DhAmt v={TARGET_MIN} /></div>
          )}
          {isAboveMax && (
            <div className="text-xs text-red-400 flex items-center gap-1">Maximum target is <DhAmt v={TARGET_MAX} /></div>
          )}
          {!hasError && amount === 0 && (
            <div className="text-xs text-gray-400 flex items-center gap-1">Between <DhAmt v={TARGET_MIN} /> and <DhAmt v={TARGET_MAX} /></div>
          )}
        </div>

        {/* Quick suggestions */}
        <div className="grid grid-cols-5 gap-2">
          {[1000, 2500, 5000, 10000, 25000].map((v) => (
            <button
              key={v}
              onClick={() => setRaw(String(v))}
              className="rounded-full py-1.5 text-xs font-semibold"
              style={{
                background: amount === v ? POT_DIM : "rgba(17,24,39,0.06)",
                color: amount === v ? POT : "rgba(17,24,39,0.55)",
                border: amount === v ? `1px solid ${POT}44` : "1px solid transparent",
              }}
            >
              {v.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Target date (optional) */}
        <div className="rounded-[20px] bg-white border border-gray-100 px-4 py-3.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Target date</div>
            <div className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">optional</div>
          </div>
          <input
            type="date"
            min={todayStr}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-900 outline-none w-full"
            style={{ colorScheme: "light" }}
          />
          {dateIsPast && (
            <div className="text-xs text-red-400">Date must be in the future</div>
          )}
          {dateLabel && (
            <div className="text-xs text-gray-400">{dateLabel}</div>
          )}
        </div>

        <button
          onClick={() => isValid && !dateIsPast && onNext(amount, targetDate || undefined)}
          disabled={!isValid || dateIsPast}
          className="rounded-full py-4 text-sm font-semibold transition"
          style={{ background: isValid ? POT : "rgba(17,24,39,0.08)", color: isValid ? "#fff" : "rgba(17,24,39,0.3)" }}
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
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full" style={{ background: POT }} />
          ))}
        </div>
        <div className="text-xs text-gray-400">Step 3 of 3</div>

        {/* Pot preview */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">{potName}</span>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-gray-500">goal <DhAmt v={targetAmount} /></span>
        </div>

        <div>
          <div className="text-xl font-semibold mb-1 text-gray-900">Add a starting amount</div>
          <div className="text-sm text-gray-500">Move money from your wallet into this pot.</div>
        </div>

        {/* Available balance */}
        <div className="rounded-[18px] border border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">Available to move</div>
          <div className="text-sm font-semibold text-gray-900"><DhAmt v={spendable} /></div>
        </div>

        {/* Amount input */}
        <div
          className="rounded-[24px] bg-white border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: isOverLimit ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="text-xs text-gray-500 mb-1">Deposit amount</div>
          <div className="flex items-center gap-2">
            <DirhemSign className="h-8 w-auto text-gray-400 shrink-0" />
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-gray-900 outline-none w-[160px] text-center"
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
            style={{ background: isValid ? POT : "rgba(17,24,39,0.08)", color: isValid ? "#fff" : "rgba(17,24,39,0.3)" }}
          >
            Create pot
          </button>
          <button
            onClick={() => onCreate(0)}
            className="rounded-full py-3 text-sm text-gray-400 font-medium"
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
    <div className={phone} style={{ background: "#f5f5f5" }}>
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
          <div className="text-2xl font-bold mb-2 text-gray-900">Pot created!</div>
          <div className="text-lg font-semibold mb-3 text-gray-900">{potName}</div>
          {depositAmount > 0 ? (
            <div className="text-sm text-gray-500">
              <span style={{ color: POT }} className="font-semibold"><DhAmt v={depositAmount} /></span> moved to your pot
            </div>
          ) : (
            <div className="text-sm text-gray-500">Your pot is ready. Add money whenever you like.</div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="rounded-full px-8 py-4 text-sm font-semibold text-white"
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
  const pct = pctOf(pot.currentAmount, pot.targetAmount); // capped at 100 — for progress bar only
  const rawPct = pot.targetAmount > 0 ? (pot.currentAmount / pot.targetAmount) * 100 : 0;
  const remaining = Math.max(0, pot.targetAmount - pot.currentAmount);
  const goalReached = pot.currentAmount >= pot.targetAmount;

  return (
    <PageShell
      onBack={onBack}
      subtitle="POTS"
      badge="POTS"
      navCurrent="money"
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
        {/* Hero card */}
        <div
          className="rounded-[28px] p-6 text-center"
          style={{ background: HERO_GRADIENT }}
        >
          <div className="text-xl font-semibold mb-4 text-white">{pot.name}</div>
          <div className="text-xs text-white/60 mb-1">Saved</div>
          <div className="text-4xl font-semibold tracking-tight mb-4 text-white"><DhAmt v={pot.currentAmount} /></div>

          <ProgressBar pct={pct} color="rgba(255,255,255,0.85)" />
          <div className="flex justify-between text-xs text-white/50 mt-1.5">
            <span>{rawPct.toFixed(0)}% saved</span>
            <span>Goal: <DhAmt v={pot.targetAmount} /></span>
          </div>

          {goalReached ? (
            <div className="mt-3 rounded-full px-3 py-1 text-xs font-semibold inline-block bg-white/20 text-white">
              Goal reached!
            </div>
          ) : (
            <div className="mt-3 text-sm text-white/60"><DhAmt v={remaining} /> to go</div>
          )}
        </div>

        {/* Stats */}
        <div className="rounded-[20px] bg-white border border-gray-100 divide-y divide-gray-100">
          {[
            { label: "Saved so far", value: <DhAmt v={pot.currentAmount} /> },
            { label: "Goal", value: <DhAmt v={pot.targetAmount} /> },
            { label: "Remaining", value: <DhAmt v={remaining} /> },
            { label: "Progress", value: `${rawPct.toFixed(1)}%` },
            {
              label: "Target date",
              value: pot.targetDate
                ? new Date(pot.targetDate).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })
                : <span className="text-gray-400 italic">Indefinite</span>,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onAddMoney}
            className="rounded-full py-4 text-sm font-semibold text-white"
            style={{ background: POT }}
          >
            Add money
          </button>
          <button
            onClick={onWithdraw}
            disabled={pot.currentAmount <= 0}
            className="rounded-full py-4 text-sm font-semibold border"
            style={{
              borderColor: pot.currentAmount > 0 ? `${POT}55` : "rgba(17,24,39,0.1)",
              color: pot.currentAmount > 0 ? POT : "rgba(17,24,39,0.3)",
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Transfer between pots */}
        {otherPotsExist && (
          <button
            onClick={onTransfer}
            className="rounded-full py-4 text-sm font-semibold border w-full"
            style={{
              borderColor: "rgba(17,24,39,0.15)",
              color: "rgba(17,24,39,0.7)",
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
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold text-gray-900">{pot.name}</div>
        <div className="text-xl font-semibold text-gray-900">Add money to pot</div>

        <div
          className="rounded-[24px] bg-white border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: isOverMonthlyLimit ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="text-xs text-gray-500 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <DirhemSign className="h-8 w-auto text-gray-400 shrink-0" />
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-gray-900 outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setRaw(e.target.value); }}
              autoFocus
            />
          </div>
          {isOverMonthlyLimit && (
            <div className="text-xs text-red-400 mt-1">
              Monthly limit reached — you can deposit up to <DhAmt v={Math.max(0, monthlyRemaining)} /> this month
            </div>
          )}
        </div>

        {/* Goal nudge */}
        {!goalReached ? (
          <button
            onClick={() => setRaw(String(remaining))}
            className="rounded-[18px] border px-4 py-3.5 flex items-center justify-between text-left transition hover:brightness-98 bg-white"
            style={{ borderColor: amount === remaining ? `${POT}44` : "rgba(17,24,39,0.1)", background: amount === remaining ? POT_DIM : "#ffffff" }}
          >
            <div>
              <div className="text-xs text-gray-500">To reach your goal</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: amount === remaining ? POT : "#111827" }}>
                <DhAmt v={remaining} /> needed
              </div>
            </div>
            <div className="text-xs rounded-full px-3 py-1 font-semibold" style={{ background: POT_DIM, color: POT }}>
              Add full amount
            </div>
          </button>
        ) : (
          <div className="rounded-[18px] border border-gray-100 bg-white px-4 py-3.5 flex items-center gap-3">
            <Check className="h-4 w-4 shrink-0" style={{ color: POT }} />
            <div className="text-sm text-gray-500">You've already hit your goal — any extra goes beyond it.</div>
          </div>
        )}

        <button
          onClick={() => canContinue && onNext(amount)}
          disabled={!canContinue}
          className="rounded-full py-4 text-sm font-semibold"
          style={{ background: canContinue ? POT : "rgba(17,24,39,0.08)", color: canContinue ? "#fff" : "rgba(17,24,39,0.3)" }}
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

  const methods: { id: PayMethod; label: string; sub: React.ReactNode; icon: React.ReactNode; disabled?: boolean; badge?: string }[] = [
    {
      id: "wallet",
      label: "Botim Wallet",
      sub: walletOk ? <><DhAmt v={spendable} /> balance</> : <>Need <DhAmt v={amount - spendable} /> more</>,
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
    onCard();
  }

  return (
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold text-gray-900">{pot.name}</div>

        <div>
          <div className="text-xl font-semibold mb-1 text-gray-900">How would you like to pay?</div>
          <div className="text-sm text-gray-500"><DhAmt v={amount} /> into your pot</div>
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
                  borderColor: isSelected ? POT : "rgba(17,24,39,0.1)",
                  background: isSelected ? POT_DIM : "#ffffff",
                  opacity: m.disabled ? 0.45 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full p-2.5"
                      style={{ background: isSelected ? `${POT}22` : "rgba(17,24,39,0.06)", color: isSelected ? POT : "rgba(17,24,39,0.6)" }}>
                      {m.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                        {m.label}
                        {m.badge && (
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">{m.badge}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: isSelected ? POT : "rgba(17,24,39,0.2)" }}>
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
          style={{ background: selected ? POT : "rgba(17,24,39,0.08)", color: selected ? "#fff" : "rgba(17,24,39,0.3)" }}
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
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-100 p-3">
            <CreditCard className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">Visa •••• 4782</div>
            <div className="text-sm text-gray-500">Confirm <DhAmt v={amount} /> into {pot.name}</div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white border border-gray-100 p-6">
          <div className="mb-2 text-xs text-gray-500 uppercase tracking-wider">CVV</div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={3}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder="•••"
            className="w-full bg-transparent text-4xl font-semibold tracking-[0.5em] outline-none placeholder-gray-200 text-gray-900"
            autoFocus
          />
          <div className="mt-3 text-xs text-gray-400">3-digit code on the back of your card</div>
        </div>

        {/* Card visual */}
        <div className="flex justify-center">
          <div className="relative w-52 h-32 rounded-[20px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 p-4 flex flex-col justify-between">
            <div className="text-xs text-white/40 font-mono">VISA •••• 4782</div>
            <div className="self-end flex flex-col items-end">
              <div className="text-[10px] text-white/35 mb-0.5">CVV</div>
              <div className="rounded-md border px-3 py-1 text-xs font-mono"
                style={{ borderColor: valid ? POT : "rgba(255,255,255,0.2)", color: valid ? "#93c5fd" : "rgba(255,255,255,0.4)" }}>
                {cvv.length > 0 ? "•".repeat(cvv.length) : "•••"}
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={!valid || loading}
          onClick={handlePay}
          className="rounded-full py-4 text-sm font-semibold transition disabled:opacity-30"
          style={{ background: valid ? POT : "rgba(17,24,39,0.08)", color: valid ? "#fff" : "rgba(17,24,39,0.3)" }}
        >
          {loading ? "Processing…" : <>Pay <DhAmt v={amount} /></>}
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
    <div className={phone} style={{ background: "#f5f5f5" }}>
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
          <div className="text-2xl font-bold mb-1 text-gray-900">Deposit successful!</div>
          <div className="text-sm text-gray-500 mb-6">
            <span style={{ color: POT }} className="font-semibold"><DhAmt v={amount} /></span> added to {pot.name}
          </div>

          <div className="rounded-[24px] bg-white border border-gray-100 divide-y divide-gray-100 text-left mb-6">
            {[
              { label: "Pot",             value: pot.name },
              { label: "Amount",          value: <DhAmt v={amount} /> },
              { label: "Paid via",        value: methodLabel },
              { label: "New pot balance", value: <DhAmt v={pot.currentAmount} /> },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-5 py-3.5">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="w-full rounded-full py-4 text-sm font-semibold text-white"
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
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div className="font-semibold text-gray-900">{pot.name}</div>
        <div className="text-xl font-semibold text-gray-900">Withdraw from pot</div>

        <div className="rounded-[18px] border border-gray-100 bg-white px-4 py-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">Available in pot</div>
          <div className="text-sm font-semibold text-gray-900"><DhAmt v={pot.currentAmount} /></div>
        </div>

        <div
          className="rounded-[24px] bg-white border px-5 py-6 flex flex-col items-center gap-2"
          style={{ borderColor: isOver ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="text-xs text-gray-500 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <DirhemSign className="h-8 w-auto text-gray-400 shrink-0" />
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-gray-900 outline-none w-[160px] text-center"
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
                style={{ background: amount === v ? POT_DIM : "rgba(17,24,39,0.06)", color: amount === v ? POT : "rgba(17,24,39,0.55)", border: amount === v ? `1px solid ${POT}44` : "1px solid transparent" }}>
                {pct}%
              </button>
            );
          })}
        </div>

        <div className="rounded-[16px] border border-gray-100 bg-white p-3 flex gap-2 items-start">
          <Target className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
          <div className="text-xs text-gray-500">Withdrawn funds go back to your spendable wallet balance.</div>
        </div>

        <button
          onClick={() => isValid && onConfirm(amount)}
          disabled={!isValid}
          className="rounded-full py-4 text-sm font-semibold border"
          style={{
            borderColor: isValid ? `${POT}55` : "rgba(17,24,39,0.1)",
            color: isValid ? POT : "rgba(17,24,39,0.3)",
          }}
        >
          Withdraw {amount > 0 && isValid ? <DhAmt v={amount} /> : null}
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
    <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-8">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <Trash2 className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <div className="text-xl font-semibold mb-2 text-gray-900">Delete {pot.name}?</div>
            <div className="text-sm text-gray-500 max-w-[260px] mx-auto">
              {pot.currentAmount > 0
                ? <><span className="text-gray-900 font-semibold"><DhAmt v={pot.currentAmount} /></span> will be returned to your spendable wallet balance.</>
                : "This pot is empty and will be permanently deleted."}
            </div>
          </div>
        </div>

        {pot.currentAmount > 0 && (
          <div className="rounded-[18px] border border-red-500/20 bg-red-500/8 p-4 flex gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-500">Your progress toward this goal will be lost. You can always create a new pot.</div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={onDelete}
            className="rounded-full py-4 text-sm font-semibold text-white bg-red-500"
          >
            Yes, delete pot
          </button>
          <button
            onClick={onBack}
            className="rounded-full py-4 text-sm font-semibold text-gray-400"
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
  const hasError = isOverSource;
  const canConfirm = amount > 0 && sourcePot !== null && !hasError;

  // Phase 1 — pick source pot
  if (!sourceId) {
    return (
      <PageShell onBack={onBack} subtitle="POTS" badge="POTS" navCurrent="money">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
          <div>
            <div className="text-xl font-semibold mb-1 text-gray-900">Transfer to {destPot.name}</div>
            <div className="text-sm text-gray-500">Choose which pot to move money from.</div>
          </div>
          {eligible.length === 0 ? (
            <div className="rounded-[20px] border border-gray-100 bg-white px-5 py-8 flex flex-col items-center text-center gap-3">
              <div className="text-2xl">🪣</div>
              <div className="text-sm font-semibold text-gray-900">No pots available to transfer from</div>
              <div className="text-xs text-gray-400 max-w-[220px]">Your other pots have no balance. Add money to a pot first before transferring.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {eligible.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSourceId(p.id)}
                  className="rounded-[18px] border border-gray-100 bg-white px-4 py-3.5 flex items-center justify-between text-left transition hover:shadow-sm"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5"><DhAmt v={p.currentAmount} /> available</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
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
    <PageShell onBack={() => { setSourceId(null); setRaw(""); }} subtitle="POTS" badge="POTS" navCurrent="money">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pt-2">
        <div>
          <div className="text-xl font-semibold mb-1 text-gray-900">How much to transfer?</div>
          <div className="text-sm text-gray-500">From {sourcePot!.name} → {destPot.name}</div>
        </div>

        {/* Source / dest balance info */}
        <div className="flex flex-col gap-2">
          <div className="rounded-[18px] border border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">Available in {sourcePot!.name}</div>
            <div className="text-sm font-semibold text-gray-900"><DhAmt v={sourceMax} /></div>
          </div>
          <div className="rounded-[18px] border border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">Remaining goal in {destPot.name}</div>
            <div className="text-sm font-semibold text-gray-900"><DhAmt v={destRemaining} /></div>
          </div>
        </div>

        {/* Amount input */}
        <div
          className="rounded-[24px] bg-white border px-5 py-6 flex flex-col items-center gap-2 transition"
          style={{ borderColor: hasError ? "rgba(239,68,68,0.4)" : "rgba(17,24,39,0.1)" }}
        >
          <div className="text-xs text-gray-500 mb-1">Amount</div>
          <div className="flex items-center gap-2">
            <DirhemSign className="h-8 w-auto text-gray-400 shrink-0" />
            <input
              type="number"
              inputMode="decimal"
              className="bg-transparent text-4xl font-semibold text-gray-900 outline-none w-[160px] text-center"
              placeholder="0"
              value={raw}
              onChange={(e) => { if (/^\d*\.?\d{0,2}$/.test(e.target.value)) setRaw(e.target.value); }}
              autoFocus
            />
          </div>
          {isOverSource && (
            <div className="text-xs text-red-400 mt-1">Exceeds available balance in {sourcePot!.name}</div>
          )}
        </div>

        <button
          onClick={() => canConfirm && onConfirm(amount, sourceId)}
          disabled={!canConfirm}
          className="rounded-full py-4 text-sm font-semibold transition"
          style={{ background: canConfirm ? POT : "rgba(17,24,39,0.08)", color: canConfirm ? "#fff" : "rgba(17,24,39,0.3)" }}
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
    <div className={phone} style={{ background: "#f5f5f5" }}>
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
          <div className="text-2xl font-bold mb-1 text-gray-900">Transfer done!</div>
          <div className="text-sm text-gray-500 mb-6">
            <span style={{ color: POT }} className="font-semibold"><DhAmt v={amount} /></span> moved from {sourcePot.name} to {destPot.name}
          </div>

          <div className="rounded-[24px] bg-white border border-gray-100 divide-y divide-gray-100 text-left">
            {[
              { label: "From",   value: sourcePot.name },
              { label: "To",     value: destPot.name },
              { label: "Amount", value: <DhAmt v={amount} /> },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between px-5 py-3.5">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          onClick={onDone}
          className="rounded-full px-8 py-4 text-sm font-semibold text-white w-full"
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
  const [draftTargetDate, setDraftTargetDate] = useState<string | undefined>(undefined);
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

  function navigate(s: string) {
    if (s === "money") return setScreen("money-hub");
    if (s === "all") return setScreen("all-services");
    setScreen(s);
  }

  function handleCreateStep1(name: string) {
    setDraftName(name);
    setScreen("create-pot-2");
  }

  function handleCreateStep2(target: number, targetDate?: string) {
    setDraftTarget(target);
    setDraftTargetDate(targetDate);
    setScreen("create-pot-3");
  }

  function handleCreateStep3(deposit: number) {
    const newPot: Pot = {
      id: crypto.randomUUID(),
      name: draftName,
      targetAmount: draftTarget,
      currentAmount: deposit,
      createdAt: new Date().toISOString(),
      ...(draftTargetDate ? { targetDate: draftTargetDate } : {}),
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
      {screen === "all-services" && (
        <AllServices key="all-services" onNavigate={navigate} />
      )}
      {screen === "pots-hub" && pots.length === 0 && (
        <PotsOnboarding key="pots-onboarding" onBack={() => setScreen("all-services")} onStart={() => setScreen("create-pot-1")} />
      )}
      {screen === "pots-hub" && pots.length > 0 && (
        <PotsHub key="pots-hub" pots={pots} walletTotal={walletTotal} spendable={spendable} onNavigate={navigate} onSelectPot={(id) => { setSelectedPotId(id); setScreen("pot-detail"); }} onWithdrawPot={(id) => { setSelectedPotId(id); setScreen("pot-withdraw"); }} onNewPot={() => setScreen("create-pot-1")} />
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
