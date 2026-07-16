# Concierge

AI-native, WhatsApp-first wedding concierge — see `CLAUDE.md` for repo
conventions and `docs/` for the product strategy and autonomous-dev-flywheel
docs.

## Local development

```bash
npm install
npm run dev
```

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit tests
npm run test:e2e   # Playwright e2e/smoke tests (run `npm run test:e2e:install` once first)
npm run build      # production build
```
