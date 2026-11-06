import { test, expect } from 'vitest'
import { youtubeInfo } from '../src/lib/youtube.js'

test('link chia sẻ có list/radio → chỉ lấy video, phát từ giây 0', () => {
  expect(youtubeInfo('https://www.youtube.com/watch?v=jNne1xPAHEY&list=RDjNne1xPAHEY&start_radio=1')).toEqual({
    id: 'jNne1xPAHEY',
    start: 0,
  })
})

test('youtu.be, m., music., shorts, embed, live', () => {
  expect(youtubeInfo('https://youtu.be/jNne1xPAHEY?si=abc123').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('https://m.youtube.com/watch?v=jNne1xPAHEY').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('https://music.youtube.com/watch?v=jNne1xPAHEY&feature=share').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('https://www.youtube.com/shorts/jNne1xPAHEY').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('https://www.youtube.com/embed/jNne1xPAHEY?start=5').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('https://www.youtube.com/live/jNne1xPAHEY').id).toBe('jNne1xPAHEY')
  expect(youtubeInfo('  youtube.com/watch?v=jNne1xPAHEY  ').id).toBe('jNne1xPAHEY')
})

test('mốc bắt đầu trong link: t=42, t=1m30s, start=15', () => {
  expect(youtubeInfo('https://youtu.be/jNne1xPAHEY?t=42').start).toBe(42)
  expect(youtubeInfo('https://www.youtube.com/watch?v=jNne1xPAHEY&t=1m30s').start).toBe(90)
  expect(youtubeInfo('https://www.youtube.com/watch?v=jNne1xPAHEY&t=1h2s').start).toBe(3602)
  expect(youtubeInfo('https://www.youtube.com/embed/jNne1xPAHEY?start=15').start).toBe(15)
  expect(youtubeInfo('https://www.youtube.com/watch?v=jNne1xPAHEY&t=abc').start).toBe(0)
})

test('không phải link video YouTube → null', () => {
  expect(youtubeInfo('')).toBeNull()
  expect(youtubeInfo(undefined)).toBeNull()
  expect(youtubeInfo('https://open.spotify.com/track/5w2XLlsTxumdmb6rhhSC3x')).toBeNull()
  expect(youtubeInfo('https://www.youtube.com/')).toBeNull()
  expect(youtubeInfo('https://www.youtube.com/watch?v=ngan')).toBeNull()
  expect(youtubeInfo('https://notyoutube.com/watch?v=jNne1xPAHEY')).toBeNull()
})
