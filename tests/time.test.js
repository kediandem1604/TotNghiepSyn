import { test, expect } from 'vitest'
import {
  eventRange, eventPhase, countdown, monthGrid, weekdayVi,
  formatDateDots, formatWishTime, googleCalendarUrl, buildIcs,
  timeOfDay, longDateVi,
} from '../src/lib/time.js'

const ev = { date: '2026-11-26', start: '10:00', end: '12:00' }

test('giờ kèm buổi', () => {
  expect(timeOfDay('10:00')).toBe('10:00 sáng')
  expect(timeOfDay('12:30')).toBe('12:30 trưa')
  expect(timeOfDay('14:00')).toBe('14:00 chiều')
  expect(timeOfDay('19:00')).toBe('19:00 tối')
})

test('ngày dạng chữ', () => {
  expect(longDateVi(eventRange(ev).start)).toBe('Thứ Năm, 26/11/2026')
  expect(longDateVi(eventRange({ date: '2027-01-03', start: '08:00', end: '09:00' }).start)).toBe('Chủ Nhật, 03/01/2027')
})

test('khung giờ lễ theo +07', () => {
  const r = eventRange(ev)
  expect(r.start.toISOString()).toBe('2026-11-26T03:00:00.000Z')
  expect(r.end.toISOString()).toBe('2026-11-26T05:00:00.000Z')
})

test('trạng thái trước/đang/sau', () => {
  const r = eventRange(ev)
  expect(eventPhase(new Date('2026-11-26T02:59:59Z'), r)).toBe('before')
  expect(eventPhase(new Date('2026-11-26T03:00:00Z'), r)).toBe('during')
  expect(eventPhase(new Date('2026-11-26T05:00:00Z'), r)).toBe('after')
})

test('đếm ngược', () => {
  const r = eventRange(ev)
  expect(countdown(new Date('2026-11-06T02:58:30Z'), r.start)).toEqual({ days: 20, hours: 0, minutes: 1, seconds: 30 })
  expect(countdown(new Date('2026-12-01T00:00:00Z'), r.start)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
})

test('lịch tháng 11/2026 bắt đầu thứ Hai', () => {
  const g = monthGrid(2026, 11)
  expect(g[0]).toEqual([null, null, null, null, null, null, 1])
  expect(g[4][3]).toBe(26)
  expect(g.flat().filter(Boolean).length).toBe(30)
})

test('thứ và ngày theo giờ Việt Nam dù máy ở múi khác', () => {
  expect(weekdayVi(new Date('2026-11-26T03:00:00Z'))).toBe('Thứ Năm')
  expect(weekdayVi(new Date('2026-11-25T18:00:00Z'))).toBe('Thứ Năm')
  expect(formatDateDots(new Date('2026-11-25T18:00:00Z'))).toBe('26.11.2026')
  expect(formatWishTime('2026-11-05T23:30:00Z')).toBe('06-11 06:30')
})

test('link Google Calendar và .ics', () => {
  const r = eventRange(ev)
  const url = googleCalendarUrl({ title: 'Lễ tốt nghiệp', details: 'x', location: 'y', ...r })
  expect(url).toContain('dates=20261126T030000Z%2F20261126T050000Z')
  const ics = buildIcs({ title: 'Lễ tốt nghiệp', details: 'a, b', location: 'y', uid: 'u1', ...r })
  expect(ics).toContain('DTSTART:20261126T030000Z\r\n')
  expect(ics).toContain('DESCRIPTION:a\\, b\r\n')
  expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
})
