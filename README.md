# UK Inheritance Tax (IHT) Calculator

A modern, full-featured web application to assess UK Inheritance Tax liability, optimize statutory allowances, and plan estates effectively.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Vitest**.

---

## Features

### 1. Comprehensive Statutory Rules Engine
* **Nil-Rate Band (NRB):** £325,000 standard individual allowance.
* **Transferable Nil-Rate Band (TNRB):** Claim up to 100% of an unused NRB from a deceased spouse or civil partner (up to £650,000 combined).
* **Residence Nil-Rate Band (RNRB):** Up to £175,000 when leaving a qualifying family home to direct descendants (children, grandchildren, etc.).
* **Transferable RNRB (TRNRB):** Claim up to 100% of an unused RNRB from a deceased spouse (up to £350,000 combined; £1,000,000 maximum combined allowance).
* **High-Value Estate Taper (£2M Rule):** Automatically reduces RNRB by £1 for every £2 of estate net value over £2,000,000 (Section 8D IHTA 1984).
* **Downsizing Addition:** Preserves lost RNRB if an individual downsized or sold a home on or after 8 July 2015.
* **7-Year Lifetime Gifts (PETs):**
  * Automatic statutory exemptions (Annual £3,000 with 1-year carry-forward, Marriage gifts, Small gifts, Normal expenditure from income).
  * Chronological NRB consumption.
  * Taper relief calculation (0–3 yrs: 0%, 3–4 yrs: 20%, 4–5 yrs: 40%, 5–6 yrs: 60%, 6–7 yrs: 80%).
* **Charitable Giving & 36% Reduced Rate:**
  * Schedule 1A baseline estate test (10% threshold).
  * Built-in **Charity 36% Optimizer** calculating the exact additional donation needed and net cost to heirs.
* **Business Property Relief (BPR) & Agricultural Property Relief (APR):** 100% and 50% relief support.
* **Autumn Budget 2024 Pension Toggle:** Switch between current rules (pensions held in discretionary trust excluded from IHT) and the post-April 2027 rules (unused pensions brought into scope).

### 2. Unauthenticated Persistence & Sharing
* **Zero-Friction Auto-Save:** In-progress calculations automatically sync to `localStorage` in the browser so no data is lost on reload.
* **Minimal Serverless Store:** Click **"Save & Share"** to store an anonymous JSON record and generate a clean 8-character URL (e.g. `/c/k8m2p9w4`).
* **QR Code Sharing:** Mobile-friendly QR code for opening and sharing on phones or tablets.
* **JSON Export:** Download full calculation state as a JSON file backup.
* **Print / PDF Report:** Formatted summary report ready for printing or exporting to PDF for solicitors, financial advisors, or family.

---

## Project Structure

```
├── app/
│   ├── api/calculations/        # Serverless API routes (POST save, GET retrieve)
│   ├── c/[id]/                  # Dynamic page for restoring shared calculations
│   ├── globals.css              # Tailwind CSS styles
│   ├── layout.tsx               # Root layout & metadata
│   └── page.tsx                 # Main calculator dashboard
├── components/
│   ├── CurrencyInput.tsx        # Accessible £ formatted input
│   ├── EstateForm.tsx           # Tabbed estate questionnaire
│   ├── Footer.tsx               # Statutory references & GOV.UK/HMRC guidance links
│   ├── GiftTracker.tsx          # 7-year gift logger with taper relief calculations
│   ├── Navbar.tsx               # Navigation, example loader, print, and save buttons
│   ├── PercentageInput.tsx      # Percentage input with quick presets
│   ├── PrintReport.tsx          # Clean PDF / Print stylesheet report
│   ├── ResultsSummary.tsx       # Live sticky KPI dashboard & visual breakdown
│   └── ShareModal.tsx           # Share link generator with QR code
├── hooks/
│   └── useCalculatorState.ts    # Reactive state management & localStorage sync
├── lib/
│   ├── calculator/              # Pure TypeScript statutory tax engine
│   │   ├── allowances.ts        # NRB, TNRB, RNRB, and £2M taper calculation
│   │   ├── charity.ts           # Schedule 1A 10% test & charity optimizer
│   │   ├── constants.ts         # Statutory HMRC rates and thresholds
│   │   ├── gifts.ts             # 7-year PETs and taper relief schedule
│   │   ├── index.ts             # Master calculation orchestrator
│   │   └── calculator.test.ts   # 100% test coverage suite
│   └── storage/                 # Minimal serverless storage adapter
│       ├── index.ts             # Lightweight file/KV storage implementation
│       └── storage.test.ts      # Storage adapter tests
├── plan.md                      # Product and architectural specification
└── types/
    └── iht.ts                   # Comprehensive TypeScript definitions
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Deploying to Cloudflare Pages

### 1. Create Cloudflare KV Namespace
In your Cloudflare dashboard (or via Wrangler), create the KV namespace:
```bash
npx wrangler kv namespace create CALCULATIONS_KV
npx wrangler kv namespace create CALCULATIONS_KV --preview
```

### 2. Configure `wrangler.jsonc`
Replace the placeholder IDs in `wrangler.jsonc` with your namespace IDs:
```jsonc
{
  "name": "iht-calculator",
  "kv_namespaces": [
    {
      "binding": "CALCULATIONS_KV",
      "id": "<YOUR_KV_NAMESPACE_ID>",
      "preview_id": "<YOUR_PREVIEW_KV_NAMESPACE_ID>"
    }
  ]
}
```

### 3. Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy
```
Or connect your GitHub repository directly in the Cloudflare Pages dashboard with the following build settings:
- **Build command:** `npm run build`
- **Build output directory:** `.next`
- **KV Binding:** Under *Settings* → *Functions* → *KV namespace bindings*, bind `CALCULATIONS_KV` to your created KV namespace.
