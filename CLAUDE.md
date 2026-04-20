# Botim Pots — Prototype

## What this is
A Next.js prototype for **Botim Pots**, a goal-based savings feature inside the Botim Money super-app. Users segment their wallet into named "pots", each aimed at a specific savings goal (e.g. Hajj, MacBook, education). Money moved into a pot is still shown in the total wallet balance but reduces the spendable balance.

## Core concept
- **Wallet total** stays fixed (e.g. AED 3,000) — always visible
- **Spendable** = wallet total − sum of all pot balances
- **Pot balance** = money the user has earmarked for that goal
- Card deposits (via debit/Apple Pay) increase both the pot and wallet total since funds arrive from outside

## Tech stack
- Next.js 15, React 18, TypeScript
- Tailwind CSS 3 for styling
- Framer Motion 11 for animations
- Lucide React for icons
- No backend — all state lives in React (`useState`) inside `PotsPrototype.tsx`

## Project structure
```
botim-pots/
├── app/
│   ├── globals.css        # Base styles (dark theme, font)
│   ├── layout.tsx         # Root layout, metadata
│   └── page.tsx           # Renders <PotsPrototype />
└── components/
    └── pots/
        └── PotsPrototype.tsx   # Entire prototype (single file, ~1500 lines)
```

## Design system
Matches `Botim-Savings` (sibling project). Key tokens:
- **Pot accent colour**: `#c084fc` (purple) — all pot UI uses this
- **Backgrounds**: `#0a0a0a` (page), `#0f1117` (cards)
- **Text**: white at 100% / 55% / 45% / 40% opacity for hierarchy
- **Radius**: `rounded-[28-30px]` for cards, `rounded-full` for buttons/pills
- **Font**: system stack (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`)
- **Animations**: Framer Motion, `initial={{ opacity:0, y:10 }}` → `animate={{ opacity:1, y:0 }}`
- Max phone width: `max-w-[420px]`

## Screens & navigation
All screens are rendered inside a single `<AnimatePresence>` in the root `PotsPrototype` component. Navigation is a `screen` string state.

| Screen key | Component | Description |
|---|---|---|
| `money-hub` | `MoneyHub` | Pay / Credit / Wealth tabs. Entry point. |
| `pots-hub` | `PotsHub` | List of all pots, summary card, + button |
| `create-pot-1` | `CreatePot1` | Step 1 — emoji picker + pot name |
| `create-pot-2` | `CreatePot2` | Step 2 — target amount |
| `create-pot-3` | `CreatePot3` | Step 3 — initial deposit (optional) |
| `create-pot-success` | `CreatePotSuccess` | Success after pot creation |
| `pot-detail` | `PotDetail` | Single pot — balance, progress, actions |
| `pot-add` | `PotAddMoney` | Enter amount to add (shows goal nudge) |
| `pot-payment-method` | `PotPaymentMethod` | Choose Wallet / Debit / Apple Pay |
| `pot-card-cvv` | `PotCardCvv` | CVV entry for debit card |
| `pot-deposit-success` | `PotDepositSuccess` | Confirmation after deposit |
| `pot-withdraw` | `PotWithdraw` | Withdraw from pot back to wallet |
| `pot-delete` | `DeleteConfirm` | Confirm pot deletion |

## Entry points to pots
- **Pay tab** — "My Pots" entry card (between quick actions and recent transactions)
- **Wealth tab** — "My Pots" row in My Holdings (reflects pot total in wealth overview)
- Pay tab wallet card — "In pots" tile (only visible when potsTotal > 0, tappable → PotsHub)

## Key behaviours
- Max **10 pots** — + button dims at limit, warning banner shown in PotsHub
- Pot colours are all the same purple (`#c084fc`) — no per-pot colour differentiation
- Each pot has an **emoji** (picked from a 30-emoji grid) + a **name** + a **target amount**
- Target is motivational only (progress bar) — no locking of funds
- **Add money flow**: amount entry → payment method → (CVV if card) → success
- **Wallet deposit**: reduces spendable, pot balance increases
- **Card deposit**: pot balance increases AND wallet total increases (external funds)
- **Withdraw**: pot balance decreases, spendable increases
- **Delete pot**: returns full pot balance to spendable, pot removed
- Goal nudge on add-money screen: tappable chip shows exact amount needed to reach goal

## Wallet card (Pay tab)
When `potsTotal > 0`, shows two sub-tiles:
- **Spendable** — wallet total minus all pot allocations
- **In pots** — total across all pots (purple tint, tappable → PotsHub)
Both tiles are hidden when no pots exist.

## Reference project
`../Botim-Savings` — sister prototype for fixed/flexible savings plans. Shares the same design language. Use it as reference for component patterns, colour values, and animation style.
