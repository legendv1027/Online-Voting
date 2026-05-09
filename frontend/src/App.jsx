import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Login from './pages/Login';
import Register from './pages/Register';
import TwoFactorVerify from './pages/TwoFactorVerify';
import Dashboard from './pages/Dashboard';
import VoteCasting from './pages/VoteCasting';
import AdminPanel from './pages/AdminPanel';
import LiveDashboard from './pages/LiveDashboard';
import { Toaster } from 'react-hot-toast';
import './index.css';

const Landing = () => (
  <div className="flex flex-col items-center justify-center min-h-screen w-full">
    <div className="glass-panel p-10 rounded-2xl animate-float max-w-lg w-full text-center mx-auto">
      <h1 className="text-5xl font-bold text-glow mb-4 text-white">VOTEX</h1>
      <p className="text-gray-300 mb-8 font-light">Next-Generation Blockchain Online Voting System</p>

      <div className="flex flex-col gap-4">
        <Link to="/register" className="inline-block bg-purple-600/40 hover:bg-purple-500/60 border border-purple-400/50 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-[0_0_15px_#bc13fe,inset_0_0_10px_#bc13fe] w-full">
          1. Establish Identity (Register)
        </Link>
        <Link to="/login" className="inline-block bg-blue-600/30 hover:bg-blue-500/50 border border-blue-400/50 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 box-glow w-full">
          2. Access Portal (Login)
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const verifyAccess = async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        try {
          const res = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          const data = await res.json();

          if (res.ok) {
            setAuthorized(true);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            setAuthorized(false);
          }
        } catch (err) {
          setAuthorized(false);
        } finally {
          setLoading(false);
        }
      };

      verifyAccess();
    }, [token]);

    if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-cyan-400">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="animate-pulse tracking-widest text-xs">VERIFYING ACCESS PERMISSIONS...</p>
          </div>
        </div>
      );
    }

    if (!authorized) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Router>
      <ThreeBackground />
      <div className="relative z-10 antialiased font-sans text-white">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/2fa-verify" element={<TwoFactorVerify />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/vote/:id" element={
            <ProtectedRoute>
              <VoteCasting />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/live-results" element={
            <ProtectedRoute>
              <LiveDashboard />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#0a192f', color: '#fff', border: '1px solid #00f3ff' } }} />
      </div>
    </Router>
  );
}

export default App;
