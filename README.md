# Botim Pots — Prototype

A Next.js prototype for the **Botim Pots** feature — goal-based savings inside the Botim Money super-app.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app renders a single phone-frame UI — no routing, no backend.

## Tech stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Font | Geist (via `next/font/google`) |

## Project structure

```
botim-pots/
├── app/
│   ├── globals.css           # Base styles + Tailwind directives
│   ├── layout.tsx            # Root layout — loads Geist font
│   └── page.tsx              # Renders <PotsPrototype />
└── components/
    └── pots/
        └── PotsPrototype.tsx # Entire prototype (~1900 lines, single file)
```

All state lives in `PotsPrototype.tsx` via `useState`. There is no backend, database, or API — this is a click-through prototype only.

## Design tokens (defined at top of PotsPrototype.tsx)

```ts
const POT          = "#1A4FDB";                          // Botim blue — primary accent
const POT_DIM      = "rgba(26,79,219,0.1)";              // pale blue tint for backgrounds/pills
const HERO_GRADIENT = "linear-gradient(160deg, #0d1b6b 0%, #1e3a9f 60%, #2952cc 100%)";
const phone        = "mx-auto w-full max-w-[420px] ..."; // phone frame class
```

## Currency

The UAE Dirham symbol is rendered via a custom `<DirhemSign>` SVG component (no Unicode character exists). All monetary values use `<DhAmt v={number} />` which composes the symbol with a formatted number string.

## Key components

| Component | Screen key | Purpose |
|---|---|---|
| `MoneyHub` | `money-hub` | Pay / Credit / Wealth tabs |
| `AllServices` | `all-services` | Services grid — entry point to Pots |
| `PotsOnboarding` | `pots-hub` (0 pots) | USP / explainer shown before first pot |
| `PotsHub` | `pots-hub` (≥1 pot) | Summary banner + pot card list |
| `CreatePot1–3` | `create-pot-1/2/3` | 3-step pot creation wizard |
| `CreatePotSuccess` | `create-pot-success` | Confirmation screen |
| `PotDetail` | `pot-detail` | Single pot — stats, actions |
| `PotAddMoney` | `pot-add` | Amount entry |
| `PotPaymentMethod` | `pot-payment-method` | Wallet / Debit / Apple Pay |
| `PotCardCvv` | `pot-card-cvv` | CVV for card deposits |
| `PotDepositSuccess` | `pot-deposit-success` | Deposit confirmation |
| `PotWithdraw` | `pot-withdraw` | Withdraw to wallet |
| `DeleteConfirm` | `pot-delete` | Delete confirmation |
| `PotTransfer` | `pot-transfer` | Transfer between pots |
| `PotTransferSuccess` | `pot-transfer-success` | Transfer confirmation |
