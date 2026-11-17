import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'

const Landing = lazy(() => import('./landing/Landing'))
const DemoPage = lazy(() => import('./demo/DemoPage'))
const Kit = lazy(() => import('./pages/Kit'))
const Share = lazy(() => import('./pages/Share'))

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="h-dvh bg-ink" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/kit" element={<Kit />} />
          <Route path="/share" element={<Share />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
