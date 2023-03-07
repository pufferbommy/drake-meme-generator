import styles from './styles/App.module.css'
import { useEffect, useRef, useState } from 'react'
import drakeMemeTemplate from './images/drake-meme-template.jpg'
import Text from './classes/Text'

function App() {
  const [showAddInput, setShowAddInput] = useState(false)

  const canvasRef = useRef()
  const imgRef = useRef()
  let texts = useRef([])

  let selectedTextIdx = -1

  const start = {
    x: 0,
    y: 0,
  }

  function getXYBasedOnArrayIndex(text) {
    const padding = 10
    const { width, height } = canvasRef.current
    const { textWidth, textHeight } = getRealTextWidthAndHeight(text)
    if (texts.current.length === 0) {
      return {
        x: width / 2 + width / 4 - (textWidth + padding * 2) / 2 - 40,
        y: height / 2 - height / 4 - (textHeight + padding * 2) / 2 + 40,
      }
    } else if (texts.current.length === 1) {
      return {
        x: width / 2 + width / 4 - (textWidth + padding * 2) / 2,
        y: height / 2 + height / 4 - (textHeight + padding * 2) / 2 + 40,
      }
    } else {
      return {
        x: width / 2 + width / 4 - (textWidth + padding * 2) / 2,
        y: height / 2 + textHeight / 2 - 20,
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const text = e.target[0].value
    const { x, y } = getXYBasedOnArrayIndex(text)
    texts.current.push(new Text(text, x, y))
    e.target[0].value = ''
    setShowAddInput(false)
    drawAll()
  }

  function getRealTextWidthAndHeight(text) {
    const ctx = getContext()
    const {
      actualBoundingBoxLeft,
      actualBoundingBoxRight,
      actualBoundingBoxAscent,
      actualBoundingBoxDescent,
    } = ctx.measureText(text)
    const textWidth = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight)
    const textHeight = Math.abs(actualBoundingBoxAscent) + Math.abs(actualBoundingBoxDescent)
    return {
      textWidth,
      textHeight,
    }
  }

  function textHittest(x, y, i) {
    const text = texts.current[i]
    const padding = 10
    const { textWidth, textHeight } = getRealTextWidthAndHeight(text.content)
    const hittedX = x >= text.x - padding && x <= text.x + textWidth + padding
    const hittedY = y >= text.y - textHeight - padding && y <= text.y + padding
    const hitted = hittedX && hittedY
    return hitted
  }

  function handleMouseDown(e) {
    e.preventDefault()
    start.x = parseInt(e.clientX - canvasRef.current.offsetLeft)
    start.y = parseInt(e.clientY - canvasRef.current.offsetTop)
    for (let i = 0; i < texts.current.length; i++) {
      if (textHittest(start.x, start.y, i)) {
        selectedTextIdx = i
        canvasRef.current.style.cursor = 'grabbing'
      }
    }
  }

  function handleMouseMove(e) {
    canvasRef.current.style.cursor = 'auto'
    const currentX = parseInt(e.clientX - canvasRef.current.offsetLeft)
    const currentY = parseInt(e.clientY - canvasRef.current.offsetTop)
    for (let i = 0; i < texts.current.length; i++) {
      if (textHittest(currentX, currentY, i)) canvasRef.current.style.cursor = 'grab'
    }
    if (selectedTextIdx === -1) return
    canvasRef.current.style.cursor = 'grabbing'
    e.preventDefault()
    const mouse = {
      x: parseInt(e.clientX - canvasRef.current.offsetLeft),
      y: parseInt(e.clientY - canvasRef.current.offsetTop),
    }
    const dx = mouse.x - start.x
    const dy = mouse.y - start.y
    start.x = mouse.x
    start.y = mouse.y
    texts.current[selectedTextIdx].x += dx
    texts.current[selectedTextIdx].y += dy
    drawAll()
  }

  function handleMouseUp(e) {
    e.preventDefault()
    canvasRef.current.style.cursor = 'auto'
    const currentX = parseInt(e.clientX - canvasRef.current.offsetLeft)
    const currentY = parseInt(e.clientY - canvasRef.current.offsetTop)
    for (let i = 0; i < texts.current.length; i++) {
      if (textHittest(currentX, currentY, i)) canvasRef.current.style.cursor = 'grab'
    }
    selectedTextIdx = -1
    drawAll()
  }

  function getContext() {
    return canvasRef.current.getContext('2d')
  }

  function drawBackgroundImage() {
    const ctx = getContext()
    ctx.drawImage(imgRef.current, 0, 0)
  }

  function drawTexts() {
    const ctx = getContext()
    const fontConfig = {
      size_px: 64,
      family: 'Noto Sans Thai',
    }
    texts.current.forEach(({ content, x, y }) => {
      ctx.font = `${fontConfig.size_px}px ${fontConfig.family}`
      ctx.fillText(content, x, y)
    })
  }

  function drawAll() {
    drawBackgroundImage()
    drawTexts()
  }

  function handleSave() {
    const link = document.createElement('a')
    link.download = 'dmg.jpg'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  function handleKeyDown(e) {
    if (selectedTextIdx !== -1 && e.code === 'Backspace' && confirm('Do you want to delete it?')) {
      texts.current = texts.current.filter((text, index) => index !== selectedTextIdx)
      selectedTextIdx = -1
      drawAll()
    }
  }

  useEffect(function () {
    drawAll()

    window.addEventListener('keydown', handleKeyDown)
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
      <canvas width={750} height={750} ref={canvasRef} />
      <div className={styles.Add}>
        <button onClick={() => setShowAddInput((prev) => !prev)}>
          <svg width="32" fill="white" height="32" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        </button>
        <button onClick={handleSave}>Save</button>
        <form className={showAddInput ? styles.hide : styles.show} onSubmit={handleSubmit}>
          <input type="text" />
        </form>
      </div>
      <img ref={imgRef} onLoad={drawAll} hidden src={drakeMemeTemplate} alt="" />
    </div>
  )
}

export default App
