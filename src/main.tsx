import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App'
import './styles/index.css'
import { useDemo } from './store/demo'

// handle for scripted screenshots and the presenter console
;(window as unknown as { __demo: typeof useDemo }).__demo = useDemo

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
