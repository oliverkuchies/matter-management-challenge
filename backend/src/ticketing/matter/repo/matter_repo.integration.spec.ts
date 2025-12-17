import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../../db/pool.js';
import MatterRepo from './matter_repo.js';

describe('matterRepo Integration Tests', () => {
  let matterRepo: MatterRepo;

  beforeAll(async () => {
    matterRepo = new MatterRepo();
    
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
      const statuses = await matterRepo.getAllStatuses();

      // Database should have seeded status data
      expect(statuses).toBeDefined();
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);
    });

    it('should return status objects with correct structure', async () => {
      const statuses = await matterRepo.getAllStatuses();

      // Verify first status has expected properties
      const firstStatus = statuses[0];
      expect(firstStatus).toBeDefined();
      expect(firstStatus).toHaveProperty('displayValue');
      expect(typeof firstStatus.displayValue).toBe('string');
    });

    it('should limit results to 10 statuses', async () => {
      const statuses = await matterRepo.getAllStatuses();

      // Query has LIMIT 10
      expect(statuses.length).toBeLessThanOrEqual(10);
    });

    it('should return statuses in sequence order', async () => {
      const statuses = await matterRepo.getAllStatuses();

      // Check if labels are in ascending order (assuming sequence corresponds to alphabetical order here)
      const sortedLabels = [...statuses].sort((a, b) => a.sequence - b.sequence);
      
      expect(statuses).toEqual(sortedLabels);
    });

    it('should include expected status labels from seed data', async () => {
      const statuses = await matterRepo.getAllStatuses();
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

  describe('getTicketingCycleTimeHistory', () => {
    it('should retrieve cycle time history for a matter', async () => {
      // First, get a matter ID from the database
      const client = await pool.connect();
      try {
        const matterResult = await client.query(
          'SELECT id FROM ticketing_ticket LIMIT 1'
        );
        
        if (matterResult.rows.length === 0) {
          // Skip test if no matters exist
          return;
        }

        const matterId = matterResult.rows[0].id;
        const history = await matterRepo.getTicketingCycleTimeHistory(matterId);

        // History should be an array (may be empty if no status changes)
        expect(Array.isArray(history)).toBe(true);
      } finally {
        client.release();
      }
    });

    it('should return history entries with correct structure', async () => {
      // Get a matter that has cycle time history
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT DISTINCT ticket_id 
           FROM ticketing_cycle_time_histories 
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          // Skip test if no history exists
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const history = await matterRepo.getTicketingCycleTimeHistory(matterId);

        expect(history.length).toBeGreaterThan(0);
        
        const firstEntry = history[0];
        expect(firstEntry).toHaveProperty('id');
        expect(firstEntry).toHaveProperty('status_from');
        expect(firstEntry).toHaveProperty('status_to');
        expect(firstEntry).toHaveProperty('changed_at');
      } finally {
        client.release();
      }
    });

    it('should return entries in chronological order', async () => {
      const client = await pool.connect();
      try {
        // Find a matter with multiple history entries
        const historyResult = await client.query(
          `SELECT ticket_id, COUNT(*) as count
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) > 1
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          // Skip test if no multi-entry history exists
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const history = await matterRepo.getTicketingCycleTimeHistory(matterId);

        // Verify chronological order
        for (let i = 1; i < history.length; i++) {
          const prevDate = new Date(history[i - 1].changed_at);
          const currDate = new Date(history[i].changed_at);
          expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
        }
      } finally {
        client.release();
      }
    });

    it('should return empty array for matter with no history', async () => {
      const client = await pool.connect();
      try {
        // Find a matter without any cycle time history
        const matterResult = await client.query(
          `SELECT tt.id
           FROM ticketing_ticket tt
           LEFT JOIN ticketing_cycle_time_histories tcth ON tt.id = tcth.ticket_id
           WHERE tcth.id IS NULL
           LIMIT 1`
        );

        if (matterResult.rows.length === 0) {
          // Skip test if all matters have history
          return;
        }

        const matterId = matterResult.rows[0].id;
        const history = await matterRepo.getTicketingCycleTimeHistory(matterId);

        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBe(0);
      } finally {
        client.release();
      }
    });

    it('should match expected structure for all entries', async () => {
      const client = await pool.connect();
      try {
        // Get a matter with history
        const historyResult = await client.query(
          `SELECT DISTINCT ticket_id 
            FROM ticketing_cycle_time_histories 
            LIMIT 1`
        );
        
        if (historyResult.rows.length === 0) {
          // Skip test if no history exists
          return;
        } 

        const matterId = historyResult.rows[0].ticket_id;
        const history = await matterRepo.getTicketingCycleTimeHistory(matterId);
        
        // Verify all entries have correct structure
        history.forEach((entry) => {
          expect(entry).toHaveProperty('id');
          expect(entry).toHaveProperty('status_from');
          expect(entry).toHaveProperty('status_to');
          expect(entry).toHaveProperty('changed_at');
        });
      } finally {
        client.release();
      }
    });
  });
});
