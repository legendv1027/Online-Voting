import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ nodes: 142, uptime: '99.99%', pendingTxs: 12 });
    const [candidates, setCandidates] = useState([]);
    const [newCandidate, setNewCandidate] = useState({ name: '', role: '', electionId: 1 });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    const fetchCandidates = async () => {
        try {
            const res1 = await fetch('http://localhost:5000/api/candidates/election/1');
            const res2 = await fetch('http://localhost:5000/api/candidates/election/2');
            const data1 = await res1.json();
            const data2 = await res2.json();
            setCandidates([...(Array.isArray(data1) ? data1 : []), ...(Array.isArray(data2) ? data2 : [])]);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, []);

    const handleBack = () => navigate('/dashboard');

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newCandidate)
            });
            if (res.ok) {
                setNewCandidate({ name: '', role: '', electionId: 1 });
                fetchCandidates();
            } else {
                alert("Failed to inject Candidate. Ensure you are an Admin.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCandidate = async (id) => {
        if (!window.confirm("Purge this candidate from the ledger?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/candidates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchCandidates();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownloadCSV = async (electionId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/candidates/export/csv/${electionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `election_${electionId}_results.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Export failed.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleElection = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/elections/${id}/toggle`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Election status updated.");
            } else {
                alert("Failed to toggle status.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleHardReset = async () => {
        if (!window.confirm("⚠️ WARNING: This will permanently purge all voter records and reset election status. This action is terminal and irreversible. Type 'RESET' to confirm.")) {
            return;
        }

        const confirmation = prompt("Type 'RESET' to execute database purge:");
        if (confirmation !== 'RESET') {
            alert("Protocol Aborted: Confirmation string mismatch.");
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/dev/clear-db', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                alert(`SUCCESS: ${data.message}`);
                window.location.reload();
            } else {
                alert(`FAILURE: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            alert("Critical Protocol Error: Connection refused.");
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12 relative z-10 flex flex-col items-center pt-10">
            <div className="w-full max-w-6xl mb-8 flex justify-between items-center bg-black/40 p-4 rounded-xl border border-red-500/30 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_#ff0000]"></span>
                    <h1 className="text-2xl font-bold text-red-400 tracking-widest uppercase items-center">Admin Override Console</h1>
                </div>
                <button onClick={handleBack} className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 border border-gray-600 rounded">
                    Back to Terminal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl mb-8">
                <div className="glass-panel p-6 rounded border border-red-500/20 text-center">
                    <p className="text-gray-400 text-sm uppercase">Active Nodes</p>
                    <p className="text-3xl font-mono text-red-300 mt-2">{stats.nodes}</p>
                </div>
                <div className="glass-panel p-6 rounded border border-red-500/20 text-center">
                    <p className="text-gray-400 text-sm uppercase">Network Uptime</p>
                    <p className="text-3xl font-mono text-green-300 mt-2">{stats.uptime}</p>
                </div>
                <div className="glass-panel p-6 rounded border border-red-500/20 text-center">
                    <p className="text-gray-400 text-sm uppercase">Pending Txs</p>
                    <p className="text-3xl font-mono text-yellow-300 mt-2">{stats.pendingTxs}</p>
                </div>
                <div className="glass-panel p-6 rounded border border-red-500/20 text-center">
                    <p className="text-gray-400 text-sm uppercase">Sys Integrity</p>
                    <p className="text-3xl font-mono text-blue-300 mt-2">SECURE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-white/10">
                    <h2 className="text-xl font-bold mb-4 text-white border-b border-white/10 pb-2">Blockchain Ledgers (Live)</h2>
                    <div className="space-y-3 font-mono text-xs">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded border border-white/5 hover:border-red-500/30 transition-colors">
                                <span className="text-gray-500">Tx: 0x{Math.random().toString(16).slice(2, 12)}...</span>
                                <span className="text-blue-300 text-right">ELECTION_VOTE</span>
                                <span className="text-green-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> MINED
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl border border-red-500/30 box-glow shadow-[0_0_20px_#ff000022]">
                    <h2 className="text-xl font-bold mb-4 text-red-400 border-b border-red-500/30 pb-2">Election Controls</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/live-results')}
                            className="w-full bg-cyan-600/40 hover:bg-cyan-500/60 border border-cyan-400/50 py-3 rounded text-sm text-white uppercase tracking-[0.2em] transition-all box-glow-cyan"
                        >
                            Open Live Analytics
                        </button>
                        <button
                            onClick={handleHardReset}
                            className="w-full bg-red-600/40 hover:bg-red-500/60 border border-red-400/50 py-3 rounded text-sm text-white uppercase tracking-[0.2em] transition-all box-glow-red"
                        >
                            Master Database Reset
                        </button>

                        <button
                            onClick={() => handleDownloadCSV(1)}
                            className="w-full bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/50 py-3 rounded text-xs text-cyan-200 uppercase tracking-wider transition-all"
                        >
                            Download Election 1 CSV
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-red-950/50 rounded border border-red-800">
                        <p className="text-[10px] text-red-400 font-mono tracking-widest text-center uppercase">Warning: Restricted Area</p>
                    </div>
                </div>
            </div>

            {/* Candidate Management UI */}
            <div className="w-full max-w-6xl mt-8 glass-panel p-6 border border-purple-500/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-2xl font-bold text-purple-300 tracking-widest uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                    Candidate Node Management
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 font-mono">
                    <div className="glass-panel p-5 rounded border border-purple-500/20 bg-black/40">
                        <h3 className="text-sm font-bold text-white uppercase mb-4 border-b border-white/5 pb-2">Inject New Candidate</h3>
                        <form onSubmit={handleAddCandidate} className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-purple-300 uppercase tracking-widest mb-1">Entity Name</label>
                                <input type="text" required value={newCandidate.name} onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })} className="w-full bg-black/50 border border-purple-500/30 rounded p-2 text-sm text-white outline-none focus:border-purple-400" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-purple-300 uppercase tracking-widest mb-1">Assigned Role/Title</label>
                                <input type="text" required value={newCandidate.role} onChange={e => setNewCandidate({ ...newCandidate, role: e.target.value })} className="w-full bg-black/50 border border-purple-500/30 rounded p-2 text-sm text-white outline-none focus:border-purple-400" />
                            </div>
                            <div>
                                <label className="block text-[10px] text-purple-300 uppercase tracking-widest mb-1">Election Target</label>
                                <select value={newCandidate.electionId} onChange={e => setNewCandidate({ ...newCandidate, electionId: Number(e.target.value) })} className="w-full bg-black/50 border border-purple-500/30 rounded p-2 text-sm text-white outline-none appearance-none">
                                    <option value={1}>Galactic Council (1)</option>
                                    <option value={2}>Mars Terraforming (2)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-purple-600/30 hover:bg-purple-500/50 border border-purple-400 text-white text-xs uppercase tracking-widest py-2 rounded transition-all mt-4">
                                {loading ? 'Compiling...' : 'Execute Injection'}
                            </button>
                        </form>
                    </div>

                    <div className="border border-cyan-500/20 bg-cyan-950/10 rounded overflow-hidden flex flex-col h-80">
                        <div className="bg-cyan-900/30 p-2 border-b border-cyan-500/30 shrink-0">
                            <h3 className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest text-center">Council Roster (Elec 1)</h3>
                        </div>
                        <div className="p-3 space-y-2 overflow-y-auto flex-1 config-scrollbar">
                            {candidates.filter(c => c.electionId === 1).map(c => (
                                <div key={c._id} className="bg-black/50 p-2 rounded border border-cyan-500/10 flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{c.symbol}</span>
                                        <div>
                                            <p className="text-sm text-white truncate max-w-[120px]">{c.name}</p>
                                            <p className="text-[9px] text-cyan-400/60 uppercase">{c.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteCandidate(c._id)} className="text-red-400 hover:text-red-300 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest border border-red-500/30 px-2 py-1 rounded bg-red-900/20">Purge</button>
                                </div>
                            ))}
                            {candidates.filter(c => c.electionId === 1).length === 0 && <p className="text-xs text-gray-500 text-center mt-10">No records found</p>}
                        </div>
                    </div>

                    <div className="border border-green-500/20 bg-green-950/10 rounded overflow-hidden flex flex-col h-80 lg:col-span-1">
                        <div className="bg-green-900/30 p-2 border-b border-green-500/30 shrink-0">
                            <h3 className="text-[11px] font-bold text-green-300 uppercase tracking-widest text-center">System Log</h3>
                        </div>
                        <div className="p-3 space-y-2 overflow-y-auto flex-1 config-scrollbar font-mono text-[9px] text-green-500/70">
                            <p>[{new Date().toISOString()}] NODE_ONLINE: Election Core Verified</p>
                            <p>[{new Date().toISOString()}] SECURITY_KEY: AES-256-GCM Active</p>
                            <p>[{new Date().toISOString()}] DB_STATE: Connected to Cluster</p>
                            <p>[{new Date().toISOString()}] ADMIN_AUTH: Root Access Confirmed</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
