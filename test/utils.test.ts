import { describe, it, expect } from 'vitest'
import { formatTime } from '@/components/player/PlayerControls'

describe('formatTime', () => {
  it('formats exactly 0 milliseconds correctly', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('formats exactly 1 second correctly', () => {
    expect(formatTime(1000)).toBe('0:01')
  })

  it('formats under a minute correctly', () => {
    expect(formatTime(45500)).toBe('0:45')
  })

  it('formats exactly 1 minute correctly', () => {
    expect(formatTime(60000)).toBe('1:00')
  })

  it('formats over a minute correctly', () => {
    expect(formatTime(65000)).toBe('1:05')
  })

  it('formats multi-digit minutes correctly', () => {
    expect(formatTime(1800000)).toBe('30:00')
  })

  it('truncates partial milliseconds dynamically', () => {
    expect(formatTime(1234.56)).toBe('0:01')
  })
})
