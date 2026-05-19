# Botim Pots — Product Specification

## What is it?

Pots are named, goal-based savings compartments inside the Botim wallet. A user creates a pot for a specific goal (holiday, phone, emergency fund), moves money into it, and watches a progress bar fill toward their target. The money never leaves the Botim ecosystem — it is simply earmarked and hidden from the spendable wallet balance.

## Core money model

| Concept | Definition |
|---|---|
| **Wallet total** | The user's actual Botim balance, including all pot allocations |
| **Spendable** | `walletTotal − sum of all pot balances` — what's shown on the Pay screen |
| **Pot balance** | Money earmarked for one goal |
| **Wallet deposit to pot** | Pot balance ↑, wallet total unchanged → spendable ↓ |
| **Card deposit to pot** | Pot balance ↑, wallet total ↑ (external funds arrive) → spendable unchanged |
| **Withdraw from pot** | Pot balance ↓, wallet total unchanged → spendable ↑ |
| **Delete pot** | Pot removed, wallet total unchanged → full balance returns to spendable |

Pots are motivational, not restrictive. There are no lock-ins, maturity dates, or penalties. A user can withdraw at any time.

---

## Entry point

Pots are accessed via **All Services** (bottom nav → All → Save & Grow → My Pots). They do not appear in the Pay tab wallet card.

---

## Screens

### All Services (`all-services`)
Grid of service categories. "My Pots" is a tile in the "Save & Grow" section. Other tiles are placeholders (dimmed).

### Pots Onboarding (`pots-hub` when 0 pots)
Shown the first time a user reaches Pots (before any pot exists).

- **Hero**: Three stacked decorative pot cards showing example goals with partially filled progress bars (Home Trip ✈️, New Phone 📱, Emergency 🛡️)
- **Headline**: "Your money, sorted by what matters"
- **Value pills**: 🎯 Goal-based · ⚡ Instant access · 🔒 No lock-ins
- **CTA**: "Create my first pot"
- **"How do pots work? →"**: Ghost link that expands four FAQ cards inline

### Pots Hub (`pots-hub` when ≥1 pot)
Two-part layout:

**Summary banner (top)** — passive, read-only
Light background (`#F0F4FF`), 1px border, no shadow. Shows:
- Total saved across all pots (Dirham symbol, blue)
- `of X goal · Y% there`
- Slim 6px progress bar (blue fill on light track)
- Pot count pill: `N / 10`

**Pot card list (below)** — interactive, elevated
Each pot renders as a gradient card with a blue drop shadow. Two visual states, identical card dimensions:

**In-Progress card**
- Top: pot name | `···` menu icon
- Amounts: Saved (28px bold, dominant) + Goal (22px, 70% opacity)
- 10px progress bar — white fill at 90% opacity on white track at 20% opacity
- Below bar: `X% saved` (left) · `Y to go` (right, bold)

**Goal Reached card**
- Top: pot name | `🎉 Goal!` pill
- Amounts: Saved (28px bold) + Goal (22px, 70% opacity)
- 10px progress bar — fully filled
- Below bar: `Withdraw` text link (left) · `New pot →` text link (right)
  - Withdraw → goes directly to withdraw flow for that pot
  - New pot → goes directly to pot creation step 1

### Create Pot — Step 1 (`create-pot-1`)
- 30-emoji picker grid (single select)
- Pot name text input

### Create Pot — Step 2 (`create-pot-2`)
- Target amount input (left-aligned, Dirham symbol, 2 decimal places, no spinner)
- Quick suggestion chips (full-width 5-column grid): 1,000 · 2,500 · 5,000 · 10,000 · 25,000
- Validation: min AED 100, max AED 100,000
- Optional target date picker
  - Shows `X days / months away` sub-label when a valid future date is selected
  - Validation: date must not be in the past (ISO string comparison, timezone-safe)

### Create Pot — Step 3 (`create-pot-3`)
- Optional initial deposit from wallet
- Shows available spendable balance
- Skip button bypasses deposit

### Create Pot — Success (`create-pot-success`)
- Confirms pot name and deposit amount
- "View my pots" → Pots Hub

### Pot Detail (`pot-detail`)
Hero card (gradient) shows:
- Pot name, saved amount, progress bar
- `X% saved` label (uncapped real %) · `Goal: Y`
- `Goal reached!` badge when ≥ 100%
- `X to go` when in progress

Stats table:
- Saved so far, Goal, Remaining, Progress (uncapped — shows e.g. 150.0%), Target date (or "Indefinite")

Actions:
- **Add money** — always enabled, can exceed 100% of goal
- **Withdraw** — enabled when balance > 0
- **Transfer between pots** — enabled when ≥2 pots exist; destination pot has no over-goal cap
- **Delete pot** — opens confirmation

### Add Money (`pot-add`)
- Amount input with goal nudge chip (tappable — fills remaining amount needed to reach goal)
- Validation: amount > 0 and ≤ spendable balance (for wallet deposits)

### Payment Method (`pot-payment-method`)
- Wallet (shows spendable; disabled if insufficient)
- Debit card
- Apple Pay

### CVV (`pot-card-cvv`)
- 3-digit entry for card deposits; simulates processing

### Deposit Success (`pot-deposit-success`)
- Confirms amount and payment method

### Withdraw (`pot-withdraw`)
- Amount input capped at pot balance
- Back → pot detail

### Delete Confirm (`pot-delete`)
- Shows pot name and balance to be returned to spendable

### Transfer Between Pots (`pot-transfer`)
- Source pot selector
- Amount input capped at source pot balance only (no cap on destination)
- Destination = pot currently open in PotDetail

### Transfer Success (`pot-transfer-success`)
- Confirms source, destination, and amount

---

## Rules & limits

| Rule | Value |
|---|---|
| Max pots | 10 |
| Min pot target | AED 100 |
| Max pot target | AED 100,000 |
| Target date | Optional; must be today or future |
| Progress bar display | Capped at 100% visually |
| Progress stat (detail page) | Uncapped real percentage |
| Goal enforcement | None — users can add money beyond their target freely |

---

## Design system

| Token | Value |
|---|---|
| Primary blue | `#1A4FDB` |
| Blue tint (backgrounds) | `rgba(26,79,219,0.1)` |
| Hero gradient | `#0d1b6b → #1e3a9f → #2952cc` (160°) |
| Summary banner bg | `#F0F4FF` |
| Summary banner border | `#DDE3F5` |
| Pot card shadow | `0 4px 16px rgba(26,79,219,0.25)` |
| Page background | `#f5f5f5` |
| Card background | `#ffffff` |
| Font | Geist (Google Fonts) |
| Phone max-width | 420px |
| Card radius | 20–30px |
| Button radius | `rounded-full` |
| Currency symbol | Custom SVG `<DirhemSign>` — no Unicode equivalent exists |

---

## Out of scope for this prototype

- Authentication / onboarding
- Real money movement or backend integration
- Push notifications or scheduled top-ups
- Interest or returns on pot balances
- Pot editing (rename, change target amount)
- Shared / joint pots
- Credit tab (placeholder only)
