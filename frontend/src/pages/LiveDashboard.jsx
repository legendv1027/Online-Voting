import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FiCpu, FiAward, FiActivity, FiCommand, FiBookOpen, FiShield, FiBox, FiMusic, FiGrid, FiZap, FiStar, FiTrendingUp, FiBook } from 'react-icons/fi';

const LiveDashboard = () => {
    const [elections] = useState([
        { id: 1, title: 'College Club' },
        { id: 2, title: 'IT Club' },
        { id: 3, title: 'Cultural Club' },
        { id: 4, title: 'Sports Club' },
        { id: 5, title: 'Science Club' },
        { id: 6, title: 'Management Club' },
        { id: 7, title: 'Robotics Club' },
        { id: 8, title: 'Literature Club' },
        { id: 9, title: 'Music Club' }
    ]);
    const [selectedElection, setSelectedElection] = useState(1);
    const [candidates, setCandidates] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [winner, setWinner] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/candidates/election/${selectedElection}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCandidates(data);
                    calculateWinner(data);
                }
            } catch (err) {
                console.error("Failed to fetch initial tallies:", err);
            }
        };

        fetchInitialData();

        const socket = io('http://localhost:5000');

        socket.on('voteUpdate', (update) => {
            if (update.electionId == selectedElection) {
                setCandidates(prev => {
                    const newData = prev.map(c =>
                        c._id === update.candidateId ? { ...c, votes: update.votes } : c
                    );
                    calculateWinner(newData);
                    return newData;
                });
            }
        });

        return () => socket.disconnect();
    }, [selectedElection]);

    const calculateWinner = (data) => {
        let total = 0;
        let maxVotes = -1;
        let currentWinner = null;

        data.forEach(c => {
            total += c.votes;
            if (c.votes > maxVotes) {
                maxVotes = c.votes;
                currentWinner = c;
            }
        });

        setTotalVotes(total);
        if (data.length > 0) {
            setWinner(currentWinner || data[0]);
        }
    };

    const getNeonLogo = (role, color = 'cyan') => {
        const club = role?.split(' - ')[0] || '';
        const iconSize = 64;
        const iconProps = { 
            size: iconSize, 
            className: `neon-logo-icon`,
            style: { color: '#bc13fe' } // Default purple for winner spotlight
        };

        if (club.includes('IT Club')) return <FiCpu {...iconProps} />;
        if (club.includes('Science Club')) return <FiZap {...iconProps} />;
        if (club.includes('Robotics Club')) return <FiCommand {...iconProps} />;
        if (club.includes('Cultural Club')) return <FiStar {...iconProps} />;
        if (club.includes('Sports Club')) return <FiAward {...iconProps} />;
        if (club.includes('Music Club')) return <FiMusic {...iconProps} />;
        if (club.includes('College Club')) return <FiShield {...iconProps} />;
        if (club.includes('Literature Club')) return <FiBookOpen {...iconProps} />;
        if (club.includes('Management Club')) return <FiGrid {...iconProps} />;
        
        return <FiZap {...iconProps} />;
    };

    const COLORS = ['#00f3ff', '#bc13fe', '#ff0055', '#39ff14', '#faff00', '#ff9900'];

    return (
        <div className="min-h-screen p-6 md:p-12 relative z-10 flex flex-col items-center">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-7xl">
                <div className="flex justify-between items-center mb-12 glass-panel p-6 rounded-xl border border-cyan-500/30 backdrop-blur-md">
                    <div>
                        <h1 className="text-4xl font-bold text-glow text-white tracking-[0.2em] uppercase">Live Results Terminal</h1>
                        <p className="text-sm text-cyan-400 font-mono mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            Neural Feed: Active & Encrypted
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-cyan-600/20 hover:bg-cyan-800/40 border border-cyan-400 text-cyan-100 font-bold py-2 px-6 rounded uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)]"
                    >
                        Back to Portal
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 mb-10 justify-center">
                    {elections.map(elec => (
                        <button
                            key={elec.id}
                            onClick={() => {
                                setSelectedElection(elec.id);
                            }}
                            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-500 border ${selectedElection === elec.id ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_#00ffff]' : 'bg-transparent text-gray-400 hover:text-cyan-300 border-white/10 hover:border-cyan-500/50'}`}
                        >
                            {elec.title}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Winner Spotlight */}
                    <div className="lg:col-span-1 glass-panel p-8 rounded-[40px] border border-purple-500/40 box-glow-purple relative overflow-hidden flex flex-col items-center bg-purple-950/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <h2 className="text-xl font-bold mb-8 text-purple-300 uppercase tracking-widest border-b border-purple-500/20 pb-2 w-full text-center">Current Leader</h2>

                        {winner ? (
                            <div className="flex flex-col items-center w-full">
                                <div className="relative mb-8">
                                    <div className="w-48 h-48 rounded-[32px] neon-logo-container border-2 border-purple-500 shadow-[0_0_40px_rgba(188,19,254,0.3)]">
                                        <div className="digital-noise"></div>
                                        <div className="hologram-ring" style={{ color: '#bc13fe' }}></div>
                                        <div className="hologram-ring-inner" style={{ color: '#bc13fe' }}></div>
                                        <div className="scan-line"></div>
                                        {getNeonLogo(winner.role)}
                                    </div>
                                    <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_#faff00] text-[10px] uppercase tracking-tighter animate-bounce z-10">
                                        Winning
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-1 text-center uppercase tracking-tight">{winner.name}</h3>
                                <p className="text-purple-400 text-xs uppercase tracking-[0.2em] mb-8 font-mono">{winner.role}</p>

                                <div className="grid grid-cols-2 gap-4 w-full bg-black/60 p-6 rounded-2xl border border-white/5">
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-mono">Tally</p>
                                        <p className="text-3xl font-black text-white font-mono">{winner.votes}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-mono">Share</p>
                                        <p className="text-3xl font-black text-cyan-400 font-mono">
                                            {totalVotes > 0 ? ((winner.votes / totalVotes) * 100).toFixed(0) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-500 font-mono text-center gap-4">
                                <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="text-sm">Awaiting initial tally signals...</p>
                            </div>
                        )}
                    </div>

                    {/* Graphical Results */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="glass-panel p-8 rounded-2xl border border-cyan-500/30 h-[450px] bg-cyan-950/10">
                            <h2 className="text-lg font-bold mb-6 text-cyan-300 uppercase tracking-widest flex justify-between items-center font-mono">
                                Distribution Ledger
                                <span className="text-[10px] bg-cyan-500/10 px-2 py-1 rounded text-cyan-500 border border-cyan-500/30">REAL-TIME SYNC</span>
                            </h2>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={candidates}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="name" stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={9} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#03030a', border: '1px solid #00f3ff', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,243,255,0.2)' }}
                                        itemStyle={{ color: '#00f3ff', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="votes" radius={[6, 6, 0, 0]} animationDuration={1000}>
                                        {candidates.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-panel p-6 rounded-2xl border border-white/5 h-[320px] bg-white/5">
                                <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest font-mono">Tally Share</h2>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie
                                            data={totalVotes > 0 ? candidates : candidates.map(c => ({ ...c, votes: 1 }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="votes"
                                            nameKey="name"
                                            animationDuration={1500}
                                        >
                                            {candidates.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#03030a', border: '1px solid #bc13fe', borderRadius: '12px' }}
                                            itemStyle={{ color: '#bc13fe' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl border border-white/5 flex flex-col justify-center bg-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-mono">Network Turnout</p>
                                <p className="text-8xl font-black text-white mb-6 font-mono tracking-tighter">{totalVotes}</p>
                                <div className="w-full bg-gray-800/50 h-4 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 shadow-[0_0_20px_#00f3ff] transition-all duration-1000"
                                        style={{ width: `${Math.min((totalVotes / 100) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-3">
                                    <p className="text-[9px] text-gray-600 font-mono italic">DATA VERIFIED BY NODES</p>
                                    <p className="text-[9px] text-cyan-400 font-mono font-bold">CAPACITY: 100%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveDashboard;
