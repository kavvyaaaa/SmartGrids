import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="features" element={<Features />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="security" element={<Features />} />
          <Route path="profile" element={<Dashboard />} />
          <Route path="contact" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
