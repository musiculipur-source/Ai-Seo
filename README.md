# SEO Audit AI Pro

SEO Audit AI Pro is a premium full-stack search optimization analysis dashboard built using **TypeScript**, **Node.js (Express)**, **React 19 (Vite)**, and **Gemini AI (Google GenAI)**. 

The application is fully optimized for containerization and handles high-fidelity scraping, performance diagnostics, local JSON persistence, and smart optimization reports generated dynamically by Gemini.

---

## 📂 Folder Structure

```text
seo-audit-ai-pro/
├── backend/                  # REST API Layer
│   └── src/
│       ├── config/           # Centralized configuration & environment loader
│       ├── controllers/      # API Request & Response handlers
│       ├── middleware/       # Express global error & signature handlers
│       ├── routes/           # REST endpoint mapping
│       ├── services/         # Scrapers and Gemini LLM services
│       └── types/            # Backend interfaces
├── database/                 # Node File System persistence layers
├── docs/                     # Engineering design files
├── exports/                  # Saved spreadsheet exports
├── frontend/                 # Client UI App
│   └── src/
│       ├── assets/           # Client media & styling variables
│       ├── components/       # Reusable React layout components
│       ├── services/         # Client API endpoint connectors
│       └── utils/            # Helper files
├── reports/                  # Saved JSON audit reports
├── shared/                   # Shared Type Definitions
├── package.json              # Full-stack dependency scripts
├── server.ts                 # Main full-stack entry point
├── tsconfig.json             # TypeScript compiler rules
└── vite.config.ts            # Vite client bundler
```

---

## 🛠️ Technical Stack & Configuration

- **Backend**: Express container running on Port 3000, mapped to `0.0.0.0` for full ingress.
- **Client**: React 19 wrapped inside Vite middleware for immediate hot dev streaming.
- **Styles**: Tailwind CSS with custom font family pairings (Inter, Space Grotesk, JetBrains Mono).
- **Core AI**: `@google/genai` calling `gemini-3.5-flash` with a robust safety wrapper.

---

## 🚀 Getting Started & Commands

### Development Server
```bash
npm run dev
```
Starts Express, initializes Vite middleware in dev mode, and binds the full container to `http://localhost:3000`.

### Production Compilation
```bash
npm run build
```
Generates standard client assets inside `/dist` and compiles `/server.ts` into a self-contained CommonJS `/dist/server.cjs` bundle with `esbuild`.

### Launch Production Build
```bash
npm run start
```
Directly launches the pre-compiled server container.

---

## 🧩 Architectural Blueprints (Step 6 Extensions)

Check out the **Pro Architecture** tab directly in the running application for structured, copy-pasteable TypeScript integration blueprints covering:
1. **Firebase Authentication Middleware** for user logins.
2. **Stripe Checkout Webhooks** for subscription monetization.
3. **Apify Spider Tasks** for deep crawling of multi-page domains (up to 100+ pages).
