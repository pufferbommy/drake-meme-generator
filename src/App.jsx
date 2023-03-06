import styles from './styles/App.module.css'
import { useEffect, useRef } from 'react'
import drakeMemeTemplate from './images/drake-meme-template.jpg'

function App() {
  const canvasRef = useRef()

  useEffect(function () {
    const canvasContext = canvasRef.current.getContext('2d')
    const image = new Image()
    image.src = drakeMemeTemplate
    image.onload = function () {
      canvasContext.drawImage(image, 0, 0)
    }
  }, [])

  return (
    <div className={styles.App}>
      <canvas ref={canvasRef} width={750} height={750} />
    </div>
  )
}

export default App
