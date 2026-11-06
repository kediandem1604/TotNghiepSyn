import { h, toast } from '../lib/dom.js'
import { spotifyInfo } from '../lib/spotify.js'
import { youtubeInfo } from '../lib/youtube.js'

const DISC = `<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">
  <circle cx="24" cy="24" r="23" fill="#13304f"/>
  <circle cx="24" cy="24" r="18" fill="none" stroke="#2a4a6e" stroke-width="1"/>
  <circle cx="24" cy="24" r="14" fill="none" stroke="#2a4a6e" stroke-width="1"/>
  <path d="M10 18a16 16 0 0 1 9-9" stroke="#5c7fa6" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="8.5" fill="#5fb6f2"/>
  <circle cx="24" cy="24" r="2.2" fill="#fff"/>
</svg>`

const NOOP = { start() {}, toggle() {}, el: null, slot: null, attach() {} }

/** Rời tab/app thì dừng nhạc; quay lại thì phát tiếp nếu trước đó đang phát. */
export function pauseWhenHidden(audio, doc = document) {
  let resume = false
  doc.addEventListener('visibilitychange', () => {
    if (doc.hidden) {
      resume = !audio.paused
      if (resume) audio.pause()
    } else if (resume) {
      resume = false
      audio.play()?.catch?.(() => {})
    }
  })
}

/** Nút tròn nổi góc dưới trái (đĩa than quay khi đang phát). */
function musicButton(label) {
  const btn = h(
    'button',
    { class: 'music is-off', attrs: { type: 'button', 'aria-label': `Bật ${label}`, 'aria-pressed': 'false' } },
    h('span', { class: 'music__disc', html: DISC }),
    h('span', { class: 'music__bars', attrs: { 'aria-hidden': 'true' } }, h('i'), h('i'), h('i')),
  )
  document.body.append(btn)
  const setState = (playing) => {
    btn.classList.toggle('is-off', !playing)
    btn.setAttribute('aria-pressed', String(playing))
    btn.setAttribute('aria-label', `${playing ? 'Tắt' : 'Bật'} ${label}`)
  }
  return { btn, setState }
}

/**
 * Nhạc nền. Thứ tự ưu tiên: file nhạc (music.src) → YouTube (music.youtube) → Spotify (music.spotify).
 * Không có gì → không hiện nút nhạc.
 */
export function createMusic(music, opts = {}) {
  if (music?.src) return createAudioMusic(music, opts)
  const yt = youtubeInfo(music?.youtube)
  if (yt) return createYouTubeMusic(yt, music)
  const info = spotifyInfo(music?.spotify)
  if (info) return createSpotifyMusic(info, music)
  return NOOP
}

function createAudioMusic(music, { reducedMotion = false }) {
  const audio = new Audio()
  audio.src = music.src
  audio.loop = true
  audio.preload = 'none'

  const { btn, setState } = musicButton(music.title ? `nhạc nền: ${music.title}` : 'nhạc nền')
  let fadeTimer

  audio.addEventListener('error', () => btn.remove())
  audio.addEventListener('play', () => setState(true))
  audio.addEventListener('pause', () => setState(false))

  function fadeIn() {
    clearInterval(fadeTimer)
    if (reducedMotion) {
      audio.volume = 0.6
      return
    }
    audio.volume = 0
    const startAt = performance.now()
    fadeTimer = setInterval(() => {
      const t = Math.min(1, (performance.now() - startAt) / 2000)
      audio.volume = 0.6 * t
      if (t >= 1) clearInterval(fadeTimer)
    }, 50)
  }

  async function start() {
    try {
      fadeIn()
      await audio.play()
    } catch {
      setState(false) // trình duyệt chặn tự phát: khách bấm nút nhạc để bật
    }
  }

  function toggle() {
    if (audio.paused) start()
    else audio.pause()
  }

  btn.addEventListener('click', toggle)
  pauseWhenHidden(audio)
  return { ...NOOP, start, toggle, el: btn }
}

/**
 * Nhạc từ YouTube: phát trọn bài từ đầu (hoặc từ mốc t= trong link), hết bài thì phát lại.
 * Trình phát được giấu trong một khung nhỏ ở góc; khách chỉ thấy nút đĩa nhạc.
 * Máy tính/Android: bật nhạc ngay khi khách bấm "Mở thiệp".
 * iPhone: YouTube không cho trang tự bật tiếng, nên khi nhạc chưa chạy được thì khung nhỏ
 * hiện lên để khách bấm ▶; nhạc chạy rồi thì khung tự ẩn.
 */
