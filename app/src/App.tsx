import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import Landing from './pages/Landing'
import GeopoliticalGraph from './pages/GeopoliticalGraph'
import CommonSense from './pages/CommonSense'

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/graph" element={<GeopoliticalGraph />} />
          <Route path="/common-sense" element={<CommonSense />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  )
}
