# Proof of Seat · One seat. One token. One owner.

An interactive product concept for **Blockchains & Crypto Assets** (Goizueta Business School, Emory · Fall 2026),
built to match the final presentation *Tickets on the Blockchain*. Proof of Seat turns every ticket into a token with its resale
rules written into code: resale capped at **105%** of face value, **2%** to the artist on every resale, **1%** to the platform,
**4** tickets per verified person, resale closes **2 h** before the show, and tokens only move through the official marketplace.

> Academic concept. Not a real product. Business figures are illustrative hypotheses. Artists, teams and venues are real; listings are illustrative (see below).

**Live:** https://diegooaalm-bot.github.io/fairseat-demo/ · **Demo:** https://diegooaalm-bot.github.io/fairseat-demo/#/demo · **Projector QR:** https://diegooaalm-bot.github.io/fairseat-demo/#/share

<img src="docs/qr-demo.png" alt="QR code to the live demo" width="180">

- `/#/` — the product page, in the same order as the slides: hook, the problem, three cases, where the markup goes, the solution,
  why a blockchain, a ticket’s life, the building blocks, the rules (with an interactive slider), business model, risks, pilot plan.
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
| 0:00 | Story mode (Chapter 1) | *“Meet Maya. Two hours in a virtual queue, sold out in minutes, and ten minutes later her $100 ticket is on sale for $400. She lost to bots, and the artist gets $0 of the markup.”* |
| 0:10 | → (Chapter 2) | *“Meet Proof of Seat. One seat, one token, one owner. Resale capped at 105%, 2% to the artist, 4 tickets per verified fan.”* |
| 0:18 | → (The fair queue) — the bot attack plays by itself | *“Presale for Faye Webster at the Fox Theatre, a mid-size venue like the ones we’d pilot with. Bots hit the identity check; only verified people get through.”* |
| 0:27 | → (Pick a seat and pay): Mezzanine M3 is open; tap Row 14 seat 7, then four more | *“$100, all-in. Four tickets per person: try a fifth and the rule pushes back.”* Deselect, tap **$100.00**, double-tap **Double-click to pay**. |
| 0:38 | → (Maya can’t go): drag the slider hard to the right, or tap **Max allowed** | *“She can’t go, so she taps Sell. It hits a wall at $105: the contract rejects anything above. $102 for her, $2 for the artist, $1 for us.”* |
| 0:49 | → (The fair resale market) | *“The show is sold out. Every seat here comes from a verified fan, every price under the cap. There’s Maya’s seat at $105.”* |
| 0:57 | → (Ben buys): **Buy for $105.00**, double-tap to pay | *“Ben pays $105 all-in, not $400 plus fees. One all-or-nothing transaction: the ticket and the money move at the same time.”* |
| 1:06 | → (At the door): click **Scan** (desktop) or **Scan Ben’s phone** | *“His QR changes every few seconds and is signed by his wallet. Welcome, Ben.”* Tap **Screenshot** → *“A screenshot fails.”* |
| 1:14 | → (Proof of attendance) | *“After the show his token becomes proof of attendance: early access to the next presale. Bots can’t buy history.”* |
| 1:20 | → → (Artist, Proof) | *“The artist earns 2% of every resale, automatically. And anyone can verify every rule. Nobody has to trust us to keep doing it.”* |
| 1:28 | → (Back to Maya) | *“Next time, the resale price is capped and the artist gets paid. Proof of Seat: one seat, one token, one owner.”* |

Outside Story mode you can browse like a real ticketing app:

- **Discover** has working category filters (Concerts, Sports, Arts & Theater, Family) and search. Every event opens its page with
  price levels, a seat map (a three-tier theatre, a two-tier hall or a small basketball arena) and checkout.
- **Resale** is its own tab. *Buy tickets* lists every resale seat from verified fans (sold-out shows first), with face value, price and markup.
  *Sell a ticket* lists your tickets with their maximum resale price.
- Opening a listing shows a **price check** (face value · listed at · max allowed), a comparison with open resale sites and a bar of
  **where the money goes** (seller, artist 2% of face, Proof of Seat 1% of face). The buyer pays the listing price, all-in.
- **Manchester Orchestra is sold out**, so its page only offers fair resale. Maya also owns a Japanese Breakfast ticket she can sell at once
  (dashed **DEMO · Simulate a verified buyer** completes the sale).

If anything goes wrong on stage: **Reset demo**, then Story mode and jump with → to the chapter you need. Every step rebuilds its own state.

## Mid-size artists, illustrative listings

The pilot plan starts with one mid-size venue or independent artist, so the catalog uses mid-size and smaller acts at Atlanta theaters,
halls and small arenas. Artists, teams and venues are real; every date, price, seat and listing is illustrative.

