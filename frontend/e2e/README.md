# Playwright E2E and API Testing

This directory contains end-to-end (E2E) and API tests for the Matter Management application using Playwright.

## Test Structure

- **`matters.api.spec.ts`** - API tests for backend endpoints
- **`matters-ui.spec.ts`** - UI/E2E tests for frontend functionality

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### API Tests Only
```bash
npm run test:e2e:api
```

### With UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### View Test Report
```bash
npm run test:e2e:report
```

## Configuration

Test configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:3001` (API) / `http://localhost:5173` (UI)
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel Execution**: Enabled
- **Retries**: 2 in CI, 0 locally

## Environment Variables

- `API_BASE_URL` - Override default API URL (default: `http://localhost:3001`)

Example:
```bash
API_BASE_URL=http://localhost:4000 npm run test:e2e:api
```

## Writing Tests

### API Tests
```typescript
test('GET /api/matters', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/api/matters`);
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data).toHaveProperty('matters');
});
```

### UI Tests
```typescript
test('should display table', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForSelector('table');
  expect(await page.locator('table').isVisible()).toBeTruthy();
});
```

## CI/CD Integration

Tests can be run in CI with:
```bash
CI=true npm run test:e2e
```

This enables:
- Stricter failure modes
- Test retries
- Single worker execution
- Prevents running if `.only` is present
