# Handoff: TapTip — Mobile Onboarding, Home & Tip Flow

## Overview
TapTip is a mobile web app (PWA) for sending/receiving USDC tips via QR code on Arc Testnet. This package covers the full first-run flow: splash, PWA install prompt, sign-in/OTP, onboarding, passkey setup, home (receive QR), account menu (balance/deposit/tip history), and the send-tip flow (choose amount → scan QR → processing → success), plus a transaction detail modal.

## About the Design Files
The bundled file (`TapTip Design Recreation.dc.html`) is a **design reference built in HTML** — a static prototype showing exact layout, copy, colors, and spacing for every screen, laid out side by side at real mobile dimensions (430×932, iPhone-style safe frame). It is not production code. The task is to **recreate these screens as real, interactive views in the target app's stack** (React Native, SwiftUI, Flutter, etc. — whatever the codebase uses), wiring up the actual navigation, state, and API calls that the static mockup only implies.

Each screen frame has a thin red horizontal ruler overlay (repeating gridlines) — this is a design-review aid only, not part of the real UI. Ignore/remove it during implementation.

## Fidelity
**High-fidelity.** Colors, typography, spacing, corner radii, and copy are final. Icons are simple custom line-art SVGs (not from an icon library) — recreate them as vector assets or swap for equivalent icons from your icon system if preferred.

## Design Tokens

### Colors
- Background: `#ffffff`
- Foreground / text: `#000000`
- Primary (brand yellow, primary buttons): `#FFCC00`, text on primary: `#000000`
- Surface (input fills, secondary buttons): `#f5f5f5`
- Accent / links / icon tint: `#0B53BF` (blue)
- Hint text: `rgba(0,0,0,0.6)`
- Border: `rgba(0,0,0,0.14)`
- Success green: `#16a34a` — light bg `#dcfce7` / light fg `#166534`
- Error red: `#dc2626` — light bg `#fee2e2` / light fg `#991b1b`
- Pending yellow — light bg `#fef9c3` / light fg `#854d0e`

### Typography
- **Nunito** (400/700/800) — all UI text, labels, buttons, body copy.
- **Comfortaa** (400/700) — numeric values only: balances, USDC amounts, dates, times, OTP digits, wallet totals. Gives numbers a distinct rounded-geometric look vs. the humanist body font.
- Screen titles: 24–28px / weight 800.
- Body/buttons: 17–21px / weight 700–800.
- Small labels (timestamps, hints): 13–15px.

### Spacing & Shape
- Card/modal corner radius: 12px.
- Pill buttons and chips: fully rounded (`border-radius: 999px`).
- Buttons sit at 66.6% of their row's height (not full-height), horizontally full-width of their flex row.
- Standard button/card shadow: `0 3px 8px rgba(0,0,0,0.2)`.
- Modal shadow: `0 20px 40px rgba(0,0,0,.3)`.
- Small popover/toast shadow (processing/success toasts): `0 12px 30px rgba(0,0,0,.4)`.
- Modals overlay a dimmed background: white 50%-opacity wash + black 55%-opacity scrim on top of the underlying screen.

## Screens

### 1. Splash
Full-bleed white screen, TapTip wordmark logo centered (logo mark: bold wordmark with a yellow dot accent), vertically weighted slightly above center.

### 2. Add to Home Screen
Blue "add/plus in a browser-window" icon (56px, `#0B53BF`), headline "Add TapTip to your Home Screen" (28px/800, centered), a 4-step numbered list (numbered circles in `#0B53BF`, white numeral, 26px circle):
1. Tap Option in Safari
2. Tap Share
3. Tap Add to Home Screen
4. Tap Add – you're done!

Primary yellow pill button "Continue" full-width, and a blue text link "Skip" below it, centered.

