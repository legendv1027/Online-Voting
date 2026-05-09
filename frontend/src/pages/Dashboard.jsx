import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [elections, setElections] = useState([
        { id: 1, title: 'College Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 2, title: 'IT Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 3, title: 'Cultural Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 4, title: 'Sports Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 5, title: 'Science Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 6, title: 'Management Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 7, title: 'Robotics Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 8, title: 'Literature Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' },
        { id: 9, title: 'Music Club Election 2026', isActive: true, endTime: '2026-05-09 (5:00 PM)' }
    ]);
    const [expandedClubs, setExpandedClubs] = useState({ 1: true }); // Default first one open
    const [selectedElection, setSelectedElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);

        // Synchronize status with backend to ensure the Vote button locks immediately if already voted
        const syncProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const latestUser = await res.json();
                    
                    const updatedUser = { 
                        ...parsedUser, 
                        ...latestUser,
                        isVoted: latestUser.isVoted,
                        votedElections: latestUser.votedElections,
                        token 
                    };
                    
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // AUTOMATIC EXIT: Redirect to home page if fully voted (Non-Admin only)
                    if (updatedUser.isVoted && updatedUser.role !== 'Admin') {
                        setTimeout(() => {
                            localStorage.clear();
                            navigate('/');
                        }, 2000);
                    }
                }
            } catch (err) {
                console.error("Status Sync Failed:", err);
            }
        };

        syncProfile();

        const handleStorageUpdate = () => {
            const freshUser = localStorage.getItem('user');
            if (freshUser) {
                setUser(JSON.parse(freshUser));
            }
        };

        window.addEventListener('storage', handleStorageUpdate);
        return () => {
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, [navigate]);

    const handleVoteClick = (election) => {
        setSelectedElection(election);
        navigate(`/vote/${election.id}`);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleHardReset = async () => {
        if (window.confirm("ADMIN ACTION: Are you sure you want to wipe ALL standard registered users from the database?")) {
            try {
                const response = await fetch('http://localhost:5000/api/auth/dev/clear-db', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    localStorage.clear();
                    navigate('/');
                } else {
                    alert(data.message || "Reset failed.");
                }
            } catch (err) {
                console.error(err);
                alert("Critical Protocol Error: Connection refused.");
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center font-mono text-cyan-400">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="animate-pulse tracking-widest text-xs">SYNCHRONIZING SECURE TUNNEL...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 relative z-10">
            <div className="flex justify-between items-center mb-12 glass-panel p-4 rounded-xl">
                <div>
                    <h1 className="text-3xl font-bold text-glow text-white tracking-widest uppercase">Voting Dashboard</h1>
                    <p className="text-sm text-cyan-200">Terminal Access Granted: {user?.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                    {user?.role === 'Admin' && (
                        <>
                            <button
                                onClick={() => navigate('/live-results')}
                                className="bg-cyan-600/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider transition-all duration-300 box-glow-cyan"
                            >
                                View Live Results
                            </button>
                            <button
                                onClick={handleHardReset}
                                className="bg-yellow-600/30 hover:bg-yellow-500/50 border border-yellow-400/50 text-white font-bold py-2 px-4 rounded text-[10px] uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(250,255,0,0.2)]"
                            >
                                Admin: Reset Database
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-600/30 hover:bg-red-500/50 border border-red-400/50 text-white font-semibold py-2 px-6 rounded transition-all duration-300 pointer-events-auto shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                    >
                        Disconnect
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="glass-panel p-8 rounded-3xl border border-cyan-500/50 box-glow-cyan mb-8 relative overflow-hidden bg-black/40">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]"></div>
                        
                        <h2 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-2 text-glow-cyan">BMS COLLEGE ELECTIONS</h2>
                        <p className="text-[10px] text-cyan-400 font-mono tracking-[0.5em] mb-8 border-b border-cyan-500/20 pb-6 uppercase">Unified Committee Voting Portal</p>
                        
                        <div className="space-y-4">
                            {elections.filter(e => e.isActive).map((elec) => (
                                <div key={elec.id} className={`border rounded-2xl transition-all duration-500 ${expandedClubs[elec.id] ? 'border-cyan-500/40 bg-cyan-900/10 shadow-[0_0_20px_rgba(0,243,255,0.1)]' : 'border-white/5 bg-black/20 hover:border-white/20'}`}>
                                    <button 
                                        onClick={() => setExpandedClubs(prev => ({...prev, [elec.id]: !prev[elec.id]}))}
                                        className="w-full flex items-center justify-between p-5 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${expandedClubs[elec.id] ? 'bg-cyan-400 shadow-[0_0_10px_#00f3ff] animate-pulse' : 'bg-gray-600'}`}></div>
                                            <span className={`text-sm font-bold uppercase tracking-[0.2em] transition-all ${expandedClubs[elec.id] ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                {elec.title.replace(' Election 2026', '')}
                                            </span>
                                        </div>
                                        <span className={`text-xs transition-transform duration-500 ${expandedClubs[elec.id] ? 'rotate-180 text-cyan-400' : 'text-gray-600'}`}>▼</span>
                                    </button>

                                    {expandedClubs[elec.id] && (
                                        <div className="px-6 pb-6 animate-fadeIn">
                                            <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500/50 to-transparent mb-4"></div>
                                            <p className="text-[10px] text-gray-500 mb-6 font-mono tracking-widest uppercase flex items-center gap-2">
                                                <span className="w-1 h-1 bg-red-500 rounded-full animate-ping"></span>
                                                Status: Live Terminal • Closes: {elec.endTime}
                                            </p>
                                            
                                            {(() => {
                                                const now = new Date();
                                                const start = new Date('2026-05-09T09:00:00'); 
                                                const end = new Date('2026-05-09T17:00:00');
                                                const isWindowOpen = (now >= start && now <= end) || user?.role === 'Admin';
                                                
                                                // Count how many roles have been voted for in THIS specific election
                                                const votesInThisElec = Array.isArray(user?.votedElections) 
                                                    ? user.votedElections.filter(vKey => String(vKey).startsWith(`${elec.id}-`)).length 
                                                    : 0;
                                                
                                                // Lock only if all 3 roles (President, Secretary, Deputy) are voted for
                                                const isVoteAnchored = votesInThisElec >= 3 && user?.role !== 'Admin'; 

                                                if (!isWindowOpen) {
                                                    const message = now < start ? "Node Dormant: Opens 09:00 AM" : "Election Window Sealed";
                                                    return (
                                                        <button disabled className="w-full bg-gray-800/30 text-gray-600 border border-white/5 font-bold py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] cursor-not-allowed">
                                                            {message}
                                                        </button>
                                                    );
                                                }

                                                if (isVoteAnchored) {
                                                    return (
                                                        <div className="space-y-3">
                                                            <button disabled className="w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] cursor-not-allowed flex items-center justify-center gap-2">
                                                                Dossier Locked ✓ Vote Anchored
                                                            </button>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <button
                                                        onClick={() => handleVoteClick(elec)}
                                                        className="w-full bg-cyan-600/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.4em] transition-all duration-300 flex justify-between items-center px-8 box-glow-cyan group/btn"
                                                    >
                                                        Initiate Sequence
                                                        <span className="group-hover/btn:translate-x-2 transition-transform text-cyan-300">❯❯</span>
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mt-10 mb-6 text-gray-500 border-b border-gray-700 pb-2">Closed Elections</h2>
                    <div className="space-y-4 opacity-70">
                        {elections.filter(e => !e.isActive).map((elec) => (
                            <div key={elec.id} className="glass-panel p-6 rounded-xl border border-white/5 relative overflow-hidden grayscale">
                                <h3 className="text-lg font-bold text-gray-300 mb-1">{elec.title}</h3>
                                <p className="text-xs text-gray-500 mb-4 font-mono">Ended: {elec.endTime}</p>
                                <button disabled className="w-full bg-gray-800/50 text-gray-500 font-semibold py-2.5 px-4 rounded text-sm cursor-not-allowed border border-gray-700/50">
                                    ARCHIVED
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-xl h-fit border border-purple-500/20 box-glow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <h2 className="text-xl font-bold mb-6 text-purple-300 border-b border-purple-500/30 pb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        Voter Dossier
                    </h2>

                    <div className="space-y-4 text-sm font-mono text-gray-300 relative z-10">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-purple-200/70 uppercase text-xs tracking-widest mt-0.5">Full Name</span>
                            <span className="text-white text-right font-sans font-medium">{user?.fullName || 'Loading...'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-purple-200/70 uppercase text-xs tracking-widest mt-0.5">Clearance</span>
                            <span className="text-blue-400 border border-blue-400/30 bg-blue-900/20 px-2 py-0.5 rounded text-xs">{user?.role || 'STUDENT'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-purple-200/70 uppercase text-xs tracking-widest mt-0.5">Entity ID</span>
                            <span className="text-white font-bold">{user?.registrationNumber ? user.registrationNumber.slice(-2) : 'XX'}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span>Voting Status</span>
                            <div className="flex items-center gap-2">
                                {user?.isVoted || user?.isVoted === 'true' ? (
                                    <span className="text-cyan-400 font-bold drop-shadow-[0_0_5px_#00ffff]">VOTED</span>
                                ) : (
                                    <span className="text-yellow-400 font-bold animate-pulse uppercase">In Progress</span>
                                )}
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="p-1 hover:text-cyan-400 transition-colors text-[10px] border border-white/10 rounded bg-white/5"
                                    title="Refresh Status"
                                >
                                    SYNC
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between pt-1">
                            <span>Identity</span>
                            <span className="text-green-400 font-bold drop-shadow-[0_0_5px_#00ff00]">VERIFIED</span>
                        </div>
                        {user?.role === 'Admin' && (
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full py-2 bg-red-900/20 hover:bg-red-800/40 border border-red-500/30 text-red-400 text-[10px] uppercase tracking-[0.2em] font-bold rounded transition-all"
                                >
                                    Access Admin Console ❯❯
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
