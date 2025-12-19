import { StatusGroupEnum } from "./cycle_time_service.js";

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

    if (statusGroup === StatusGroupEnum.TO_DO && durationMs === 0 || statusGroup === StatusGroupEnum.IN_PROGRESS && durationMs === 0) {
        return '-';
    }

    if (statusGroup === StatusGroupEnum.TO_DO || statusGroup === StatusGroupEnum.IN_PROGRESS && durationMs > 0) {
      timeString += 'In Progress:';
    }

    const seconds = durationMs / 1000;
    const minutes = seconds / 60;
    const totalHours = Math.floor(minutes / 60);
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = Math.floor(minutes % 60);

    if (days > 0) {
      timeString += ` ${days}d`
    }

    if (remainingHours > 0) {
      timeString += ` ${remainingHours}h`
    }

    if (remainingMinutes > 0) {
      timeString += ` ${remainingMinutes}m`
    }

    return timeString.trim();
}