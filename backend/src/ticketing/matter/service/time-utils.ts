import { CycleTime } from "../../types/types.js";
import { TransitionInfo } from "../repo/matter_repo.js";
import { SLAStatusEnum, StatusGroupEnum } from "./cycle_time_service.js";
import { intervalToDuration } from 'date-fns';

/**
 * 
 * Conditionally format duration based on status group
 * Conditions:
 * - For 'To Do' with 0 duration and 'In Progress' with 0 duration, return '-'
 * - For 'Done' with 0 duration, return ''
 * - For other durations, format as 'Xd Yh Zm' (days, hours, minutes)
 * @param durationMs - The duration in milliseconds
 * @param statusGroup - The status group (e.g., 'To Do', 'In Progress', 'Done')
 * @returns Formatted duration string
 */

export function formatDuration(durationMs: number = 0, statusGroup: string): string {
    let timeString = '';

    // Return '-' for To Do or In Progress with 0 duration
    if ((statusGroup === StatusGroupEnum.TO_DO || statusGroup === StatusGroupEnum.IN_PROGRESS) && durationMs === 0) {
        return '-';
    }

    // Return empty string for Done with 0 duration
    if (statusGroup === StatusGroupEnum.DONE && durationMs === 0) {
        return '';
    }

    // Only add "In Progress:" prefix for IN_PROGRESS status (not TO_DO)
    if ((statusGroup === StatusGroupEnum.IN_PROGRESS || statusGroup === StatusGroupEnum.TO_DO) && durationMs > 0) {
      timeString += 'In Progress:';
    }

    // Use date-fns to calculate duration components
    const duration = intervalToDuration({ start: 0, end: durationMs });
    
    const years = duration.years || 0;
    const months = duration.months || 0;
    const days = duration.days || 0;
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;

    if (years > 0) {
      timeString += ` ${years}y`;
    }

    if (months > 0) {
      timeString += ` ${months}m`;
    }

    if (days > 0) {
      timeString += ` ${days}d`;
    }

    if (hours > 0) {
      timeString += ` ${hours}h`;
    }

    if (minutes > 0) {
      timeString += ` ${minutes}mins`;
    }

    return timeString.trim();
}

 /**
   * Calculate cycle time for a given ticket
   * @param ticketId - The ID of the ticket to calculate cycle time for
   * @returns The CycleTime object containing resolution time and timestamps
   */
  export function calculateCycleTime(transitionInfo: TransitionInfo): CycleTime {
    const firstRow = transitionInfo.transitions[0];
    const lastTransition = transitionInfo.transitions[transitionInfo.transitions.length - 1];
  
      if (!lastTransition || lastTransition.name !== StatusGroupEnum.DONE) {
        return {
          resolutionTimeMs: transitionInfo.totalDurationMs,
          resolutionTimeFormatted: formatDuration(transitionInfo.totalDurationMs, lastTransition.name),
          isInProgress: true,
          startedAt: firstRow.changed_at,
          completedAt: null,
        }
      }
          
      return {
        resolutionTimeMs: transitionInfo.totalDurationMs,
        resolutionTimeFormatted: formatDuration(transitionInfo.totalDurationMs, lastTransition.name),
        isInProgress: false,
        startedAt: firstRow.changed_at,
        completedAt: lastTransition.changed_at
      }
  }

  /**
   * Calculate SLA status based on resolution time and progress
   * @param resolutionTimeMs - The resolution time in milliseconds
   * @param isInProgress - Whether the ticket is still in progress
   * @returns The SLA status as 'In Progress', 'Met', or 'Breached'
   **
   */
  export function calculateSLAStatus(resolutionTimeMs: number = 0, slaThreshHoldMs: number, isInProgress: boolean = false): SLAStatusEnum {
    if (isInProgress && resolutionTimeMs <= slaThreshHoldMs) {
      return SLAStatusEnum.IN_PROGRESS;
    }
    if (resolutionTimeMs === null) {
      return SLAStatusEnum.IN_PROGRESS;
    }

    if (resolutionTimeMs <= slaThreshHoldMs) {
      return SLAStatusEnum.MET;
    }

    if (isInProgress) {
      return SLAStatusEnum.BREACHED;
    }

    return SLAStatusEnum.BREACHED;
  }