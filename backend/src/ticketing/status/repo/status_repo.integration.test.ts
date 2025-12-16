import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { StatusRepo } from './status_repo.js';
import { pool } from '../../../db/pool.js';

describe('StatusRepo Integration Tests', () => {
  let statusRepo: StatusRepo;

  beforeAll(async () => {
    statusRepo = new StatusRepo();
    
    // Verify database connection
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    // Close pool connections after all tests
    await pool.end();
  });

  describe('getAllStatuses', () => {
    it('should retrieve statuses from the database', async () => {
      const statuses = await statusRepo.getAllStatuses();

      // Database should have seeded status data
      expect(statuses).toBeDefined();
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should return status objects with correct structure', async () => {
      const statuses = await statusRepo.getAllStatuses();

      // Verify first status has expected properties
      const firstStatus = statuses[0];
      expect(firstStatus).toBeDefined();
      expect(firstStatus).toHaveProperty('displayValue');
      expect(typeof firstStatus.displayValue).toBe('string');
    });

    it('should limit results to 10 statuses', async () => {
      const statuses = await statusRepo.getAllStatuses();

      // Query has LIMIT 10
      expect(statuses.length).toBeLessThanOrEqual(10);
    });

    it('should return statuses in sequence order', async () => {
      const statuses = await statusRepo.getAllStatuses();

      // Check if labels are in ascending order (assuming sequence corresponds to alphabetical order here)
      const sortedLabels = [...statuses].sort((a, b) => a.sequence - b.sequence);
      
      expect(statuses).toEqual(sortedLabels);
    });

    it('should include expected status labels from seed data', async () => {
      const statuses = await statusRepo.getAllStatuses();
      const labels = statuses.map((s) => s.displayValue);

      // Based on typical seeded data, we expect common status labels
      // These are common statuses that should exist in the seed data
      const expectedStatuses = ['To Do', 'In Progress', 'Done'];
      
      // At least some of these should be present
      const hasExpectedStatuses = expectedStatuses.some((expected) =>
        labels.includes(expected)
      );

      expect(hasExpectedStatuses).toBe(true);
    });
  });
});
