let timeOutEvent = null
const LongpressEvent = CustomEvent || Event

const onTouchStartOrMouseDown = (event) => {
  timeOutEvent = setTimeout(function () {
    timeOutEvent = null
    event.target.dispatchEvent(new LongpressEvent('longpress', {
      view: window,
      bubbles: true,
      cancelable: true,
    }))
    // longpress触发拦截click事件
    const onClick = (event) => {
      event.stopPropagation()
      document.removeEventListener('click', onClick, { capture: true })
    }
    document.addEventListener('click', onClick, { capture: true })
  }, 400)
}
document.addEventListener('mousedown', onTouchStartOrMouseDown)

const onTouchMoveOrMouseMove = (_event) => {
  clearTimeout(timeOutEvent)
  timeOutEvent = null
}
document.addEventListener('mousemove', onTouchMoveOrMouseMove)

const onTouchEndOrMouseUp = (_event) => {
  clearTimeout(timeOutEvent)
  timeOutEvent = null
}
document.addEventListener('mouseup', onTouchEndOrMouseUp)