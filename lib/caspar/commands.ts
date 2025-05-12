/**
 * Format an AMCP command with proper line endings
 */
export function formatCommand(command: string): string {
    // Add carriage return and line feed as required by AMCP protocol
    return `${command}\r\n`
  }
  
  /**
   * Generate the command to add a template
   */
  export function addTemplateCommand(channel = 1, layer = 1, template = "main/MAIN"): string {
    return `CG ${channel} ADD ${layer} ${template} 1`
  }
  
  /**
   * Generate the command to update the clock
   */
  export function updateClockCommand(time: string, channel = 1, layer = 1): string {
    return `CG ${channel} INVOKE ${layer} "leftTab('on', 'BBC NEWS ${time}')"`
  }
  
  /**
   * Generate the command to show/hide the overlay
   */
  export function toggleOverlayCommand(visible: boolean, channel = 1, layer = 1): string {
    return `CG ${channel} INVOKE ${layer} "leftTab('${visible ? "on" : "off"}')"`
  }
  