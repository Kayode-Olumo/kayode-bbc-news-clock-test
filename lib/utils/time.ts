export const formatTime = (date: Date): string => {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
}

export const millisecondsUntilNextMinute = (): number => {
    const now = new Date()
    return (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
}

export const getCurrentTime = (): string => {
    return formatTime(new Date())
}