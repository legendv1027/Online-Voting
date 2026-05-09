import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TwoFactorVerify = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: state?.userId, token })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    if (!state?.userId) return <div className="text-white text-center mt-20">Invalid Security Session. Please return to login.</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="glass-panel p-10 rounded-2xl w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center mb-6 text-glow text-white">2FA Verification</h2>
                <p className="text-center text-sm text-gray-300 mb-6">Enter the 6-digit temporal code from your authenticator app.</p>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-black/40 border border-blue-500/30 rounded px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all font-mono"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 bg-blue-600/40 hover:bg-blue-500/60 border border-blue-400/50 text-white font-semibold py-3 px-4 rounded transition-all duration-300 box-glow disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Verify Identity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
