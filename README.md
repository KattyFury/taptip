# TapTip

**Tipping should be as fast as a handshake.**

Money moves between people all the time — a tip, a thank-you, lucky money at Tết. That moment lasts a few seconds, so the payment has to fit inside it. TapTip is built on one belief: if paying someone takes longer than the gesture itself, people stop doing it.

So everything a normal crypto app asks for is gone. No seed phrase. No gas token. No wallet app. No account number to read out loud. You show a QR code, the other person scans it, picks an amount, and it's done.

## How it works

1. **Sign in with your email.** A 6-digit code, then a passkey (Face ID / fingerprint). No password.
2. **A wallet appears behind the scenes.** Circle Modular Wallets creates it, tied to your passkey. Your signing key never leaves your device.
3. **Show your QR to get tipped.** Your home screen *is* the QR code.
4. **Tap to Tip to give.** Scan, choose an amount, sent. USDC arrives in seconds.

The app pays the gas. Users never hold a second token, and never see the word "gas".

## Why Arc

Arc is Circle's chain where **USDC is the native gas token**. One asset does everything — no "you need ETH to move your USDC" dead end, and fees stay predictable. That is what makes the no-gas experience above possible rather than a workaround.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), deployed to Cloudflare Workers via OpenNext |
| Wallet | Circle Modular Wallets — passkey-owned smart accounts |
| Chain | Arc Testnet, USDC |
| Data | Cloudflare D1 (users, tip amounts, transactions) + KV (sessions) |
| Email | Resend (login codes) |

## Run it locally

```bash
cd app
npm install
cp .env.example .env.local   # fill in Circle + Resend keys
npx wrangler d1 migrations apply taptip-db --local
npm run dev
```

Deploying is manual — pushing to GitHub does **not** ship the site:

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

Status: running on Arc Testnet at [taptip.kattyfury1403.workers.dev](https://taptip.kattyfury1403.workers.dev).
