/**
 * Phần tử có [data-reveal] hiện dần khi cuộn tới (một lần).
 * Gọi lại được nhiều lần cho phần tử mới thêm vào.
 */
let io

export function initReveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in)')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  io ||= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
  )
  els.forEach((el) => io.observe(el))
}
