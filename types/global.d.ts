export {}

declare global {
  interface Window {
    leftTab: (state: "on" | "off", text?: string) => void
  }
}
