// Danish weekday abbreviations (Sunday-first indexed)
const WEEKDAYS_DA = ['S', 'M', 'T', 'O', 'T', 'F', 'L'] // Søndag, Mandag, Tirsdag, Onsdag, Torsdag, Fredag, Lørdag

// English weekday abbreviations (Sunday-first indexed)
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Danish month names
const MONTHS_DA = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December'
]

// English month names
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Abbreviated month names
const MONTHS_SHORT_DA = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type Language = 'da' | 'en'
export type WeekStart = 'monday' | 'sunday'

export function getLocalizedNames(language: Language) {
  return {
    months: language === 'en' ? MONTHS_EN : MONTHS_DA,
    monthsShort: language === 'en' ? MONTHS_SHORT_EN : MONTHS_SHORT_DA,
    weekdays: language === 'en' ? WEEKDAYS_EN : WEEKDAYS_DA,
  }
}

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
export function generateMonthData(
  year: number,
  month: number,
  language: Language = 'da',
  weekStart: WeekStart = 'monday'
): MonthData {
  const days: DayInfo[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const { weekdays, months } = getLocalizedNames(language)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()

    // For monday-start: last day of week is Sunday (0)
    // For sunday-start: last day of week is Saturday (6)
    const isLastDayOfWeek = weekStart === 'monday'
      ? dayOfWeek === 0
      : dayOfWeek === 6

    days.push({
      date,
      day,
      weekday: weekdays[dayOfWeek],
      weekNumber: getWeekNumber(date),
      isLastDayOfWeek
    })
  }

  return {
    name: months[month],
    year,
    month,
    days
  }
}

// Generate calendar data for a given range
export function generateCalendarData(
  start: string = '2026-01',
  end: string = '2026-06',
  language: Language = 'da',
  weekStart: WeekStart = 'monday'
): MonthData[] {
  const [startYear, startMonth] = start.split('-').map(Number)
  const [endYear, endMonth] = end.split('-').map(Number)

  const months: MonthData[] = []
  let year = startYear
  let month = startMonth - 1 // Convert to 0-indexed

  while (year < endYear || (year === endYear && month <= endMonth - 1)) {
    months.push(generateMonthData(year, month, language, weekStart))
    month++
    if (month > 11) {
      month = 0
      year++
    }
  }

  return months
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
