import { test, expect } from '@playwright/test';
import { Matter } from '../../src/ticketing/types/types.js';

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
    const data = await response.json() as {
      data: Matter[];
    }
    expect(data.data.length).toBeGreaterThan(0);
    
    // Verify sorting order
    const subjects = data.data.map((matter) => matter.fields.subject?.value);
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

test.describe('Matters API - Advanced Search Functionality', () => {
  test('should search by complete matter name', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Contract Review',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.total).toBeGreaterThan(0);
    
    // Verify results contain the search term
    const hasMatchingResult = data.data.some((matter: Matter) => {
      const subject = matter.fields.subject?.value?.toString().toLowerCase() || '';
      return subject.includes('contract') || subject.includes('review');
    });
    expect(hasMatchingResult).toBe(true);
  });

  test('should search with partial word (beginning)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Litig',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should match "Litigation" matters
    expect(data.total).toBeGreaterThan(0);
  });

  test('should search with partial word (middle)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'mplianc',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should match "Compliance" matters
    expect(data.total).toBeGreaterThan(0);
  });

  test('should handle search with extra spaces', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '  Contract   Review  ',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should still find results despite extra spaces
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
  });

  test('should handle search with leading/trailing whitespace', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '   Compliance   ',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.total).toBeGreaterThan(0);
  });

  test('should handle search with special character: hyphen', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Merger & Acquisition',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should handle ampersand in search
    expect(data).toHaveProperty('data');
  });

  test('should handle search with special character: ampersand', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'M&A',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with hash symbol', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '#100',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should not crash with hash symbol
    expect(data).toHaveProperty('data');
  });

  test('should handle search with parentheses', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Matter (Urgent)',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with brackets', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '[Priority] Matter',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with quotes', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '"Contract Review"',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with apostrophe', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: "Client's Matter",
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with backslash', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Matter\\Test',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with forward slash', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Matter/Case',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with SQL injection attempt', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: "'; DROP TABLE tickets; --",
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should safely handle SQL injection attempt
    expect(data).toHaveProperty('data');
  });

  test('should handle search with XSS attempt', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '<script>alert("xss")</script>',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should safely handle XSS attempt
    expect(data).toHaveProperty('data');
  });

  test('should handle search with percent sign (LIKE wildcard)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '%Matter%',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should treat % as literal character, not wildcard
    expect(data).toHaveProperty('data');
  });

  test('should handle search with underscore (LIKE wildcard)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Matter_Test',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should treat _ as literal character, not wildcard
    expect(data).toHaveProperty('data');
  });

  test('should handle empty search string', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should return all matters when search is empty
    expect(data.total).toBeGreaterThan(0);
  });

  test('should handle search with only whitespace', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '     ',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should return all matters when search is only whitespace
    expect(data.total).toBeGreaterThan(0);
  });

  test('should handle very long search string', async ({ request }) => {
    const longSearch = 'Contract Review '.repeat(20); // Reduced from 50 to avoid URL length limits
    const response = await request.get('/api/v1/matters', {
      params: {
        search: longSearch,
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should handle long search strings without error
    expect(data).toHaveProperty('data');
  });

  test('should handle search with unicode characters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Café Matter 文档',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with emoji', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '🔥 Matter',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with newline characters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Contract\nReview',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle search with tab characters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'Contract\tReview',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should search case-insensitively', async ({ request }) => {
    const searches = ['contract', 'CONTRACT', 'CoNtRaCt'];
    
    for (const search of searches) {
      const response = await request.get('/api/v1/matters', {
        params: {
          search,
          page: '1',
          limit: '10',
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.total).toBeGreaterThan(0);
    }
  });

  test('should handle search across different field types', async ({ request }) => {
    // Search for a number that might appear in case numbers
    const response = await request.get('/api/v1/matters', {
      params: {
        search: '100',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Should search across text and number fields
    expect(data).toHaveProperty('data');
  });

  test('should return no results for non-existent term', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        search: 'XYZ99999NonexistentMatterTerm',
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.total).toBe(0);
    expect(data.data.length).toBe(0);
  });
});

test.describe('Matters API - Database Sorting', () => {
  test('should sort by subject using materialized view', async ({ request }) => {
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
  });

  test('should sort by case number using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'case number',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

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

  test('should sort by assigned to using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'assigned to',
        sortOrder: 'desc',
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

  test('should sort by contract value using materialized view', async ({ request }) => {
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

  test('should sort by urgent flag using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'urgent',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by created_at using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by updated_at using materialized view', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'updated_at',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by resolution_time (computed field)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'resolution_time',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('should sort by SLA (computed field)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sortBy: 'sla',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.length).toBeGreaterThan(0);
  });
});

test.describe('Matters API - SLA Filtering', () => {
  test('should filter by SLA status "All" (default)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'All',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data.total).toBeGreaterThan(0);
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should filter by SLA status "In Progress"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        sla: 'In Progress',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json() as {
      data: Matter[];
    }
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have "In Progress" SLA status
    if (data.data.length > 0) {
      data.data.forEach((matter) => {
        expect(matter.sla).toBe('In Progress');
      });
    }
  });

  test('should filter by SLA status "Met"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        sla: 'Met',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json() as {
      data: Matter[];
    }
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have "Met" SLA status
    if (data.data.length > 0) {
      data.data.forEach((matter) => {
        expect(matter.sla).toBe('Met');
      });
    }
  });

  test('should filter by SLA status "Breached"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        sla: 'Breached',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json() as {
      data: Matter[];
    }
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have "Breached" SLA status
    if (data.data.length > 0) {
      data.data.forEach((matter) => {
        expect(matter.sla).toBe('Breached');
      });
    }
  });

  test('should default to "All" when no SLA parameter is provided', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data.total).toBeGreaterThan(0);
  });

  test('should reject invalid SLA filter values', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'Invalid Status',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid query parameters');
  });

  test('should combine SLA filtering with search', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'In Progress',
        search: 'Matter',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    
    // Verify all results match both search and SLA filter
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('In Progress');
      });
    }
  });

  test('should combine SLA filtering with sorting', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'Met',
        sortBy: 'subject',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json() as {
      data: Matter[];
    }
    expect(data).toHaveProperty('data');
    
    // Verify all results have "Met" SLA status
    if (data.data.length > 0) {
      data.data.forEach((matter) => {
        expect(matter.sla).toBe('Met');
      });
      
      // Verify sorting is applied
      const subjects = data.data.map((matter: Matter) => 
        matter.fields.subject?.value || ''
      );
      const sorted = [...subjects].sort();
      expect(subjects).toEqual(sorted);
    }
  });

  test('should paginate filtered SLA results correctly', async ({ request }) => {
    // Get first page
    const page1Response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        sla: 'In Progress',
      },
    });

    expect(page1Response.ok()).toBeTruthy();
    const page1Data = await page1Response.json();
    
    expect(page1Data).toHaveProperty('page');
    expect(page1Data).toHaveProperty('limit');
    expect(page1Data).toHaveProperty('totalPages');
    expect(page1Data.page).toBe(1);
    expect(page1Data.limit).toBe(5);
    
    // If there are multiple pages, get page 2
    if (page1Data.totalPages > 1) {
      const page2Response = await request.get('/api/v1/matters', {
        params: {
          page: '2',
          limit: '5',
          sla: 'In Progress',
        },
      });

      expect(page2Response.ok()).toBeTruthy();
      const page2Data = await page2Response.json();
      expect(page2Data.page).toBe(2);
      
      // Ensure page 1 and page 2 data are different
      const page1Ids = page1Data.data.map((m: Matter) => m.id);
      const page2Ids = page2Data.data.map((m: Matter) => m.id);
      const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  test('should return correct total count for filtered SLA results', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '100',
        sla: 'In Progress',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('total');
    expect(data.total).toBeGreaterThanOrEqual(data.data.length);
    
    // Verify the total count matches filtered results
    const actualCount = data.data.length;
    if (data.totalPages === 1) {
      expect(data.total).toBe(actualCount);
    }
  });

  test('should handle empty results for SLA filter', async ({ request }) => {
    // Try to get a specific SLA status with a very specific search that might not exist
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'Met',
        search: 'NonExistentMatterXYZ123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.total).toBe(0);
    expect(data.data.length).toBe(0);
  });

  test('should include SLA field in response structure', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '1',
        sla: 'All',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    if (data.data.length > 0) {
      const matter = data.data[0];
      expect(matter).toHaveProperty('sla');
      expect(['In Progress', 'Met', 'Breached']).toContain(matter.sla);
    }
  });

  test('should combine SLA filtering with multiple query parameters', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'Breached',
        search: 'Litigation',
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify all filters are applied correctly
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('Breached');
      });
    }
  });

  test('should maintain SLA filter across different page sizes', async ({ request }) => {
    const limit10Response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        sla: 'Met',
      },
    });

    const limit25Response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        sla: 'Met',
      },
    });

    expect(limit10Response.ok()).toBeTruthy();
    expect(limit25Response.ok()).toBeTruthy();
    
    const data10 = await limit10Response.json();
    const data25 = await limit25Response.json();
    
    // Verify both responses are valid
    expect(data10).toHaveProperty('total');
    expect(data25).toHaveProperty('total');
    expect(data10).toHaveProperty('data');
    expect(data25).toHaveProperty('data');
    
    // All items should have Met status
    if (data10.data.length > 0) {
      data10.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('Met');
      });
    }
    if (data25.data.length > 0) {
      data25.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('Met');
      });
    }
    
    // If both have data, the first items up to limit 10 should match
    if (data10.data.length > 0 && data25.data.length > 0) {
      const limit = Math.min(data10.data.length, 10);
      for (let i = 0; i < limit; i++) {
        expect(data10.data[i].id).toBe(data25.data[i].id);
      }
    }
  });
});

