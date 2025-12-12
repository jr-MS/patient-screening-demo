import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Screening } from './pages/Screening';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/screening" element={<Screening />} />
          <Route path="/" element={<Navigate to="/screening" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
