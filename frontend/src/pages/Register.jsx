import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AlertModal from '../components/AlertModal';
import FaceMatcher from '../components/FaceMatcher';

const Register = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ fullName: '', registrationNumber: '', email: '', password: '', role: 'Voter', course: 'BCA' });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [faceDescriptor, setFaceDescriptor] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'error' });
    const otpRefs = useRef([]);
    const navigate = useNavigate();

    // Timer specific states
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [expiryTimer, setExpiryTimer] = useState(300); // 5 mins

    useEffect(() => {
        let interval;
        if (step === 2 && !isSuccess) {
            interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
                setExpiryTimer((prev) => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, isSuccess]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();

        // Basic Email validation before dispatch
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email format.');
            return;
        }

        // We'll keep the Reg Number check but make it slightly more flexible if needed, 
        // or just keep it as is if it matches the current policy.
        const regNumRegex = /^U18IN23S00\d{2}$/;
        if (!regNumRegex.test(formData.registrationNumber)) {
            setError('Invalid Registration Number format. Expected: U18IN23S00XX');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Sending ALL form data so backend can store unverified user
            const res = await fetch('http://localhost:5000/api/auth/request-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
                setResendTimer(60);
                setCanResend(false);
                setExpiryTimer(300);
                setOtp(['', '', '', '', '', '']);
            } else {
                if (res.status === 403) {
                    setModal({
                        open: true,
                        title: "User Already Exists!",
                        message: data.message,
                        type: 'lock'
                    });
                } else {
                    setError(data.message || "Identity verification failed to initialize.");
                }
            }
        } catch (err) {
            setError('Connection failed. Verify Node backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        if (!canResend) return;
        handleSendOtp();
    };

    const handleOtpChange = (index, value) => {
        const val = value.replace(/[^0-9]/g, '');
        if (val.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtpAndRegister = async (e) => {
        e.preventDefault();

        if (expiryTimer <= 0) {
            setError("OTP has expired. Please request a new one.");
            return;
        }

        const otpString = otp.join('');
        if (otpString.length < 6) {
            setError("Incomplete OTP signature.");
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpString })
            });
            const data = await res.json();

            if (res.ok) {
                setStep(3);
            } else {
                setError(data.message || "Invalid or expired OTP");
            }
        } catch (err) {
            setError('Connection failed. Verification could not complete.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleFinalRegister = async (descriptor) => {
        setFaceDescriptor(descriptor);
        setLoading(true);
        setError('');

        try {
            const otpString = otp.join('');
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: formData.email, 
                    otp: otpString, 
                    faceDescriptor: descriptor 
                })
            });
            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));

                window.dispatchEvent(new Event('storage'));
                navigate('/dashboard');
            } else {
                setError(data.message || "Registration failed.");
                if (data.message.includes("Duplicate")) {
                    setModal({
                        open: true,
                        title: "Duplicate Detected",
                        message: data.message,
                        type: 'error'
                    });
                    setStep(1); // Reset to start if duplicate
                } else if (data.message.toLowerCase().includes("otp")) {
                    setStep(2); // Back to OTP if OTP was wrong or expired
                } else {
                    // Stay on Step 3 for biometric errors
                    setLoading(false);
                }
            }
        } catch (err) {
            setError('Connection failed. Could not finalize registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-4 w-full relative z-10 px-4">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl w-full max-w-md border border-cyan-500/20 box-glow bg-cyan-950/20 backdrop-blur-md relative overflow-hidden">

                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <h2 className="text-2xl font-bold text-center mb-2 text-glow text-white tracking-wide">Identity Registration</h2>
                <div className="flex justify-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-cyan-400 shadow-[0_0_8px_#00ffff]' : 'bg-green-600'}`}></div>
                        <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-cyan-400' : 'bg-gray-700'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-cyan-400 shadow-[0_0_8px_#00ffff]' : step > 2 ? 'bg-green-600' : 'bg-gray-600'}`}></div>
                        <div className={`w-8 h-0.5 ${step === 3 ? 'bg-cyan-400' : 'bg-gray-700'}`}></div>
                        <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-cyan-400 shadow-[0_0_8px_#00ffff]' : 'bg-gray-600'}`}></div>
                    </div>
                </div>

                {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm font-mono text-center">{error}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-3 relative z-10 w-full" autoComplete="off">
                        <div>
                            <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                autoComplete="new-password"
                                className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Registration Number *</label>
                            <input
                                type="text"
                                required
                                autoComplete="new-password"
                                placeholder="U18IN23S00XX"
                                className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                                value={formData.registrationNumber}
                                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Comm Link (Email Address) *</label>
                            <input
                                type="email"
                                required
                                autoComplete="new-password"
                                placeholder="name@domain.edu"
                                className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Security Key (Password) *</label>
                            <input
                                type="password"
                                required
                                minLength="6"
                                autoComplete="new-password"
                                className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="border-t border-cyan-500/30 pt-3 mt-1 mb-1">
                            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-2">Institutional Identity</h3>

                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div>
                                    <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Role Classification</label>
                                    <select
                                        required
                                        className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans appearance-none"
                                        value={formData.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            setFormData({ ...formData, role: newRole, course: newRole === 'Admin' ? 'N/A' : 'BCA' });
                                        }}
                                    >
                                        <option value="Voter" className="bg-gray-900">Student (Voter)</option>
                                        <option value="Admin" className="bg-gray-900">Faculty (Admin)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-cyan-200 uppercase tracking-widest mb-1">Academic Program</label>
                                    <select
                                        required
                                        className="w-full bg-black/40 border border-cyan-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans appearance-none disabled:opacity-50"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                        disabled={formData.role === 'Admin'}
                                    >
                                        <option value="BCA" className="bg-gray-900">BCA</option>
                                        <option value="BCOM" className="bg-gray-900">BCOM</option>
                                        <option value="BBA" className="bg-gray-900">BBA</option>
                                        {formData.role === 'Admin' && <option value="N/A" className="bg-gray-900">N/A (Faculty)</option>}
                                    </select>
                                </div>
                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 bg-cyan-600/30 hover:bg-cyan-500/50 border border-cyan-400 text-white font-bold py-2.5 px-4 rounded transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.2)] flex justify-center items-center group uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {loading ? "Transmitting..." : "Verify Identity"}
                            {!loading && <span className="ml-2 group-hover:translate-x-1 transition-transform">❯</span>}
                        </button>
                    </form>
                ) : step === 2 ? (
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-6 relative z-10 flex flex-col items-center w-full">
                        <div className="w-16 h-16 rounded-full bg-cyan-900/50 border border-cyan-400 flex items-center justify-center mb-2 shadow-[0_0_20px_#00ffff40]">
                            <svg className="w-8 h-8 text-cyan-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <div className="text-center w-full">
                            <p className="text-sm text-cyan-100/70 mb-1">Enter the 6-digit OTP sent to your email</p>
                            <p className="text-cyan-300 font-sans font-bold tracking-wide">{formData.email}</p>
                            <p className={`mt-2 text-xs font-mono font-bold ${expiryTimer < 60 ? 'text-red-400' : 'text-purple-300'}`}>
                                Expires in: {formatTime(expiryTimer)}
                            </p>
                        </div>

                        <div className="flex gap-2 justify-center my-4 w-full px-2">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (otpRefs.current[idx] = el)}
                                    type="text"
                                    maxLength="1"
                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono bg-black/60 border border-cyan-500/50 text-white focus:border-cyan-300 focus:shadow-[0_0_10px_#00ffff40] rounded-lg outline-none transition-all"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying || expiryTimer <= 0}
                            className={`w-full bg-cyan-600/30 hover:bg-cyan-500/50 border border-cyan-400 text-white font-bold py-3 px-4 rounded transition-all duration-300 uppercase tracking-widest text-sm flex justify-center items-center ${(isVerifying || expiryTimer <= 0) ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_15px_rgba(0,255,255,0.2)]'}`}
                        >
                            {isVerifying ? 'Verifying Token...' : 'Verify & Continue to Face Scan'}
                        </button>

                        {!isVerifying && (
                            <div className="w-full flex justify-between px-2 mt-4 text-[11px] uppercase tracking-widest">
                                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-cyan-300 transition-colors">
                                    ← Modify Email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={!canResend || loading}
                                    className={`${canResend ? 'text-purple-400 hover:text-purple-300' : 'text-gray-600 cursor-not-allowed'} transition-colors`}
                                >
                                    {canResend ? 'Resend OTP' : `Resend OTP in ${resendTimer}s`}
                                </button>
                            </div>
                        )}
                    </form>
                ) : (
                    <div className="space-y-6 relative z-10 flex flex-col items-center w-full">
                        <div className="text-center w-full mb-2">
                            <h3 className="text-xl font-bold text-cyan-400 uppercase tracking-widest">Biometric Enrollment</h3>
                            <p className="text-xs text-cyan-100/70 mt-1">Establishing unique facial signature for duplicate prevention.</p>
                        </div>

                        <FaceMatcher mode="capture" onMatch={handleFinalRegister} />

                        {isSuccess && (
                            <div className="text-center w-full space-y-2 animate-in fade-in zoom-in duration-500">
                                <p className="text-green-400 font-bold uppercase tracking-widest text-sm">Identity Verified Successfully</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Redirecting to Voting Dashboard...</p>
                            </div>
                        )}
                    </div>
                )}

                {step === 1 && (
                    <p className="mt-5 text-center text-sm text-gray-400 relative z-10 w-full pt-3 border-t border-cyan-500/20">
                        Identity already established? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">Access Portal</Link>
                    </p>
                )}
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

export default Register;