### 3. Sign in
Blue arrow-box icon, headline "Enter your email to get started". Email input (readonly demo value "alice") — recessed/inset style: no border, light gray fill, `inset 0 2px 5px rgba(0,0,0,.15)` shadow, fully rounded, centered text. Below it, two pill-shaped autofill/suggestion chips: "alice@gmail.com", "alice@icloud.com" (outlined, `--border` color, `--hint-fg` text).
Bottom row: a small square icon-only "back" button (outlined pill, back-arrow icon) + wide yellow "Send OTP" pill button (2:1 flex ratio).

### 4. Enter OTP
Blue envelope icon, headline "Enter the code sent to", email shown in blue/Comfortaa below it. 6-cell OTP row: filled cells are 40×40 rounded-12px boxes with the same inset shadow as other inputs, digit in Comfortaa; the active/next cell has a 2px yellow border and a blinking text-cursor bar instead of a digit; a bullet (•) marks a skipped/masked position.
Bottom: back icon-button + yellow "Continue" pill (2:1 ratio). Below that, an error line in red: "Invalid code, try again." (shown conditionally on OTP failure).

### 5. Onboarding — username
Blue avatar-in-square icon, headline "Create your username", one readonly text input ("Alice Nguyen") in the same inset style as other inputs. Bottom: back icon-button + yellow "Continue" pill.

### 6. Passkey setup
Blue "scan corners" (frame-corner) icon, headline "Set up a passkey" (24px). Bottom: back icon-button + yellow "Set up passkey" pill, and a blue text link "Skip for now" below.

### 7. Home
Top: "Balance 24.50 USDC" (label + value in Comfortaa 46px + unit, label/unit in blue). Below: a large square receive-QR code card (white, bordered, rounded 12px) showing the user's own receive QR. Caption below in blue: "Let others scan this to send you a tip - only receives USDC on Arc Testnet".
Bottom action row: a secondary icon-only pill button ("Random" — dice icon, muted/50%-opacity gray pill, flex:1) beside a primary yellow "Tip" pill (icon + label, flex:2, i.e. twice the width of Random). A decorative yellow quarter-circle sits behind the bottom-left corner. Below the button row, a hamburger/menu icon opens the account menu.

### 8. Menu — Balance & Wallet
Modal over the dimmed Home screen. Title "Balance & Wallet", balance restated large (28px, Comfortaa). Three full-width outlined action rows, stacked: "Deposit", "Withdraw", "Tip history" (each 40px tall, rounded 12px, standard button shadow). "Close" text link (blue) at the bottom.

### 9. Menu — Deposit
Modal, title "Deposit USDC (testnet)". Blue instruction line: "Your wallet address has been copied:", the address shown in a monospace code block on a gray surface. Numbered plain list (no circle badges here, just `<ol>`):
1. Open the Circle Faucet page
2. Paste the wallet address you just copied
3. Click Request on that page

Primary yellow full-width button "Open Circle Faucet", blue text link "Back" below.

### 10. Menu — Tip history
Modal, title "Tip history" (centered), search input "Search transactions..." (same inset style). Transactions grouped under date headers (Comfortaa, 18px/800, US format MM/DD/YYYY). Each row is two lines:
- Line 1: a small circular badge (22px, colored light-green bg for received/incoming or light-red bg for sent/outgoing, black up/down arrow icon inside) + counterparty name/label (flex, 17px/800) + amount right-aligned (green for +, red for −, Comfortaa for the number, Nunito 12px for "USDC").
- Line 2 (indented under the name, past the badge): time (Comfortaa, 14px, blue) + a status pill (Complete = green, Pending = yellow, Failed = red).

Sample rows: Tip: Maria Chen (+12.00, Complete), Tip: James Rivera (−5.00, Complete), Unknown address (+3.50, Pending), 0x4b7E...1a9F (−10.00, Failed).

### 11. Send — Choose amount
Modal, title "Choose an amount". A scrollable list of outlined amount rows (1 / 5 / 10 / 50 USDC), each with an "x" (clear/deselect) icon button beside it. The 50 USDC row is shown disabled (50% opacity) with an inline hint "Not enough balance" — insufficient-balance amounts should render this way. Below the list, a "+ Enter a different amount" row (blue plus-icon + blue text) for a custom amount.

