import { config } from '../../../utils/config.js';
import { SLAStatus, CycleTime } from '../../types/types.js';
import MatterRepo from '../repo/matter_repo.js';
import { calculateDifference, formatDuration } from './time-utils.js';

/**
 * CycleTimeService - Calculate resolution times and SLA status for matters
 * 
 * TODO: Implement this service to:
 * 1. Calculate resolution time from "To Do" → "Done" status transitions - Done
 * 2. Determine SLA status based on resolution time vs threshold - Done
 * 3. Format durations in human-readable format (e.g., "2h 30m", "3d 5h") - Done
 * 
 * Requirements:
 * - Query ticketing_cycle_time_histories table - Done
 * - Join with status groups to identify "To Do", "In Progress", "Done" statuses - Done
 * - Calculate time between first transition and "Done" transition - Done
 * - For in-progress matters, calculate time from first transition to now - Done
 * - Compare against SLA_THRESHOLD_HOURS (default: 8 hours)
 * 
 * SLA Status Logic:
 * - "In Progress": Matter not yet in "Done" status - Done
 * - "Met": Resolved within threshold (≤ 8 hours) - Done
 * - "Breached": Resolved after threshold (> 8 hours) - Done
 * 
 * Consider:
 * - Performance for 10,000+ matters - TODO
 * - Caching strategies for high load - TODO
 * - Database query optimization - TODO
 */

enum StatusGroupEnum {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

enum SLAStatusEnum {
  IN_PROGRESS = 'In Progress',
  MET = 'Met',
  BREACHED = 'Breached',
}

export class CycleTimeService {
  private slaThreshHoldMs: number;
  private matterRepo: MatterRepo = new MatterRepo();

  constructor() {
    this.slaThreshHoldMs = config.SLA_THRESHOLD_HOURS * 60 * 60 * 1000;
  }

  /**
   * Calculate cycle time for a given ticket
   * @param ticketId - The ID of the ticket to calculate cycle time for
   * @returns The CycleTime object containing resolution time and timestamps
   */
  async calculateCycleTime(ticketId : string): Promise<CycleTime> {
      const cycleTimeHistories = await this.matterRepo.getTicketingCycleTimeHistory(ticketId);
      const firstRow = cycleTimeHistories[0];
      const lastRow = cycleTimeHistories[cycleTimeHistories.length - 1];

      if (!firstRow || firstRow.name !== StatusGroupEnum.TO_DO) {
        throw new Error(`Invalid cycle time history for ticket ${ticketId}: missing initial 'To Do' status`);
      }

      const resolutionTimeMs = await calculateDifference(firstRow.changed_at, lastRow.changed_at);

      if (!lastRow || lastRow.name !== StatusGroupEnum.DONE) {
        return {
          resolutionTimeMs: resolutionTimeMs,
          resolutionTimeFormatted: formatDuration(resolutionTimeMs, true),
          isInProgress: true,
          startedAt: new Date(firstRow.changed_at),
          completedAt: null,
        }
      }
          
      return {
        resolutionTimeMs: resolutionTimeMs,
        resolutionTimeFormatted: formatDuration(resolutionTimeMs, false),
        isInProgress: false,
        startedAt: new Date(firstRow.changed_at),
        completedAt: new Date(lastRow.changed_at),
      }
  }

  /**
   * Calculate SLA status based on resolution time and progress
   * @param resolutionTimeMs - The resolution time in milliseconds
   * @param isInProgress - Whether the ticket is still in progress
   * @returns The SLA status as 'In Progress', 'Met', or 'Breached'
   **
   */
  async calculateSLAStatus(resolutionTimeMs: number | null, isInProgress: boolean): Promise<SLAStatus> {
    if (isInProgress) {
      return SLAStatusEnum.IN_PROGRESS;
    }

    if (resolutionTimeMs === null) {
      return SLAStatusEnum.IN_PROGRESS;
    }

    if (resolutionTimeMs <= this.slaThreshHoldMs) {
      return SLAStatusEnum.MET;
    } 

    return SLAStatusEnum.BREACHED;
  }

  /**
   * Calculate both cycle time and SLA status for a given ticket
   * @param ticketId - The ID of the ticket to calculate for
   * @returns An object containing the cycle time and SLA status
   **/
  async calculateCycleTimeAndSLA(
    ticketId: string
  ): Promise<{ cycleTime: CycleTime; sla: SLAStatus }> {
    const cycleTime = await this.calculateCycleTime(ticketId);
    const sla = await this.calculateSLAStatus(cycleTime.resolutionTimeMs, cycleTime.isInProgress);
    return {
      cycleTime,
      sla
    };
  }
}

export default CycleTimeService;

