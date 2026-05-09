import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AlertModal from '../components/AlertModal';
import { toast } from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'error' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // API call to backend will go here
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.requires2FA) {
                    navigate('/2fa-verify', { state: { userId: data.userId } });
                } else if (!data.isVoted || data.role === 'Admin') {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data));

                    if (data.message) {
                        toast.success(data.message, {
                            duration: 5000,
                            style: { background: '#0a192f', color: '#00f3ff', border: '1px solid #00f3ff' }
                        });
                    }

                    if (data.role === 'Admin') navigate('/admin');
                    else navigate('/dashboard');
                }
            } else {
                if (res.status === 403 && data.isVoted) {
                    setModal({
                        open: true,
                        title: "Access Denied!",
                        message: data.message,
                        type: 'lock'
                    });
                } else {
                    setError(data.message);
                }
            }
        } catch (err) {
            setError('Connection failed. Is backend running?');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <div className="glass-panel p-10 rounded-2xl w-full max-w-md animate-[float_8s_ease-in-out_infinite]">
                <h2 className="text-3xl font-bold text-center mb-6 text-glow text-white">Access Portal</h2>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Email Coordinates</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black/40 border border-blue-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Security Key</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-black/40 border border-blue-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="w-full mt-6 bg-blue-600/40 hover:bg-blue-500/60 border border-blue-400/50 text-white font-semibold py-3 px-4 rounded transition-all duration-300 box-glow flex justify-center items-center group">
                        Initialize Connection
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Unregistered entity? <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline">Request Access</Link>
                </p>
            </div>

            <AlertModal
                isOpen={modal.open}
                onClose={() => setModal({ ...modal, open: false })}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
};

export default Login;
