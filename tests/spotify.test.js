import { test, expect } from 'vitest'
import { spotifyInfo } from '../src/lib/spotify.js'

test('link bài hát chia sẻ từ app (có ?si=…)', () => {
  expect(spotifyInfo('https://open.spotify.com/track/5w2XLlsTxumdmb6rhhSC3x?si=QNraNu0pToyUzbahqcrB2w&utm_source=copy-link')).toEqual({
    type: 'track',
    id: '5w2XLlsTxumdmb6rhhSC3x',
    uri: 'spotify:track:5w2XLlsTxumdmb6rhhSC3x',
    embedUrl: 'https://open.spotify.com/embed/track/5w2XLlsTxumdmb6rhhSC3x',
  })
})

test('link có intl-vi, album/playlist, dạng spotify:', () => {
  expect(spotifyInfo('https://open.spotify.com/intl-vi/track/abc123').uri).toBe('spotify:track:abc123')
  expect(spotifyInfo('https://open.spotify.com/playlist/37i9dQZF1DX').type).toBe('playlist')
  expect(spotifyInfo('spotify:album:XYZ9').embedUrl).toBe('https://open.spotify.com/embed/album/XYZ9')
})

test('không phải link Spotify → null', () => {
  expect(spotifyInfo('')).toBeNull()
  expect(spotifyInfo('https://www.youtube.com/watch?v=abc')).toBeNull()
  expect(spotifyInfo(undefined)).toBeNull()
})
