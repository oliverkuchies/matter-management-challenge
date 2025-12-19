import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../../db/pool.js';
import { CycleTimeService } from './cycle_time_service.js';

describe('CycleTimeService Integration Tests', () => {
  let cycleTimeService: CycleTimeService;

  beforeAll(async () => {
    cycleTimeService = new CycleTimeService();
    
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

  describe('calculateCycleTime', () => {
    it('should handle matter in "To Do" status with single history entry', async () => {
      const client = await pool.connect();
      try {
        // Find a matter with only 1 history entry (just created, in To Do)
        const historyResult = await client.query(
          `SELECT ticket_id, COUNT(*) as count
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) = 1
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime).toBeDefined();
        expect(cycleTime.startedAt).toBeInstanceOf(Date);
        expect(cycleTime.completedAt).toBeNull();
        expect(cycleTime.resolutionTimeMs).toBeGreaterThanOrEqual(0);
        expect(cycleTime.resolutionTimeFormatted).toContain('-');
      } finally {
        client.release();
      }
    });

    it('should handle matter in "In Progress" status with 2 history entries', async () => {
      const client = await pool.connect();
      try {
        // Find a matter with 2 history entries (To Do -> In Progress)
        const historyResult = await client.query(
          `SELECT ticket_id, COUNT(*) as count
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) = 2
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime).toBeDefined();
        expect(cycleTime.startedAt).toBeInstanceOf(Date);
        expect(cycleTime.completedAt).toBeNull();
        expect(cycleTime.resolutionTimeMs).toBeGreaterThan(0);
        expect(cycleTime.resolutionTimeFormatted).toContain('In Progress');
      } finally {
        client.release();
      }
    });

    it('should calculate cycle time for completed matter (Done status)', async () => {
      const client = await pool.connect();
      try {
        // Find a matter marked as done.
        const historyResult = await client.query(
          `SELECT ticket_id, COUNT(*) as count
           FROM ticketing_cycle_time_histories
           LEFT JOIN ticketing_field_status_options tfso ON ticketing_cycle_time_histories.to_status_id = tfso.id
           LEFT JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
           WHERE tfsg.name = 'Done'
           GROUP BY ticket_id
           LIMIT 1
        `
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;

        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime).toBeDefined();
        expect(cycleTime.resolutionTimeMs).toBeGreaterThan(0);
        expect(cycleTime.startedAt).toBeInstanceOf(Date);
        expect(cycleTime.completedAt).toBeInstanceOf(Date);
        expect(cycleTime.completedAt!.getTime()).toBeGreaterThan(
          cycleTime.startedAt!.getTime()
        );
        // Done matters should NOT have "In Progress" prefix
        expect(cycleTime.resolutionTimeFormatted).not.toContain('In Progress');
      } finally {
        client.release();
      }
    });

    it('should format duration correctly for completed matters', async () => {
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT ticket_id
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) = 3
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime.resolutionTimeFormatted).toBeDefined();
        expect(typeof cycleTime.resolutionTimeFormatted).toBe('string');
        expect(cycleTime.resolutionTimeFormatted).not.toBe('N/A');
        // Should contain time units (h for hours, m for minutes, d for days)
        expect(/\d+[hmd]/.test(cycleTime.resolutionTimeFormatted)).toBe(true);
      } finally {
        client.release();
      }
    });

    it('should calculate resolution time accurately from first to last transition', async () => {
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT ticket_id
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) >= 2
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        
        // Get the actual first and last transition times from DB
        const transitions = await client.query(
          `SELECT transitioned_at
           FROM ticketing_cycle_time_histories
           WHERE ticket_id = $1
           ORDER BY transitioned_at ASC`,
          [matterId]
        );

        const firstTime = new Date(transitions.rows[0].transitioned_at);
        const lastTime = new Date(transitions.rows[transitions.rows.length - 1].transitioned_at);
        const expectedDiffMs = lastTime.getTime() - firstTime.getTime();
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);
        expect(cycleTime.resolutionTimeMs).toBe(expectedDiffMs);
      } finally {
        client.release();
      }
    });

    it('should handle matters with short resolution times (under 1 hour)', async () => {
      const client = await pool.connect();
      try {
        // Find a matter that was resolved quickly (seeded data has some 0.5-4.5 hour resolutions)
        // Epoch extracts the time difference in seconds for easy comparison
        // This retrieves the difference between max and min transitioned_at for matters with 3 transitions
        // where the difference is under 3600 seconds (1 hour)
        
        const historyResult = await client.query(
          `SELECT tcth.ticket_id,
                  MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at) as duration
           FROM ticketing_cycle_time_histories tcth
           GROUP BY tcth.ticket_id
           HAVING COUNT(*) = 3
           AND EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) < 3600
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime.resolutionTimeMs).toBeGreaterThan(0);
        expect(cycleTime.resolutionTimeMs).toBeLessThan(3600000); // Less than 1 hour in ms
        // Should show minutes
        expect(cycleTime.resolutionTimeFormatted).toMatch(/\d+m/);
      } finally {
        client.release();
      }
    });

    it('should handle matters with long resolution times (multiple hours)', async () => {
      const client = await pool.connect();
      try {
        // Find a matter with longer resolution time (8+ hours)
        // Extract epoch basically converts the timestamp into seconds for easy comparison,
        // This retrieves the difference between max and min transitioned_at for matters with 3 transitions
        // where the difference is over 28800 seconds (8 hours)
        const historyResult = await client.query(
          `SELECT tcth.ticket_id,
                  MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at) as duration
           FROM ticketing_cycle_time_histories tcth
           GROUP BY tcth.ticket_id
           HAVING COUNT(*) = 3
           AND EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) > 28800
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime.resolutionTimeMs).toBeGreaterThan(28800000); // More than 8 hours in ms
      } finally {
        client.release();
      }
    });

    it('should return all required properties with correct types', async () => {
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT ticket_id FROM ticketing_cycle_time_histories LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const cycleTime = await cycleTimeService.calculateCycleTime(matterId);

        expect(cycleTime).toHaveProperty('resolutionTimeMs');
        expect(cycleTime).toHaveProperty('resolutionTimeFormatted');
        expect(cycleTime).toHaveProperty('isInProgress');
        expect(cycleTime).toHaveProperty('startedAt');
        expect(cycleTime).toHaveProperty('completedAt');

        expect(typeof cycleTime.resolutionTimeMs === 'number').toBe(true);
        expect(typeof cycleTime.resolutionTimeFormatted).toBe('string');
        expect(typeof cycleTime.isInProgress).toBe('boolean');
      } finally {
        client.release();
      }
    });

    it('should throw error for matter with no cycle time history', async () => {
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

        await expect(
          cycleTimeService.calculateCycleTime(matterId)
        ).rejects.toThrow(`Invalid cycle time history for ticket ${matterId}: missing initial 'To Do' status`);
      } finally {
        client.release();
      }
    });

    it('should return In Progress when last task is To Do but has multiple transitions', async () => {
      const client = await pool.connect();
      let testMatterId: string | null = null;
      
      try {
        // Create a test matter with history ending in To Do
        const ticketResult = await client.query(
          `INSERT INTO ticketing_ticket (board_id) 
           SELECT id FROM ticketing_board LIMIT 1 
           RETURNING id`
        );
        testMatterId = ticketResult.rows[0].id;

        const statusFieldResult = await client.query(
          `SELECT id FROM ticketing_fields WHERE field_type = 'status' LIMIT 1`
        );

        const statusOptionsResult = await client.query(
          `SELECT tfso.id, tfsg.name
           FROM ticketing_field_status_options tfso
           JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
           LIMIT 3`
        );

        const toDoStatus = statusOptionsResult.rows.find((s) => s.name === 'To Do');
        const inProgressStatus = statusOptionsResult.rows.find((s) => s.name === 'In Progress');
        const doneStatus = statusOptionsResult.rows.find((s) => s.name === 'Done');

        if (!toDoStatus || !inProgressStatus || !doneStatus) {
          return;
        }

        // Insert history: To Do -> In Progress -> Done -> To Do
        await client.query(
          `INSERT INTO ticketing_cycle_time_histories 
           (ticket_id, status_field_id, from_status_id, to_status_id, transitioned_at)
           VALUES
           ($1, $2, NULL, $3, NOW() - INTERVAL '3 hours'),
           ($1, $2, $3, $4, NOW() - INTERVAL '2 hours'),
           ($1, $2, $4, $5, NOW() - INTERVAL '1 hour'),
           ($1, $2, $5, $3, NOW())`,
          [
            testMatterId,
            statusFieldResult.rows[0].id,
            toDoStatus.id,
            inProgressStatus.id,
            doneStatus.id,
          ]
        );

        const cycleTime = await cycleTimeService.calculateCycleTime(testMatterId!);

        expect(cycleTime).toBeDefined();
        expect(cycleTime.resolutionTimeMs).toBeGreaterThan(0);
        expect(cycleTime.isInProgress).toBe(true);
        expect(cycleTime.resolutionTimeFormatted).toContain('In Progress');
      } finally {
        // Cleanup - ensure records are deleted even if test fails
        if (testMatterId) {
          await client.query(
            `DELETE FROM ticketing_cycle_time_histories WHERE ticket_id = $1`,
            [testMatterId]
          );
          await client.query(
            `DELETE FROM ticketing_ticket WHERE id = $1`,
            [testMatterId]
          );
        }
        client.release();
      }
    });

    it('should throw error for matter not starting with "To Do" status', async () => {
      const client = await pool.connect();
      let testMatterId: string | null = null;
      
      try {
        // Create a test matter with invalid history (not starting with To Do)
        const ticketResult = await client.query(
          `INSERT INTO ticketing_ticket (board_id) 
           SELECT id FROM ticketing_board LIMIT 1 
           RETURNING id`
        );
        testMatterId = ticketResult.rows[0].id;

        // Get a non-"To Do" status
        const statusResult = await client.query(
          `SELECT tfso.id, tfsg.name
           FROM ticketing_field_status_options tfso
           JOIN ticketing_field_status_groups tfsg ON tfso.group_id = tfsg.id
           WHERE tfsg.name != 'To Do'
           LIMIT 1`
        );

        if (statusResult.rows.length === 0) {
          return;
        }

        const statusId = statusResult.rows[0].id;
        const statusFieldResult = await client.query(
          `SELECT id FROM ticketing_fields WHERE field_type = 'status' LIMIT 1`
        );

        // Insert history starting with wrong status
        await client.query(
          `INSERT INTO ticketing_cycle_time_histories 
           (ticket_id, status_field_id, from_status_id, to_status_id, transitioned_at)
           VALUES ($1, $2, NULL, $3, NOW())`,
          [testMatterId, statusFieldResult.rows[0].id, statusId]
        );

        await expect(
          cycleTimeService.calculateCycleTime(testMatterId!)
        ).rejects.toThrow(`Invalid cycle time history for ticket ${testMatterId}: missing initial 'To Do' status`);
      } finally {
        // Cleanup - ensure records are deleted even if test fails
        if (testMatterId) {
          await client.query(
            `DELETE FROM ticketing_cycle_time_histories WHERE ticket_id = $1`,
            [testMatterId]
          );
          await client.query(
            `DELETE FROM ticketing_ticket WHERE id = $1`,
            [testMatterId]
          );
        }
        client.release();
      }
    });
  });

  /**
   * SLA Status Calculation Tests
   * 
   * Scenarios:
   * - Matter still in progress (no resolution time)
   * - Matter resolved within SLA threshold (≤ 8 hours)
   * - Matter resolved beyond SLA threshold (> 8 hours)
   */
  describe('calculateSLAStatus', () => {
    it('should return "In Progress" for matters still in progress - 1h 23m', async () => {
      const slaStatus = await cycleTimeService.calculateSLAStatus(5000000, true);
      expect(slaStatus).toBe('In Progress');
    });

    it('should return "In Progress" for matters with null resolution time - 0h 0m', async () => {
      // @ts-expect-error Testing null resolution time
      const slaStatus = await cycleTimeService.calculateSLAStatus(null, false);
      expect(slaStatus).toBe('In Progress');
    });

    it('should return "Met" for matters resolved within SLA threshold - 2h 0m', async () => {
      const slaStatus = await cycleTimeService.calculateSLAStatus(2 * 60 * 60 * 1000, false); // 2 hours
      expect(slaStatus).toBe('Met');
    });

    it('should return "Breached" for matters resolved beyond SLA threshold - 10h 0m', async () => {
      const slaStatus = await cycleTimeService.calculateSLAStatus(10 * 60 * 60 * 1000, false); // 10 hours
      expect(slaStatus).toBe('Breached');
    });

    it('should return "Breached" when matters > SLA threshold - 8h 1m & are also in progress', async () => {
      const slaStatus = await cycleTimeService.calculateSLAStatus(8 * 60 * 60 * 1000 + 60000, true); // 8 hours 1 minute
      expect(slaStatus).toBe('Breached');
    });

  });

  /**
   * Combined Cycle Time and SLA Calculation Tests
   * 
   * Tests the full workflow: fetching history, calculating cycle time, and determining SLA status
   */
  describe('calculateCycleTimeAndSLA', () => {
    it('should return cycle time and SLA for a completed matter (Met)', async () => {
      const client = await pool.connect();
      try {
        // Find a completed matter with short resolution time (under 8 hours)
        const historyResult = await client.query(
          `SELECT tcth.ticket_id,
                  MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at) as duration
           FROM ticketing_cycle_time_histories tcth
           GROUP BY tcth.ticket_id
           HAVING COUNT(*) = 3
           AND EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) < 28800
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        expect(result).toHaveProperty('cycleTime');
        expect(result).toHaveProperty('sla');
        expect(result.sla).toBe('Met');
        expect(result.cycleTime.completedAt).toBeInstanceOf(Date);
        expect(result.cycleTime.resolutionTimeMs).toBeLessThan(8 * 60 * 60 * 1000);
      } finally {
        client.release();
      }
    });

    it('should return cycle time and SLA for a completed matter (Breached)', async () => {
      const client = await pool.connect();
      try {
        // Find a completed matter with long resolution time (over 8 hours)
        const historyResult = await client.query(
          `SELECT tcth.ticket_id,
                  MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at) as duration
           FROM ticketing_cycle_time_histories tcth
           GROUP BY tcth.ticket_id
           HAVING COUNT(*) = 3
           AND EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) > 28800
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        expect(result).toHaveProperty('cycleTime');
        expect(result).toHaveProperty('sla');
        expect(result.sla).toBe('Breached');
        expect(result.cycleTime.completedAt).toBeInstanceOf(Date);
        expect(result.cycleTime.resolutionTimeMs).toBeGreaterThan(8 * 60 * 60 * 1000);
      } finally {
        client.release();
      }
    });

    it('should return cycle time and SLA for a matter in progress', async () => {
      const client = await pool.connect();
      try {
        // Find a matter that's in progress (1 or 2 history entries)
        const historyResult = await client.query(
          `SELECT ticket_id
           FROM ticketing_cycle_time_histories
           GROUP BY ticket_id
           HAVING COUNT(*) < 3
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        expect(result).toHaveProperty('cycleTime');
        expect(result).toHaveProperty('sla');
        expect(result.sla).toBe('In Progress');
        expect(result.cycleTime.completedAt).toBeNull();
        expect(result.cycleTime.resolutionTimeMs).toBeGreaterThanOrEqual(0);
      } finally {
        client.release();
      }
    });

    it('should return consistent cycle time properties', async () => {
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT ticket_id FROM ticketing_cycle_time_histories LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        // Verify cycle time structure
        expect(result.cycleTime).toHaveProperty('resolutionTimeMs');
        expect(result.cycleTime).toHaveProperty('resolutionTimeFormatted');
        expect(result.cycleTime).toHaveProperty('isInProgress');
        expect(result.cycleTime).toHaveProperty('startedAt');
        expect(result.cycleTime).toHaveProperty('completedAt');

        // Verify SLA is one of the valid values
        expect(['In Progress', 'Met', 'Breached']).toContain(result.sla);
      } finally {
        client.release();
      }
    });

    it('should calculate SLA correctly at exactly 8 hour threshold', async () => {
      const client = await pool.connect();
      try {
        // Find a matter resolved at approximately 8 hours
        const historyResult = await client.query(
          `SELECT tcth.ticket_id,
                  EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) as duration_seconds
           FROM ticketing_cycle_time_histories tcth
           GROUP BY tcth.ticket_id
           HAVING COUNT(*) = 3
           AND EXTRACT(EPOCH FROM (MAX(tcth.transitioned_at) - MIN(tcth.transitioned_at))) BETWEEN 28700 AND 28900
           LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        expect(result.sla).toBe('Met'); // 8 hours or less = Met
        expect(result.cycleTime.resolutionTimeMs).toBeLessThanOrEqual(8 * 60 * 60 * 1000);
      } finally {
        client.release();
      }
    });

    it('should have formatted duration matching SLA status', async () => {
      const client = await pool.connect();
      try {
        const historyResult = await client.query(
          `SELECT ticket_id FROM ticketing_cycle_time_histories 
           GROUP BY ticket_id HAVING COUNT(*) = 3 LIMIT 1`
        );

        if (historyResult.rows.length === 0) {
          return;
        }

        const matterId = historyResult.rows[0].ticket_id;
        const result = await cycleTimeService.calculateCycleTimeAndSLA(matterId);

        // Completed matters should have formatted time without "In Progress"
        if (result.sla === 'Met' || result.sla === 'Breached') {
          expect(result.cycleTime.resolutionTimeFormatted).not.toContain('In Progress');
          expect(result.cycleTime.completedAt).not.toBeNull();
        }

        // In progress matters should have "In Progress" in formatted time
        if (result.sla === 'In Progress') {
          expect(result.cycleTime.resolutionTimeFormatted).toContain('In Progress');
          expect(result.cycleTime.completedAt).toBeNull();
        }
      } finally {
        client.release();
      }
    });
  });
});
