import { config } from '../../../utils/config.js';
import { SLAStatus, CycleTime } from '../../types/types.js';
import MatterRepo from '../repo/matter_repo.js';
import { calculateCycleTime, calculateSLAStatus } from './time-utils.js';

export enum StatusGroupEnum {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
}

export enum SLAStatusEnum {
  IN_PROGRESS = 'In Progress',
  MET = 'Met',
  BREACHED = 'Breached',
}


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

export class CycleTimeService {
  private slaThreshHoldMs: number;
  private matterRepo: MatterRepo = new MatterRepo();

  constructor() {
    this.slaThreshHoldMs = config.SLA_THRESHOLD_HOURS * 60 * 60 * 1000;
  }

  /**
   * Calculate both cycle time and SLA status for a given ticket
   * @param ticketId - The ID of the ticket to calculate for
   * @returns An object containing the cycle time and SLA status
   **/
  async calculateCycleTimeAndSLA(
    ticketId: string
  ): Promise<{ cycleTime: CycleTime; sla: SLAStatus }> {
    const transitionInfo = await this.matterRepo.getTransitionInfo(ticketId);
    const cycleTime = await calculateCycleTime(transitionInfo);
    const sla = await calculateSLAStatus(cycleTime.resolutionTimeMs ?? 0, this.slaThreshHoldMs, cycleTime.isInProgress);
      
    return {
      cycleTime,
      sla
    };
  }
}

export default CycleTimeService;

