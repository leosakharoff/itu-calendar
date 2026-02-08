// Danish weekday abbreviations
const WEEKDAYS = ['S', 'M', 'T', 'O', 'T', 'F', 'L'] // Søndag, Mandag, Tirsdag, Onsdag, Torsdag, Fredag, Lørdag

// Danish month names
const MONTHS = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December'
]

export interface DayInfo {
  date: Date
  day: number
  weekday: string
  weekNumber: number
  isLastDayOfWeek: boolean
}

export interface MonthData {
  name: string
  year: number
  month: number // 0-indexed month number
  days: DayInfo[]
}

// Get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Generate month data
export function generateMonthData(year: number, month: number): MonthData {
  const days: DayInfo[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()

    days.push({
      date,
      day,
      weekday: WEEKDAYS[dayOfWeek],
      weekNumber: getWeekNumber(date),
      isLastDayOfWeek: dayOfWeek === 0 // Sunday is last day of week in ISO
    })
  }

  return {
    name: MONTHS[month],
    year,
    month,
    days
  }
}

// Generate calendar data for Jan-Jun 2026
export function generateCalendarData(): MonthData[] {
  return [0, 1, 2, 3, 4, 5].map(month => generateMonthData(2026, month))
}

// Format date as YYYY-MM-DD for database (using local timezone)
export function formatDateForDB(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Parse YYYY-MM-DD string to Date
export function parseDBDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}
