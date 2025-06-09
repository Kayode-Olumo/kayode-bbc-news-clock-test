# BBC News Clock System - File Structure

## Core Files

### 1. `lib/caspar/client.ts` - The TCP Client Core

This is the heart of the system that handles all CasparCG communication.

```typescript
/**
 * Caspar CG Client Library
 *
 * This library provides the core functionality for interacting with the Caspar CG server.
 * It handles all communication with the Caspar CG server, including connection management,
 * command sending, and clock updates.
 */
```

#### Key Functions:

1. **Connection Management**

```typescript
export async function connectToCaspar(): Promise<ConnectionStatus> {
  // Handles TCP connection to CasparCG
  // Manages connection lifecycle
  // Handles errors and timeouts
}
```

2. **Command Handling**

```typescript
export async function sendCommand(command: string): Promise<boolean> {
  // Formats and sends AMCP commands to CasparCG
  // Handles command formatting with proper line endings
}
```

3. **Clock Updates**

```typescript
export async function updateClock(): Promise<ClockUpdateResult> {
  // Manages clock updates
  // Formats time string
  // Sends update command to CasparCG
}
```

4. **Auto-Update System**

```typescript
function scheduleNextUpdate(): void {
  // Handles automatic updates
  // Calculates next update time
  // Manages update scheduling
}
```

### 2. `app/page.tsx` - The Control Interface

This is the main user interface that provides control over the system.

```typescript
/**
 * BBC News Clock System - Main Page Component
 *
 * This is the main interface for the BBC News Clock System, which manages the synchronization
 * of time displays with Caspar CG server.
 */
```

#### Key Features:

1. **State Management**

```typescript
const [status, setStatus] = useState<string>("Initializing...");
const [currentTime, setCurrentTime] = useState<string>("");
const [isConnected, setIsConnected] = useState<boolean>(false);
const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(true);
```

2. **Connection Management**

```typescript
useEffect(() => {
  const initialize = async () => {
    // Handles initial connection
    // Sets up auto-updates
    // Manages connection state
  };
  initialize();
}, [autoUpdateEnabled]);
```

3. **User Controls**

```typescript
const updateClock = async () => {
  // Handles manual clock updates
  // Updates UI state
  // Manages error states
};
```

### 3. `app/template/page.tsx` - The CasparCG Template

This is the HTML template that CasparCG loads and displays.

#### Key Features:

1. **Template Interface**

```typescript
window.leftTab = (state: "on" | "off", text?: string) => {
  // Handles show/hide animations
  // Updates text content
  // Manages template state
};
```

2. **Animation Handling**

```typescript
if (state === "on") {
  lowerThirds.classList.add("visible");
} else if (state === "off") {
  lowerThirds.classList.remove("visible");
}
```

## Supporting Files

### 1. `lib/caspar/commands.ts`

- Handles command formatting
- Ensures proper line endings
- Manages AMCP protocol compliance

### 2. `lib/caspar/types.ts`

- Defines TypeScript interfaces
- Ensures type safety
- Documents data structures

### 3. `app/api/caspar/`

- API routes for server-side operations
- Handles TCP client communication
- Manages server-side state

## File Relationships and Data Flow

### 1. User Interaction Flow:

```
app/page.tsx (UI)
  → app/api/caspar/ (API Routes)
    → lib/caspar/client.ts (TCP Client)
      → CasparCG Server
```

### 2. Template Update Flow:

```
lib/caspar/client.ts (TCP Client)
  → CasparCG Server
    → app/template/page.tsx (Template)
      → Visual Update
```

### 3. State Management Flow:

```
app/page.tsx (UI State)
  → localStorage (Persistence)
  → lib/caspar/client.ts (Connection State)
  → app/template/page.tsx (Template State)
```

## Key Design Decisions

### 1. Separation of Concerns

- TCP client isolated in `lib/caspar/client.ts`
- UI logic in `app/page.tsx`
- Template system in `app/template/page.tsx`

### 2. Type Safety

- Comprehensive TypeScript interfaces
- Type checking throughout
- Clear type definitions

### 3. Error Handling

- Consistent error patterns
- User-friendly messages
- Graceful fallbacks

### 4. State Management

- React hooks for UI state
- Server-side state in TCP client
- Persistent settings in localStorage
