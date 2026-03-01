import { describe, it, expect } from 'vitest'
import {
  getLocalizedNames,
  generateMonthData,
  generateCalendarData,
  formatDateForDB,
  parseDBDate,
} from './dates'

describe('getLocalizedNames', () => {
  it('returns Danish names by default', () => {
    const names = getLocalizedNames('da')
    expect(names.months[0]).toBe('Januar')
    expect(names.months[11]).toBe('December')
    expect(names.monthsShort[0]).toBe('Jan')
    expect(names.weekdays).toEqual(['S', 'M', 'T', 'O', 'T', 'F', 'L'])
  })

  it('returns English names', () => {
    const names = getLocalizedNames('en')
    expect(names.months[0]).toBe('January')
    expect(names.months[4]).toBe('May')
    expect(names.monthsShort[9]).toBe('Oct')
    expect(names.weekdays).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'])
  })
})

describe('generateMonthData', () => {
  it('generates correct number of days for January 2026', () => {
    const data = generateMonthData(2026, 0) // January
    expect(data.days).toHaveLength(31)
    expect(data.name).toBe('Januar')
    expect(data.year).toBe(2026)
    expect(data.month).toBe(0)
  })

  it('generates correct number of days for February 2026 (non-leap)', () => {
    const data = generateMonthData(2026, 1)
    expect(data.days).toHaveLength(28)
  })

  it('generates correct number of days for February 2024 (leap year)', () => {
    const data = generateMonthData(2024, 1)
    expect(data.days).toHaveLength(29)
  })

  it('uses English names when language is en', () => {
    const data = generateMonthData(2026, 0, 'en')
    expect(data.name).toBe('January')
  })

  it('marks Monday as first day of week with monday start', () => {
    const data = generateMonthData(2026, 0, 'da', 'monday')
    // Jan 5 2026 is a Monday
    const jan5 = data.days.find(d => d.day === 5)!
    expect(jan5.isFirstDayOfWeek).toBe(true)
    expect(jan5.isLastDayOfWeek).toBe(false)
  })

  it('marks Sunday as last day of week with monday start', () => {
    const data = generateMonthData(2026, 0, 'da', 'monday')
    // Jan 4 2026 is a Sunday
    const jan4 = data.days.find(d => d.day === 4)!
    expect(jan4.isLastDayOfWeek).toBe(true)
    expect(jan4.isFirstDayOfWeek).toBe(false)
  })

  it('marks Sunday as first day of week with sunday start', () => {
    const data = generateMonthData(2026, 0, 'da', 'sunday')
    // Jan 4 2026 is a Sunday
    const jan4 = data.days.find(d => d.day === 4)!
    expect(jan4.isFirstDayOfWeek).toBe(true)
  })

  it('includes week numbers', () => {
    const data = generateMonthData(2026, 0)
    expect(data.days[0].weekNumber).toBeGreaterThan(0)
  })

  it('assigns correct weekday abbreviations', () => {
    const data = generateMonthData(2026, 0, 'da')
    // Jan 1 2026 is a Thursday
    expect(data.days[0].weekday).toBe('T') // Torsdag
  })
})

describe('generateCalendarData', () => {
  it('generates correct number of months', () => {
    const data = generateCalendarData('2026-01', '2026-06')
    expect(data).toHaveLength(6)
    expect(data[0].name).toBe('Januar')
    expect(data[5].name).toBe('Juni')
  })

  it('handles single month range', () => {
    const data = generateCalendarData('2026-03', '2026-03')
    expect(data).toHaveLength(1)
    expect(data[0].name).toBe('Marts')
  })

  it('handles year boundaries', () => {
    const data = generateCalendarData('2025-11', '2026-02')
    expect(data).toHaveLength(4)
    expect(data[0].name).toBe('November')
    expect(data[0].year).toBe(2025)
    expect(data[3].name).toBe('Februar')
    expect(data[3].year).toBe(2026)
  })

  it('uses English names when specified', () => {
    const data = generateCalendarData('2026-01', '2026-01', 'en')
    expect(data[0].name).toBe('January')
  })
})

describe('formatDateForDB', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2026, 0, 15) // Jan 15 2026
    expect(formatDateForDB(date)).toBe('2026-01-15')
  })

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 2, 5) // Mar 5 2026
    expect(formatDateForDB(date)).toBe('2026-03-05')
  })

  it('handles December correctly', () => {
    const date = new Date(2025, 11, 31) // Dec 31 2025
    expect(formatDateForDB(date)).toBe('2025-12-31')
  })
})

describe('parseDBDate', () => {
  it('parses YYYY-MM-DD string to Date', () => {
    const date = parseDBDate('2026-01-15')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(0) // January
    expect(date.getDate()).toBe(15)
  })

  it('roundtrips with formatDateForDB', () => {
    const original = new Date(2026, 5, 20)
    const formatted = formatDateForDB(original)
    const parsed = parseDBDate(formatted)
    expect(parsed.getFullYear()).toBe(original.getFullYear())
    expect(parsed.getMonth()).toBe(original.getMonth())
    expect(parsed.getDate()).toBe(original.getDate())
  })
})
