# FairSeat · The ticket that knows the rules

An interactive product concept for **Blockchains & Crypto Assets** (Goizueta Business School, Emory · Fall 2026).
FairSeat is a ticketing platform where every ticket is a unique digital token with its resale rules built in:
resale capped at **110%**, **5%** to the artist on every resale, **4** tickets per person, resale closes **2 h** before the show,
and only verified fans can buy.

> Academic concept. Not a real product. Business figures are illustrative hypotheses. Artists, tours and venues are real; listings are illustrative (see below).

**Live:** https://diegooaalm-bot.github.io/fairseat-demo/ · **Demo:** https://diegooaalm-bot.github.io/fairseat-demo/#/demo · **Projector QR:** https://diegooaalm-bot.github.io/fairseat-demo/#/share

<img src="docs/qr-demo.png" alt="QR code to the live demo" width="180">

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
and remembers its state. Tap the avatar (top right) to switch roles, start **Story mode** or **Reset demo**. Maya is already a verified fan, so the demo starts straight in the catalog.

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
| 0:18 | → (The fair queue) — the bot attack plays by itself | *“Presale for Bad Bunny at Mercedes-Benz Stadium. Maya verified once when she signed up. Bots hit the identity shield; only verified humans get through.”* |
| 0:30 | → (Pick a seat and pay): Section 312 is open; tap Row 14 seat 7, then four more | *“$100, all-in. Four tickets per person: try a fifth and the rule pushes back.”* Deselect, tap **$100.00**, double-tap **Double-click to pay**. |
| 0:42 | → (Maya can’t go): drag the slider hard to the right | *“She can’t go, so she resells. It hits a wall at $110. This ticket knows the rules. $104.50 for her, $5.50 for the artist.”* |
| 0:55 | → (Ben buys): **Buy for $113.30**, double-tap to pay | *“Ben finds it at $110, not $400. One all-or-nothing transaction: the ticket and the money move at the same time.”* |
| 1:08 | → (At the door): click **Scan** (desktop) or **Scan Ben’s phone** | *“His code changes every five seconds. Welcome, Ben.”* Tap **Screenshot** → *“A screenshot fails.”* |
| 1:18 | → (I was there) | *“After the show he gets a badge nobody can buy. More shows, earlier presales.”* |
| 1:24 | → → (Artist, Proof) | *“The artist earns 5% of every resale, instantly. And anyone can check every rule. Nobody, not even us, can break them.”* |
| 1:30 | → (Back to Maya) | *“Next time, Maya gets in for $110, not $400. FairSeat: the ticket that knows the rules.”* |

Outside Story mode you can browse like a real ticketing app: every concert in **Discover** opens its page, with price levels,
the venue seat map (Mercedes-Benz Stadium or State Farm Arena) and checkout. Taylor Swift shows the verified waitlist for a tour that hasn’t been announced.

If anything goes wrong on stage: **Reset demo**, then Story mode and jump with → to the chapter you need. Every step rebuilds its own state.

## Real artists, illustrative listings

The catalog uses real artists, tours and Atlanta venues so the demo feels real:

| Artist | Tour | Venue | Date in the demo |
|---|---|---|---|
| Bad Bunny | DeBÍ TiRAR MáS FOToS World Tour | Mercedes-Benz Stadium | Sat, Jun 26, 2027 · **illustrative** (the tour has no announced U.S. dates) |
| Harry Styles | Together, Together | Mercedes-Benz Stadium | Fri, May 21, 2027 (announced) |
| Zach Bryan | Young Manhood and Other Donatable Organs Tour | Mercedes-Benz Stadium | Sat, May 29, 2027 (announced) |
| Stray Kids | RUN IT World Tour | Mercedes-Benz Stadium | Tue, Jun 8, 2027 (announced) |
| Andrea Bocelli | Romanza 30th Anniversary World Tour | State Farm Arena | Tue, Feb 2, 2027 (announced) |
| Taylor Swift | The Life of a Showgirl | — | No tour announced: shown as a verified waitlist |

Prices, seats, sales figures and royalties are illustrative. Seating maps are simplified drawings of each venue’s general layout.
FairSeat is an academic concept: it is not affiliated with, endorsed by or selling tickets for any artist, tour or venue, and no real payments happen.

### Photo credits

All photos come from Wikimedia Commons under free licenses, cropped and resized (`public/photos/`, details in `src/data/photo-credits.json`):

- Bad Bunny — “Bad Bunny Performs” by Comecoquito, CC0
- Taylor Swift — “Taylor Swift Eras Tour London 20240819 1989era” by BrigidLIS, CC BY 4.0
- Harry Styles — “Harry Styles - Love On Tour @ Jeunesse Arena” by Leticia Moraes, CC BY-SA 2.0
- Stray Kids — “Stray Kids at the Music Core Mini Fan Meeting, November 11, 2023” by 티비텐, CC BY 3.0
- Zach Bryan — “Zach Bryan Encore (With Heaven on Top Tour, 2026)” by Laiki McKenzie, CC BY-SA 4.0
- Andrea Bocelli — “Concierto Andrea Bocelli” by InfoGibraltar, CC BY 2.0
- Mercedes-Benz Stadium — “Mercedes-Benz Stadium Interior in 2024” by BullDawg2021, CC BY 4.0

## What’s inside

- Vite + React 19 + TypeScript + Tailwind CSS 4 + Motion. Zustand for the shared, persisted demo state. `qrcode` (core encoder) for real QR codes. Lucide icons.
- 100% static and deterministic: a seeded PRNG, a fixed demo clock (presale day, show night, after the show) and no network calls.
- PWA via `vite-plugin-pwa` (precached, offline after first load). HashRouter, so it works on GitHub Pages without server config.
- `src/lib/rules.ts` is the rules engine: cap, royalty, fee and the four resale checks. $110 → $104.50 / $5.50 / $3.30 / $113.30.
- `src/store/demo.ts` is the single ledger every role reads from, the same idea as the blockchain itself.
- `src/demo/presenter/story.ts` defines the 7 chapters (11 steps) of Story mode.

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
