import { test, expect } from '@playwright/test';

test.describe('Matters API', () => {
  test('should fetch paginated matters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('limit');
    expect(data).toHaveProperty('totalPages');
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should support search functionality', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        search: 'Compliance',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should support sorting by subject', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'subject',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
    
    // Verify sorting order
    const subjects = data.data.map((matter: any) => matter.fields.subject?.value?.toLowerCase());
    const sorted = [...subjects].sort();
    expect(subjects).toEqual(sorted);
  });

  test('should support sorting by contract value', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'contract value',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should fetch status options', async ({ request }) => {
    const response = await request.get('/api/v1/status/options');

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('displayValue');
    expect(data[0]).toHaveProperty('sequence');
  });

  test('should handle invalid page parameter', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '-1',
        limit: '25',
      },
    });

    // Should either reject or default to page 1
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle search with special characters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        search: 'Litigation - Matter #9997',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should return correct matter structure', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '1',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    if (data.data.length > 0) {
      const matter = data.data[0];
      expect(matter).toHaveProperty('id');
      expect(matter).toHaveProperty('boardId');
      expect(matter).toHaveProperty('fields');
      expect(matter).toHaveProperty('createdAt');
      expect(matter).toHaveProperty('updatedAt');
    }
  });
});

test.describe('Matters API - Materialized View Search', () => {
  test('should search using full-text search', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Compliance',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.total).toBeGreaterThan(0);
  });

  test('should support partial word search', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Comp',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should match "Compliance" matters
    expect(data.total).toBeGreaterThan(0);
  });

  test('should handle symbols in search', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Matter #100',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    // Should not error with symbols
  });
});

test.describe('Matters API - Database Sorting', () => {
  test('should sort by status using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'status',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by priority using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'priority',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by due date using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'due date',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });
});
