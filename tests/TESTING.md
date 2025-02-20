## Getting Started

### 1. Dependencies Installation

```bash
npm install --save-dev vitest supertest @types/supertest
```

### 2. Test Environment Setup
Create `tests/setup.ts`:
```typescript
import { Express } from 'express';
import express from 'express';
import { registerRoutes } from '../server/routes';

export function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  registerRoutes(app);
  return app;
}
```

## Test Categories

### 1. Manual Test Cases
Document all manual test scenarios with:
- Clear test steps
- Expected results
- Edge cases
- Error scenarios

Example format:
```
Test Case: User Login
Steps:
1. Navigate to login page
2. Enter credentials
3. Click login button

Expected Results:
- Successful login
- Redirect to dashboard
- User session maintained
```

### 2. Unit Tests
Location: `tests/unit/*.test.ts`

Best Practices:
- Write focused, isolated tests
- Use descriptive test names
- Test both success and error cases
- Follow Arrange-Act-Assert pattern

Example:
```typescript
// tests/unit/doctors.test.ts
describe('Doctor Service Unit Tests', () => {
  it('should calculate distance correctly between two points', () => {
    const lat1 = 19.0760, lng1 = 72.8777;
    const lat2 = 28.6139, lng2 = 77.2090;

    const distance = calculateDistance(lat1, lng1, lat2, lng2);

    expect(distance).toBeGreaterThan(1140);
    expect(distance).toBeLessThan(1160);
  });
});
```

### 3. API Tests
Location: `tests/api/*.test.ts`

Best Practices:
- Test all endpoints thoroughly
- Verify response formats
- Include error cases
- Test query parameters

Example:
```typescript
// tests/api/doctors.test.ts
describe('Doctor API Tests', () => {
  it('should fetch doctors with distances', async () => {
    const response = await request
      .get('/api/doctors')
      .query({ lat: '19.0760', lng: '72.8777' });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Running Tests

Add these scripts to your package.json:
```json
{
  "scripts": {
    "test:unit": "vitest run tests/unit",
    "test:api": "vitest run tests/api"
  }
}
```

Execute tests:

# Run unit tests
npm run test:unit

# Run API tests
npm run test:api

### Required Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.x.x",
    "supertest": "^6.x.x",
    "@types/supertest": "^2.x.x"
  }
}