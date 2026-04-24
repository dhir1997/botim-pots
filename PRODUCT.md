# Botim Pots

*Concept note for design alignment*

| | |
|---|---|
| **Author** | Akshat Dhir |
| **For** | Yitong Gao (Design) |
| **Status** | Concept — prototype recorded, ready to align before detailed design |
| **Attached** | Prototype walkthrough (Screen_Recording_2026-04-20.mp4) |

---

## In one line

> Pots let users ring-fence money inside the Botim wallet for specific goals — without opening a separate account or moving money out of the app.

---

## What we're trying to achieve

A user creates a pot, gives it a name and an emoji (for example, 🕌 **Hajj Fund**, 💻 **MacBook**, 🎓 **Tuition**), and sets a target amount. They then move money into it — either from their existing wallet balance, from an external card, or from another pot. The pot shows progress toward the goal with a visual bar, and the wallet surface always makes it clear how much is genuinely spendable versus how much is earmarked.

The core mechanic: **a pot is always part of the wallet total.** Funding a pot is funding the wallet — the user is just telling you in the same breath that this particular portion is ring-fenced on arrival. Allocating from existing spendable doesn't change the total, only shrinks spendable. Topping up from a card grows the total, with the new money landing straight in the pot. Either way, spendable only changes when the user actively decides to use (or release) money — never as a side-effect of saving.

---

## Why we think this works

Most digital wallets show a single balance number. Users saving toward multiple goals at once have no native tool for this — they track it mentally, in a notes app, or by juggling accounts. None of those work well, and all of them leak.

The behavioural foundation is **mental accounting**. People naturally think about money in buckets — rent money, holiday money, money I don't touch — but the apps holding that money don't reflect the buckets. Pots make them explicit. Once a user can see "AED 3,000 is for Hajj," they're measurably less likely to spend against it accidentally.

There's a secondary engagement effect. A user with pots set up has a reason to come back regularly — to top up, to watch the bar move, to feel the small reward of getting closer to a goal. This is stickiness without requiring us to launch a fundamentally new financial product.

---

## Who it's for

**Primary:** a Botim Money wallet holder who has regular income flowing through the app and wants to be more intentional about where it sits. They're saving toward one or more near-to-medium-term goals — a device, a trip, a religious obligation like Hajj, a family milestone — but they're not the type to set up a formal savings plan or fixed deposit. They want flexibility and low friction. A meaningful share of these users are remittance-first, and pots give them a reason to keep balance in the app between transfers instead of zeroing out each month.

**Secondary:** users new to budgeting who benefit from visual structure. A progress bar moving toward a target is more motivating than a balance number fluctuating. For this group, pots are a first budgeting tool as much as a savings tool.

**Not the target:** our high-value investing users. Pots don't generate yield, don't compete with Earn, and shouldn't try to. If someone is already thinking in terms of return, pots aren't the product — they're the wrapper around the money that isn't ready for that conversation yet.

---

## The mental model we need to protect

Everything in design should reinforce three ideas at once:

- **The money is still in the wallet.** We are not moving it to a savings account. We are not investing it. We are not locking it up. It is sitting in the same place it was, labelled differently.
- **The wallet has two faces.** There is a total (what you have) and a spendable (what you can freely use right now). Pots are the difference between them.
- **Ring-fencing is reversible but not accidental.** Moving money into a pot should feel like a small, deliberate act. Taking it back out should be possible, but should cost a tap or two more than spending normally — enough to interrupt an impulse.

If a user ever finishes a session thinking "my money got moved somewhere," we've failed the first idea. If they think "I can't tell what I can actually spend," we've failed the second. If they break their own pot to buy a coffee without pausing, we've failed the third.

---

## What's in the prototype

The attached recording walks through the primary flows end-to-end. A short narration of what's in it, in the order it appears:

### Empty state

Dedicated Pots screen inside Money. Amphora illustration, one sentence of explanation, single CTA: "Create your first pot." No secondary noise.

### Create-a-pot flow (3 steps)

**Step 1 — Name.** Single input, 32-character limit, emoji picker in the top-right. Name is the user's words; emoji is how they'll spot it in a list.

**Step 2 — Target amount.** AED input with quick-pick chips (500 / 1,000 / 2,500 / 5,000 / 10,000). Chips bias toward the distribution we expect; custom amounts remain available for the long tail.

**Step 3 — Starting deposit (optional).** Shows funding options — allocate from wallet balance or top up from card — with a primary "Create pot" CTA and a "Skip for now" link. The pot can exist with zero in it; funding is a separate decision the user can return to at any time.

