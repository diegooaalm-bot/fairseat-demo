# FairSeat · The ticket that knows the rules

An interactive product concept for **Blockchains & Crypto Assets** (Goizueta Business School, Emory · Fall 2026).
FairSeat is a ticketing platform where every ticket is a unique digital token with its resale rules built in:
resale capped at **110%**, **5%** to the artist on every resale, **4** tickets per person, resale closes **2 h** before the show,
and only verified fans can buy.

> Academic concept. Not a real product. Business figures are illustrative hypotheses. Artists, tours and venues are fictional.

- `/#/` — the product page (scroll story, interactive resale slider, festival calculator, timeline).
- `/#/demo` — the live demo app: 6 roles that share one state (Maya, Ben, Organizer, Artist, Gate, Proof) and Story mode.
- `/#/share` — a full-screen QR to the demo, for the projector.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. On a phone on the same Wi-Fi, use the "Network" URL Vite prints.

Production build (static, works offline once loaded):

```bash
npm run build
```

```bash
npm run preview
```

## Use it on a phone like an app

Open `/#/demo` in Safari → Share → **Add to Home Screen**. It launches full screen, works offline after the first load,
and remembers its state. Tap the avatar (top right) to switch roles, start **Story mode** or **Reset demo**.

## Presenting

- **Desktop / projector:** the phone sits in the middle; the left panel shows what to say; the right panel shows the shared ledger.
  Press **Story mode**, then **→ / ←** (or a presentation clicker) to move, **Esc** to exit.
- **Phone:** in Story mode a bar at the bottom has big ◀ ▶ buttons; tap the title to read your notes.
- **Reset demo** puts everything back to the start (state lives in `localStorage`).
- Dashed **DEMO** buttons are shortcuts (e.g. "Skip to after the show"); they are clearly marked as simulation controls.

## 90-second demo script

Start in Story mode on the projector (or on your phone). Each line: **what to tap** → *what to say*.

| Time | Tap | Say |
|---|---|---|
| 0:00 | Story mode (Chapter 1) | *“Meet Maya. Two hours in a virtual queue, sold out in minutes, and ten minutes later her $100 ticket is on sale for $400. She didn’t lose to other fans. She lost to bots.”* |
| 0:12 | → (Chapter 2) | *“So we asked: what if the ticket itself knew the rules? Meet FairSeat.”* |
| 0:18 | → → (The fair queue) — the bot attack plays by itself | *“Maya verified once, ID and selfie, no crypto. On presale day, bots hit the identity shield. Only verified humans get through.”* |
| 0:30 | → (Choose seats): tap Row F seat 7, then four more seats | *“Four tickets per person. Try a fifth: the rule pushes back.”* Deselect, tap **$100.00**, double-tap **Double-click to pay**. |
| 0:42 | → (Maya can’t go): drag the slider hard to the right | *“She can’t go, so she resells. Watch: it hits a wall at $110. This ticket knows the rules. $104.50 for her, $5.50 for the artist.”* |
| 0:55 | → (Ben buys): **Buy for $113.30**, double-tap to pay | *“Ben finds it at $110, not $400. One all-or-nothing transaction: the ticket and the money move at the same time.”* |
| 1:08 | → (At the door): click **Scan** (desktop) or **Scan Ben’s phone** | *“His code changes every five seconds. Welcome, Ben.”* Tap **Screenshot** → *“A screenshot fails.”* |
| 1:18 | → (I was there) | *“After the show he gets a badge nobody can buy. More shows, earlier presales.”* |
| 1:24 | → → (Artist, Proof) | *“The artist earns 5% of every resale, instantly. And anyone can check every rule. Nobody, not even us, can break them.”* |
| 1:30 | → (Back to Maya) | *“Next time, Maya gets in for $110, not $400. FairSeat: the ticket that knows the rules.”* |

If anything goes wrong on stage: **Reset demo**, then Story mode and jump with → to the chapter you need. Every step rebuilds its own state.

## What’s inside

- Vite + React 19 + TypeScript + Tailwind CSS 4 + Motion. Zustand for the shared, persisted demo state. `qrcode` (core encoder) for real QR codes. Lucide icons.
- 100% static and deterministic: a seeded PRNG, a fixed demo clock (four moments: presale, after the Velvet Hours show, doors, after the show) and no network calls.
- PWA via `vite-plugin-pwa` (precached, offline after first load). HashRouter, so it works on GitHub Pages without server config.
- `src/lib/rules.ts` is the rules engine: cap, royalty, fee and the four resale checks. $110 → $104.50 / $5.50 / $3.30 / $113.30.
- `src/store/demo.ts` is the single ledger every role reads from, the same idea as the blockchain itself.
- `src/demo/presenter/story.ts` defines the 7 chapters (12 steps) of Story mode.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
In the repository: **Settings → Pages → Source: GitHub Actions**. The site is served at `https://<user>.github.io/<repo>/`
and the demo at `https://<user>.github.io/<repo>/#/demo`.

## Rules reference

| Rule | Default |
|---|---|
| Resale cap | 110% of face value |
| Artist royalty | 5% of each resale, paid instantly |
| FairSeat resale fee | 3%, paid by the buyer |
| FairSeat primary fee | $1.50 per ticket, paid by the organizer |
| Per-person limit | 4 tickets |
| Resale window | closes 2 h before the show |
| Gifts | verified fans only, 2 transfers per ticket |

Network: Base (Ethereum L2), ≈ $0.01 per operation, paid by FairSeat (paymaster). Contracts: tickets (ERC-721 + ERC-2981),
market (atomic escrow), badges (ERC-5192, soulbound). On-chain: ticket ID, event, seat, face value, rules, anonymous owner, history.
Off-chain and encrypted: name, ID, selfie, email, card.