test.describe('Matters API - Resolution Time Filtering', () => {
  test('should filter by resolution time "All" (default)', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'All',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(data.total).toBeGreaterThan(0);
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('should filter by resolution time "Under 1 hour"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        resolutionTime: 'Under 1 hour',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have resolution time under 1 hour
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const oneHour = 60 * 60 * 1000;
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(oneHour);
      });
    }
  });

  test('should filter by resolution time "1-4 hours"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        resolutionTime: '1-4 hours',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have resolution time between 1-4 hours
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const oneHour = 60 * 60 * 1000;
        const fourHours = 4 * oneHour;
        expect(matter.cycleTime!.resolutionTimeMs).toBeGreaterThanOrEqual(oneHour);
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(fourHours);
      });
    }
  });

  test('should filter by resolution time "4-8 hours"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        resolutionTime: '4-8 hours',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have resolution time between 4-8 hours
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const oneHour = 60 * 60 * 1000;
        const fourHours = 4 * oneHour;
        const eightHours = 8 * oneHour;
        expect(matter.cycleTime!.resolutionTimeMs).toBeGreaterThanOrEqual(fourHours);
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(eightHours);
      });
    }
  });

  test('should filter by resolution time "Over 8 hours"', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        resolutionTime: 'Over 8 hours',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBeTruthy();
    
    // Verify all returned matters have resolution time over 8 hours
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const eightHours = 8 * 60 * 60 * 1000;
        expect(matter.cycleTime!.resolutionTimeMs).toBeGreaterThanOrEqual(eightHours);
      });
    }
  });

  test('should reject invalid resolution time filter values', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'Invalid Range',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid query parameters');
  });

  test('should combine resolution time filtering with SLA filtering', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'Under 1 hour',
        sla: 'Met',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    
    // Verify all results match both filters
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('Met');
        const oneHour = 60 * 60 * 1000;
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(oneHour);
      });
    }
  });

  test('should combine resolution time filtering with search', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: '1-4 hours',
        search: 'Matter',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    
    // Verify all results match the resolution time filter
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const oneHour = 60 * 60 * 1000;
        const fourHours = 4 * oneHour;
        expect(matter.cycleTime!.resolutionTimeMs).toBeGreaterThanOrEqual(oneHour);
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(fourHours);
      });
    }
  });

  test('should combine resolution time filtering with sorting', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'Over 8 hours',
        sortBy: 'subject',
        sortOrder: 'asc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('data');
    
    // Verify all results have over 8 hours resolution time
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        const eightHours = 8 * 60 * 60 * 1000;
        expect(matter.cycleTime!.resolutionTimeMs).toBeGreaterThanOrEqual(eightHours);
      });
      
      // Verify sorting is applied
      const subjects = data.data.map((matter: Matter) => 
        matter.fields.subject?.value || ''
      );
      const sorted = [...subjects].sort();
      expect(subjects).toEqual(sorted);
    }
  });

  test('should paginate filtered resolution time results correctly', async ({ request }) => {
    // Get first page
    const page1Response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '5',
        resolutionTime: 'Under 1 hour',
      },
    });

    expect(page1Response.ok()).toBeTruthy();
    const page1Data = await page1Response.json();
    
    expect(page1Data).toHaveProperty('page');
    expect(page1Data).toHaveProperty('limit');
    expect(page1Data).toHaveProperty('totalPages');
    expect(page1Data.page).toBe(1);
    expect(page1Data.limit).toBe(5);
    
    // If there are multiple pages, get page 2
    if (page1Data.totalPages > 1) {
      const page2Response = await request.get('/api/v1/matters', {
        params: {
          page: '2',
          limit: '5',
          resolutionTime: 'Under 1 hour',
        },
      });

      expect(page2Response.ok()).toBeTruthy();
      const page2Data = await page2Response.json();
      expect(page2Data.page).toBe(2);
      
      // Ensure page 1 and page 2 data are different
      const page1Ids = page1Data.data.map((m: Matter) => m.id);
      const page2Ids = page2Data.data.map((m: Matter) => m.id);
      const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  test('should return correct total count for filtered resolution time results', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '100',
        resolutionTime: '4-8 hours',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('total');
    expect(data.total).toBeGreaterThanOrEqual(data.data.length);
    
    // Verify the total count matches filtered results
    const actualCount = data.data.length;
    if (data.totalPages === 1) {
      expect(data.total).toBe(actualCount);
    }
  });

  test('should handle empty results for resolution time filter', async ({ request }) => {
    // Try to get a specific resolution time with a very specific search that might not exist
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'Under 1 hour',
        search: 'NonExistentMatterXYZ123',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('total');
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.total).toBe(0);
    expect(data.data.length).toBe(0);
  });

  test('should combine all filters: SLA, resolution time, search, and sorting', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '10',
        resolutionTime: 'Under 1 hour',
        sla: 'Met',
        search: 'Matter',
        sortBy: 'created_at',
        sortOrder: 'desc',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify all filters are applied correctly
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        expect(matter.sla).toBe('Met');
        const oneHour = 60 * 60 * 1000;
        expect(matter.cycleTime!.resolutionTimeMs).toBeLessThan(oneHour);
      });
    }
  });

  test('should exclude matters with null resolution time when filtering', async ({ request }) => {
    const response = await request.get('/api/v1/matters', {
      params: {
        page: '1',
        limit: '25',
        resolutionTime: 'Under 1 hour',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // All results should have non-null resolution time
    if (data.data.length > 0) {
      data.data.forEach((matter: Matter) => {
        expect(matter.cycleTime!.resolutionTimeMs).not.toBeNull();
        expect(matter.cycleTime!.resolutionTimeMs).not.toBeUndefined();
      });
    }
  });
});

