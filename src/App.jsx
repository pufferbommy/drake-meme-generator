import { useEffect, useRef } from 'react'
import drakeMemeTemplate from './images/drake-meme-template.jpg'
import Text from './classes/Text'
import { Button, Center, Input, Flex, Box } from '@chakra-ui/react'

function App() {
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
        x: width - width / 4,
        y: height / 4 + textHeight / 2,
      }
    } else if (texts.current.length === 1) {
      return {
        x: width - width / 4,
        y: height - height / 4 + textHeight / 2,
      }
    } else {
      return {
        x: width - width / 4,
        y: height / 2 + textHeight / 2,
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const text = e.target[0].value
    console.log(text)
    const { x, y } = getXYBasedOnArrayIndex(text)
    texts.current.push(new Text(text, x, y))
    e.target[0].value = ''
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
    const { textWidth, textHeight } = getRealTextWidthAndHeight(text.content)
    const hittedX = x >= text.x - textWidth / 2 && x <= text.x + textWidth / 2
    const hittedY = y >= text.y - textHeight && y <= text.y + textHeight / 2
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
    ctx.textAlign = 'start'
    const fontConfig = {
      size_px: 64,
      family: 'Noto Sans Thai',
    }
    ctx.textAlign = 'center'
    ctx.font = `${fontConfig.size_px}px ${fontConfig.family}`
    texts.current.forEach(({ content, x, y }) => {
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

  function handleClear() {
    texts.current = []
    drawAll()
  }

  useEffect(function () {
    drawAll()

    window.addEventListener('keydown', handleKeyDown)
    canvasRef.current.addEventListener('mousedown', handleMouseDown)
    canvasRef.current.addEventListener('mousemove', handleMouseMove)
    canvasRef.current.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      canvasRef.current.removeEventListener('mousedown', handleMouseDown)
      canvasRef.current.removeEventListener('mousemove', handleMouseMove)
      canvasRef.current.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <Center h="full">
      <Flex align="start" gap={4}>
        <Box shadow="xs" overflow="hidden" borderWidth={1} rounded="md">
          <canvas width={750} height={750} ref={canvasRef} />
        </Box>
        <img ref={imgRef} onLoad={drawAll} hidden src={drakeMemeTemplate} alt="" />
        <Box draggable shadow="xs" borderWidth={1} rounded="md" p={4}>
          <Flex as="form" gap={2} onSubmit={handleSubmit}>
            <Input size="lg" isRequired placeholder="any text" type="text" />
            <Button size="lg" colorScheme="blue" type="submit">
              Add
            </Button>
          </Flex>
          <Flex justify="start" gap={2} mt={4}>
            <Button onClick={handleClear} colorScheme="red">
              Clear
              <Box fontSize="sm" ml={2}>
                🖼️
              </Box>
            </Button>
            <Button onClick={handleSave} colorScheme="green">
              Save
              <Box fontSize="sm" ml={2}>
                💾
              </Box>
            </Button>
          </Flex>
        </Box>
      </Flex>
    </Center>
  )
}

export default App
