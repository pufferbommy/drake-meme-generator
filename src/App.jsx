import styles from './styles/App.module.css'
import { useEffect, useRef } from 'react'
import drakeMemeTemplate from './images/drake-meme-template.jpg'

function App() {
  const canvasRef = useRef()
  let canvasCtx
  let selectedTextIdx = -1
  const texts = [{ text: 'hello world!', x: 400, y: 200 }]
  const start = {
    x: 0,
    y: 0,
  }

  function drawTexts() {
    texts.forEach(({ text, x, y }) => {
      canvasCtx.font = '32px Verdana'
      canvasCtx.fillText(text, x, y)
    })
  }

  function drawAll() {
    const image = new Image()
    image.src = drakeMemeTemplate
    image.onload = function () {
      canvasCtx.drawImage(image, 0, 0)
      drawTexts(canvasCtx)
    }
  }

  function textHittest(start, i) {
    const text = texts[i]
    const {
      actualBoundingBoxLeft,
      actualBoundingBoxRight,
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
    } = canvasCtx.measureText(text)
    const textWidth = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight)
    const textHeight = Math.abs(actualBoundingBoxAscent) + Math.abs(actualBoundingBoxDescent)
    return (
      start.x >= text.x &&
      start.x <= text.x + textWidth &&
      start.y >= text.y - textHeight &&
      start.y <= text.y
    )
  }

  function handleMouseDown(e) {
    e.preventDefault()
    start.x = parseInt(e.clientX - canvasRef.current.offsetLeft)
    start.y = parseInt(e.clientY - canvasRef.current.offsetTop)
    for (let i = 0; i < texts.length; i++) {
      if (textHittest(start, i)) {
        selectedTextIdx = i
      }
    }
  }

  function handleMouseMove(e) {
    if (selectedTextIdx === -1) return
    e.preventDefault()
    const mouse = {
      x: parseInt(e.clientX - canvasRef.current.offsetLeft),
      y: parseInt(e.clientY - canvasRef.current.offsetTop),
    }
    const dx = mouse.x - start.x
    const dy = mouse.y - start.y
    start.x = mouse.x
    start.y = mouse.y

    const text = texts[selectedTextIdx]
    text.x += dx
    text.y += dy
    drawAll()
  }

  function handleMouseUp(e) {
    e.preventDefault()
    selectedTextIdx = -1
  }

  useEffect(function () {
    canvasCtx = canvasRef.current.getContext('2d')

    drawAll()

    canvasRef.current.addEventListener('mousedown', handleMouseDown)
    canvasRef.current.addEventListener('mousemove', handleMouseMove)
    canvasRef.current.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvasRef.current.removeEventListener('mousedown', handleMouseDown)
      canvasRef.current.removeEventListener('mousemove', handleMouseMove)
      canvasRef.current.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <div className={styles.App}>
      <canvas ref={canvasRef} width={750} height={750} />
    </div>
  )
}

export default App
