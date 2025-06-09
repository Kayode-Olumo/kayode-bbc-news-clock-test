export interface ConnectionStatus {
    connected: boolean
    message: string
  }
  
export interface ClockState {
    currentTime: string
    isConnected: boolean
    isVisible: boolean
    mode: "mock" | "real"
  }
  
export interface ClockUpdateResult {
    success: boolean
    time: string
  }
  
export interface ConnectionStatusDetails {
    isConnected: boolean
    lastCommand: string | null
    currentTime: string | null
    isVisible: boolean
    autoUpdateEnabled: boolean
    nextUpdateTime: string | null
    mode: "mock" | "real"
  }