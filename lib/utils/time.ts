/**
 * Format a date as HH:MM
 */
export function formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  }
  
  /**
   * Calculate milliseconds until the next minute
   */
  export function millisecondsUntilNextMinute(): number {
    const now = new Date()
    return (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
  }
  
  /**
   * Get the current time as HH:MM
   */
  export function getCurrentTime(): string {
    return formatTime(new Date())
  }
  