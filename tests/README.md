Playwright E2E tests (template)

This folder contains Playwright test templates for the MVP APIs.

Prerequisites

- Node.js 16+ and npm/yarn
- The Next.js app running locally at http://localhost:3000 (or set BASE_URL env)

Install

```bash
npm install --save-dev @playwright/test
# optionally install browsers
npx playwright install --with-deps
```

Run tests

```bash
# run all tests
npx playwright test --project=chromium

# run a single test file
npx playwright test tests/api-mean.spec.ts
```

Notes

- These are templates: CI integration and secrets (if any) should be added to your workflow.
- Playwright must be installed in the developer environment to run tests. The repository does not bundle Playwright as runtime dependency by default.
