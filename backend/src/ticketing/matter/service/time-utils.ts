export function calculateDifference(startDate: string, endDate: string): number {
    const startTime = new Date(startDate).getTime();
    // Fallback to current time if endDate is not provided
    const endTime = endDate ? new Date(endDate).getTime() : new Date().getTime();

    return endTime - startTime;
}

export function formatDuration(durationMs: number = 0, isInProgress: boolean = false): string {
    let timeString = '';

    if (isInProgress) {
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