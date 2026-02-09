import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import GeopoliticalGraph from './pages/GeopoliticalGraph'
import RepublicHealth from './pages/RepublicHealth'
import CommonSense from './pages/CommonSense'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<GeopoliticalGraph />} />
        <Route path="/republic-health" element={<RepublicHealth />} />
        <Route path="/common-sense" element={<CommonSense />} />
      </Routes>
    </Layout>
  )
}