| Event | Tour / series | Venue | Date in the demo |
|---|---|---|---|
| **Faye Webster** (featured, the story’s show) | Underdressed at the Symphony Tour | Fox Theatre | Sat, Jun 26, 2027 · presale |
| Manchester Orchestra | Hometown holiday show | Fox Theatre | Sat, Dec 19, 2026 · sold out, fair resale only |
| Japanese Breakfast | For Melancholy Brunettes Tour | Fox Theatre | Thu, Apr 15, 2027 |
| Lake Street Dive | Good Together Tour | Atlanta Symphony Hall | Fri, Mar 5, 2027 |
| Waxahatchee | Tigers Blood Tour | Variety Playhouse | Sat, Feb 13, 2027 |
| Lucy Dacus | Forever Is a Feeling Tour | Center Stage | Wed, May 12, 2027 |
| Atlanta Dream vs. Minnesota Lynx | WNBA Regular Season | Gateway Center Arena | Sat, Jun 5, 2027 |
| Georgia Tech vs. Duke | ACC Men’s Basketball | McCamish Pavilion | Sat, Jan 23, 2027 |
| Atlanta Symphony Orchestra | Beethoven’s Ninth | Atlanta Symphony Hall | Thu, Jan 14, 2027 |
| Dad’s Garage | Improv night | Dad’s Garage Theatre | Fri, Mar 12, 2027 |
| Center for Puppetry Arts | Rudolph the Red-Nosed Reindeer | Center for Puppetry Arts | Sat, Dec 12, 2026 |
| Atlanta Dream Family Night | vs. Chicago Sky | Gateway Center Arena | Sun, May 23, 2027 |

Seating maps are simplified drawings of each venue type’s general layout.
Proof of Seat is an academic concept: it is not affiliated with, endorsed by or selling tickets for any artist, team or venue, and no real payments happen.

### Photo credits

All photos come from Wikimedia Commons under free licenses, cropped and resized (`public/photos/`, details in `src/data/photo-credits.json`):

- Faye Webster — “Faye Webster at Rough Trade (47945510488)” by Paul Hudson, CC BY 2.0
- Manchester Orchestra — “Manchester Orchestra live performance 1” by Matthewvetter, CC BY-SA 4.0
- Japanese Breakfast — “Japanese Breakfast - 51520453152” by David Lee, CC BY 2.0
- Lake Street Dive — “Lake Street Dive 2022” by Jay Godwin, public domain
- Waxahatchee — “Waxahatchee at the Neptune Theatre in 2017” by David Lee, CC BY 2.0
- Lucy Dacus — “Lucy Dacus 2019” by David Lee, CC BY-SA 2.0
- Atlanta Dream — “260527 Lynx Dream JohnMc210 (55298398176) (cropped)” by John Mac, CC BY-SA 4.0
- Georgia Tech — “McCamish Pavilion Interior” by Thomsonmg2000, CC0
- Atlanta Symphony Hall — “Atlanta Symphony Hall, inside” by Jud McCranie, CC BY-SA 4.0
- Dad’s Garage — “Dads Garage Dragon Con September 6 2026 0851” by John Manard, CC BY-SA 4.0
- Center for Puppetry Arts — “SANTAANDRUDOLPHCFPA” by BakedintheHole, CC0
- Fox Theatre — “Fox Theater night” by Scott Ehardt, public domain
- Eras Tour (the hook on the product page) — “Taylor Swift Eras Tour London 20240819 1989era” by BrigidLIS, CC BY 4.0

## What’s inside

- Vite + React 19 + TypeScript + Tailwind CSS 4 + Motion. Zustand for the shared, persisted demo state. `qrcode` (core encoder) for real QR codes. Lucide icons.
- 100% static and deterministic: a seeded PRNG, a fixed demo clock (presale day, show night, after the show) and no network calls.
- PWA via `vite-plugin-pwa` (precached, offline after first load). HashRouter, so it works on GitHub Pages without server config.
- `src/lib/rules.ts` is the rules engine: cap, royalty, fee and the four resale checks. A $100 ticket resold at the $105 cap: the buyer pays $105, the seller gets $102, the artist $2, Proof of Seat $1.
- `src/store/demo.ts` is the single ledger every role reads from, the same idea as the blockchain itself.
- `src/demo/presenter/story.ts` defines the 7 chapters (12 steps) of Story mode.

## Deploy to GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and publishes on every push to `main`.
In the repository: **Settings → Pages → Source: GitHub Actions**. The site is served at `https://<user>.github.io/<repo>/`
and the demo at `https://<user>.github.io/<repo>/#/demo`.

## Rules reference

| Rule | Default |
|---|---|
| Resale cap | 105% of face value |
| Split of a resale at the cap | seller face value + 2%, artist 2%, Proof of Seat 1% (all % of face value) |
| Artist royalty | 2% of face value on every resale, paid instantly |
| Proof of Seat resale fee | 1% of face value, out of the price (the buyer pays the listing price, all-in); it also pays the gas |
| Proof of Seat primary fee | $1.50 per ticket, paid by the organizer |
| Per-person limit | 4 tickets per verified person, per event |
| Marketplace | tokens only move through the official marketplace contract |
| Resale window | closes 2 h before the show |
| Gifts | verified fans only, 2 transfers per ticket |

Network: Base (an Ethereum rollup), ≈ $0.01 per operation, paid by Proof of Seat. Contracts: tickets (ERC-721 + ERC-2981),
market (atomic escrow), badges (ERC-5192, soulbound, proof of attendance). On-chain: ticket ID, event, seat, face value, rules,
anonymous owner, history. Off-chain and encrypted: name, ID, email, card. No platform token.

The repository and the live URL keep their original name (`fairseat-demo`); everything users see says Proof of Seat.