### Pot detail view

Progress card at the top (saved / goal / progress bar / "AED X to go"), a summary table below, and four actions: **Add money**, **Withdraw**, **Transfer from another pot**, and **Delete pot**. Withdraw is disabled when the saved amount is zero.

### Funding a pot

Two paths, presented together at the decision point: allocate from wallet balance (instant, no cost) or top up from an external card (Visa flow, CVV confirmation, standard payment sheet). The sheet should default intelligently — wallet-first when spendable covers the amount, card-first when it doesn't — with an easy toggle either way. The "To reach your goal" helper and "Add full amount" shortcut nudge users toward completion without forcing it.

### Pot-to-pot transfer

A first-class action. The sheet shows both constraints simultaneously — "Available in [source]" as the upper cap and "Remaining goal in [destination]" as the suggested cap — so the user can't overshoot either side without noticing. Ends in a confirmation screen summarising from / to / amount.

### Money home screen

The most important frame in the whole prototype. The wallet card shows **total** with a supporting line ("Includes AED 15,500 allocated to pots"), and splits beneath into two chips: **Spendable** and **In pots**. The "In pots" chip is the hook back into the pots surface. Transactions, QR, Send, and Add funds sit below unchanged.

---

## Edge cases and open questions

These aren't blockers to start designing, but they're the places where small decisions will shape the product's character. Flagging now so we can discuss in the first session rather than discover in review.

### When spendable goes negative

If a user allocates to a pot and then a direct debit, subscription, or card payment hits the wallet, spendable could drop below zero while the pot still holds the full amount. Do we: (a) fail the outgoing payment, (b) auto-release from the most recently funded pot, or (c) let spendable go negative and surface a warning? Option (a) is safest but frustrating. Option (b) preserves flow but breaks the "not accidental" principle. Worth a conversation with payments.

### Target-reached state

The prototype doesn't show what happens when a pot hits 100%. The moment is a reward — we should design it. Options range from a small celebration and a nudge ("Move to wallet?" or "Start a new pot?") through to something more considered for goal-type pots like Hajj where the user may actually spend the money next.

### Withdraw vs. delete

Both return money to spendable. Today the affordances are similar. We should make the difference obvious: Withdraw reduces a pot, Delete ends it. A pot with a balance being deleted needs a confirmation that names what happens to the money.

### "Skip for now" on step 3

With card funding available, the old reason to skip ("I don't have spendable to move right now") mostly evaporates. The copy should acknowledge that funding can happen any time from any source, so skipping doesn't feel like a dead-end.

### Amount formatting

The target-amount input in the prototype renders large numbers without separators ("100000"). For AED amounts that will commonly run into five and six figures, thousands separators at rest and during entry will reduce error. Minor, but worth catching early.

### How many pots is too many

We haven't set a cap. The list view handles two pots comfortably; eight would start to feel like clutter. Not urgent, but the list and the "My Pots" home-screen module need a plan for what scrolling and summarisation look like past four or five.

---

## Deliberately not in V1

Flagging these so we don't accidentally design for them:

- Yield or interest on pot balances. Pots sit in the wallet at wallet rates (which is to say, none). If we add yield, it's a different product and a different conversation with compliance.
- Recurring auto-fund from salary or scheduled transfers. Valuable, but adds payment and scheduling complexity we don't need to prove the concept.
- Shared or group pots. Conceptually interesting (family Hajj pot, shared gift) but a step-change in permissioning.
- Locked or time-bound pots. The soft psychological fence is the MVP. Hard locks change the compliance posture.

---

## What we'd like from this first design pass

In rough order of value to the concept:

- **The Money home treatment.** The total / spendable / in-pots split is the idea. If that card is clear, the rest of the product works. If it's not, nothing else saves it.
- **The pot detail view.** Progress card, hierarchy between the four actions, and the resting state of an empty pot versus a nearly-full one.
- **The funding sheet.** How wallet-vs-card presents, how the default is chosen, how a user toggles. This is where the unified-funding promise lives or dies.
- **The create flow.** Three steps feels right; we can discuss whether the emoji belongs on step 1 with the name or as its own light step.
- **The allocation moment.** When a user commits money to a pot, how do we make that feel like a small, satisfying act of intent rather than a form submission?

---

**Next step:** review the prototype, react to this note, then a working session to walk through the Money home screen and pot detail together. I'd rather get those two right and come back for the flows than try to cover everything in one pass.