function createYouTubeMusic(info, music) {
  const { btn, setState } = musicButton(music.title ? `nhạc: ${music.title}` : 'nhạc nền')
  const slot = h('div', { class: 'yt-slot' }, h('div'))
  const close = h('button', { class: 'yt-dock__close', attrs: { type: 'button', 'aria-label': 'Ẩn trình phát' }, text: '×' })
  const dock = h('div', { class: 'yt-dock' },
    h('p', { class: 'yt-dock__hint', text: 'Bấm ▶ để nghe nhạc nhé 🎵' }),
    close,
    slot,
  )
  document.body.append(dock)
  // Không dùng display:none để trình phát vẫn chạy khi bị giấu.
  const showDock = (open) => {
    dock.classList.toggle('is-open', open)
    dock.inert = !open
  }
  showDock(false)
  close.addEventListener('click', () => showDock(false))

  let player = null
  let loaded = false
  let ready = false
  let playing = false
  let wantPlay = false
  let hintTimer

  function play() {
    if (ready) player.playVideo()
  }

  function onStateChange({ data }) {
    const S = window.YT.PlayerState
    if (data === S.PLAYING) {
      playing = true
      clearTimeout(hintTimer)
      showDock(false)
    } else if (data === S.PAUSED) {
      playing = false
    } else if (data === S.ENDED) {
      // Hết bài: quay lại đoạn mở đầu và phát tiếp.
      player.seekTo(info.start, true)
      player.playVideo()
      return
    } else {
      return
    }
    setState(playing)
  }

  function create() {
    player = new window.YT.Player(slot.firstChild, {
      videoId: info.id,
      width: '100%',
      height: '100%',
      playerVars: { start: info.start, playsinline: 1, rel: 0, iv_load_policy: 3, origin: window.location.origin },
      events: {
        onReady() {
          ready = true
          if (wantPlay) play()
        },
        onStateChange,
        onError: () => btn.remove(),
      },
    })
  }

  function load() {
    if (loaded) return
    loaded = true
    if (window.YT?.Player) return create()
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      create()
    }
    document.head.append(h('script', { src: 'https://www.youtube.com/iframe_api', async: true }))
  }

  // Nhạc không chạy được (thường gặp trên iPhone): hiện khung nhỏ để khách bấm ▶.
  function hintIfSilent(delay) {
    clearTimeout(hintTimer)
    hintTimer = setTimeout(() => {
      if (!playing && ready) showDock(true)
    }, delay)
  }

  function start() {
    wantPlay = true
    play()
    hintIfSilent(2500)
  }

  function toggle() {
    if (playing) return player?.pauseVideo()
    wantPlay = true
    play()
    hintIfSilent(1200)
  }

  pauseWhenHidden({
    get paused() {
      return !playing
    },
    pause: () => player?.pauseVideo(),
    play,
  })

  btn.addEventListener('click', toggle)
  load() // nạp sẵn để lúc khách bấm "Mở thiệp" là phát được ngay
  return { ...NOOP, start, toggle, el: btn }
}

/**
 * Nhạc từ Spotify: trình phát nhúng nằm ở phần đầu thiệp (attach),
 * nút nổi điều khiển qua Spotify iFrame API.
 * Lưu ý: người chưa đăng nhập Spotify chỉ nghe được 30 giây; iPhone thường
 * bắt bấm ▶ ngay trong trình phát.
 */
function createSpotifyMusic(info, music) {
  const { btn, setState } = musicButton(music.title ? `nhạc: ${music.title}` : 'nhạc nền')
  const slot = h('div', { class: 'spotify-slot' }, h('div'))
  let controller = null
  let loaded = false
  let started = false
  let playing = false
  let wantPlay = false
  let hintTimer
  let height = 152

  function play() {
    if (!controller) return
    started ? controller.resume() : controller.play()
    started = true
  }

  function load() {
    if (loaded) return
    loaded = true
    const prev = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (api) => {
      prev?.(api)
      api.createController(slot.firstChild, { uri: info.uri, width: '100%', height }, (c) => {
        controller = c
        c.addListener('playback_update', (e) => {
          playing = !e.data.isPaused
          setState(playing)
          if (playing) clearTimeout(hintTimer)
        })
        if (wantPlay) play()
      })
    }
    document.head.append(h('script', { src: 'https://open.spotify.com/embed/iframe-api/v1', async: true }))
  }

  // Bấm nút mà nhạc không chạy (thường gặp trên iPhone): đưa khách tới trình phát.
  function hintIfSilent() {
    clearTimeout(hintTimer)
    hintTimer = setTimeout(() => {
      if (playing) return
      slot.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast('Bấm ▶ trên trình phát Spotify để nghe nhạc nhé 🎵')
    }, 2500)
  }

  function start() {
    wantPlay = true
    play()
  }

  function toggle() {
    if (playing) return controller?.pause()
    wantPlay = true
    load()
    play()
    hintIfSilent()
  }

  let resume = false
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      resume = playing
      if (resume) controller?.pause()
    } else if (resume) {
      resume = false
      play()
    }
  })

  btn.addEventListener('click', toggle)
  return {
    start,
    toggle,
    el: btn,
    slot,
    attach(container, opts = {}) {
      if (opts.height) height = opts.height
      container.append(slot)
      load()
    },
  }
}
