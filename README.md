<div align="center">

<img src="items/logo-full.svg" width="200" alt="TapTip">

**Tipping should be as fast as a handshake.**

Send USDC by scanning a QR code. No seed phrase, no gas token, no wallet app.

[**taptip.fun**](https://taptip.fun) · Arc Testnet · Next.js on Cloudflare Workers

</div>

---

## The 10-second version

|  | |
| --- | --- |
| **To get tipped** | Open the app. Your home screen *is* your QR code. |
| **To tip someone** | Tap to Tip → scan → pick an amount → sent. |
| **To sign up** | Type your email, enter a 6-digit code. That's it. |

Three things make that possible, and each one removes a step users normally accept as unavoidable:

- **No confirmation step.** Circle signs on the server, so a tip is two taps — no signature popup, no Face ID.
- **No gas token.** Arc uses USDC as its native gas, and the app covers the fee. Users never hold a second asset.
- **No wallet to install.** A wallet is created behind the scenes on first sign-in and custodied by Circle.

A tip is a two-second gesture. If paying takes longer than the gesture itself, people stop doing it — that belief drives every decision in this repo.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router) → Cloudflare Workers via OpenNext |
| Wallet | Circle Developer-Controlled Wallets (server-signed) |
| Chain | Arc Testnet, USDC |
| Data | Cloudflare D1 (users, tip amounts, transactions) + KV (sessions) |
| Email | Resend (login codes) |

## Run it locally

```bash
cd app
npm install
cp .env.example .env.local        # fill in Circle + Resend keys
npx wrangler d1 migrations apply taptip-db --local
npm run dev
```

Deploying is **manual** — pushing to GitHub does not ship the site:

```bash
npm run cf:deploy
```

## Repo layout

| Path | What's inside |
| --- | --- |
| [`app/`](app/) | The application |
| [`docs/`](docs/) | Product trail — idea, PRD, planning, wireframes |
| [`HANDOFF.md`](HANDOFF.md) | Current state, decisions, and traps worth knowing |

## Credits

Forked from [`circlefin/arc-p2p-payments`](https://github.com/circlefin/arc-p2p-payments) and rebuilt around the idea above. Apache-2.0 — see [`app/LICENSE`](app/LICENSE).
