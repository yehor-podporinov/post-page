window.addEventListener('resize', assignVhCssVariable)

window.addEventListener('beforeunload', function onBeforeUnload() {
  window.removeEventListener('resize', assignVhCssVariable)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

assignVhCssVariable()

function assignVhCssVariable() {
  const vh = (window.innerHeight * 0.01).toFixed(5)
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
