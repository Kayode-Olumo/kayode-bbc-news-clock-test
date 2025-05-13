/**
 * Connection status response
 */
export interface ConnectionStatus {
    connected: boolean
    message: string
  }
  
  /**
   * Current state of the clock
   */
  export interface ClockState {
    isConnected: boolean
    currentTime: string
    isVisible: boolean
  }
  
  /**
   * Clock update result
   */
  export interface ClockUpdateResult {
    success: boolean
    time: string
  }
  
  /**
   * Connection status details
   */
  export interface ConnectionStatusDetails {
    isConnected: boolean
    lastCommand: string | null
    currentTime: string | null
    isVisible: boolean
    nextUpdateTime: string | null
    autoUpdateEnabled: boolean
  }
  