### 12. Send — Scan QR
Modal, title interpolates the chosen amount: "Scan QR to send 5 USDC" (amount in Comfortaa). Below it, a full-width square black camera viewfinder with a white-bordered scan-target square inset. Below that, a centered outlined pill "Upload photo from gallery" (image icon + text) as an alternate input method. Bottom row: outlined icon-only "back" pill + a wide black "Done" pill (dark, not yellow — this is a neutral/confirm action here, 1:2 flex ratio).

### 13. Send — Processing (overlay on Scan QR)
The Scan QR screen dims to 40% opacity behind a centered popover card (not a full modal — smaller, rounded-12px card with the heavier popover shadow). Popover contents: a blue spinning-arrows/loading icon (56px) and "Processing transaction..." (20px/700). *(Icon should animate — spin — in the live implementation.)*

### 14. Send — Success (overlay on Scan QR)
Same popover treatment as Processing, over the dimmed Scan QR screen. Green checkmark-in-circle icon (56px) and the signed amount in Comfortaa, e.g. "-5.00 USDC" (20px/700). This is a brief confirmation toast before returning to Home.

### 15. Transaction detail (overlay on Tip History)
The Tip History modal dims to 40% opacity behind a second, foreground modal. Header row: empty / "Transaction Details" (centered) / a blue "x" close icon (3-column grid so the title stays centered regardless of the close icon). Below, a gray surface card with: status pill + "Tip sent" label (row), then labeled fields "Amount" (20px/800 Comfortaa "5.00 USDC"), "To" (17px/800 name), and a date+time line. Below the card, an outlined full-width button "View on ArcScan" (block-explorer link).

## Interactions & Behavior (implied — confirm exact rules with product/eng)
- **Sign in → OTP**: submitting email triggers "Send OTP"; OTP screen validates 6-digit code; wrong code shows the red inline error and likely clears/refocuses the input.
- **Onboarding is skippable at the passkey step** ("Skip for now") but not at "Add to Home Screen" ("Skip") or username creation (no skip shown — implies required).
- **Home → Send flow**: tapping "Tip" opens "Choose an amount" → user picks a preset or enters a custom amount → "Scan QR to send X USDC" (camera view) → scanning/uploading a recipient QR triggers "Processing transaction..." → "Success" toast auto-dismisses back to Home (or Tip history).
- **"Random" button** on Home: icon-only dice button, implies picking a randomized preset tip amount and jumping straight into the send flow — confirm exact behavior with product.
- **Insufficient balance**: amount rows the user can't afford render disabled (50% opacity) with a "Not enough balance" hint instead of being hidden.
- **Tip history rows are tappable**, opening the Transaction Detail modal on top.
- **All modals** dim the screen beneath them (50% white wash + 55% black scrim) and are dismissed via an explicit "Close"/"Back"/"x" affordance shown per screen — no assumption of tap-outside-to-dismiss without confirming.

## State Management (implied)
- Auth/session: email, OTP verification state, passkey registration state.
- Wallet: USDC balance, wallet address, receive-QR payload.
- Send flow: selected amount (preset or custom), scanned/uploaded recipient, transaction status (idle → processing → success/failure).
- Tip history: list of transactions (counterparty, amount, direction, status, timestamp), searchable/filterable; a selected transaction for the detail modal.

## Assets
- `logo-full.svg` — TapTip wordmark, used full-size on the Splash screen.
- All other icons are inline SVGs (line-art, `currentColor` strokes/fills, 100×100 viewBox) — see the HTML source for exact paths per icon (email arrow, envelope, avatar, passkey/scan-corners, dice, tip/send arrows, back arrow, deposit/menu icons, close "x", checkmark-circle, spinner, up/down transfer arrows, upload-photo, gallery frame).

## Files in this package
- `TapTip Design Recreation.dc.html` — full static prototype, all 15 screens.
- `assets/logo-full.svg` — wordmark asset.
