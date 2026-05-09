import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiCheckCircle, FiCpu, FiAward, FiActivity, FiCommand, FiBookOpen, 
    FiShield, FiMusic, FiGrid, FiZap, FiStar, FiHash, FiClock, FiLock, 
    FiLayers, FiTerminal, FiShare2, FiFileText, FiBox, 
    FiAirplay, FiGlobe, FiRadio, FiBattery, FiBluetooth,
    FiCamera, FiCast, FiCloud, FiCodesandbox, FiCoffee, FiCompass, FiDatabase,
    FiDisc, FiDroplet, FiEye, FiFeather, FiFilter, FiFlag,
    FiGift, FiHardDrive, FiHeadphones, FiHeart, FiHexagon, FiImage, FiKey,
    FiLifeBuoy, FiLink, FiMap, FiMessageSquare, FiMic, FiMonitor, FiMoon,
    FiMousePointer, FiPackage, FiPaperclip, FiPieChart, FiPlay, FiPocket,
    FiPrinter, FiRss, FiSave, FiSearch, FiServer, FiSettings, FiSmartphone,
    FiSpeaker, FiSun, FiTarget, FiThermometer, FiToggleRight, FiTool, FiTruck,
    FiTv, FiUmbrella, FiVideo, FiWatch, FiWifi, FiWind, FiBook, FiAtSign,
    FiCloudLightning, FiCrosshair, FiDribbble, FiEdit, FiExternalLink, FiFile,
    FiFilePlus, FiFilm, FiFolder, FiFolderPlus, FiGitBranch, FiGitCommit,
    FiGitMerge, FiGitPullRequest, FiHelpCircle, FiHome, FiInbox, FiInfo,
    FiInstagram, FiItalic, FiLayout, FiLink2, FiLinkedin, FiList, FiLoader,
    FiLogIn, FiLogOut, FiMail, FiMapPin, FiMaximize, FiMaximize2, FiMenu,
    FiMessageCircle, FiMicOff, FiMinimize, FiMinimize2, FiMinus, FiMinusCircle,
    FiMinusSquare, FiMoreHorizontal, FiMoreVertical, FiMove, FiNavigation,
    FiNavigation2, FiOctagon, FiPause, FiPauseCircle, FiPenTool, FiPercent,
    FiPhone, FiPhoneCall, FiPhoneForwarded, FiPhoneIncoming, FiPhoneMissed,
    FiPhoneOff, FiPhoneOutgoing, FiPlayCircle, FiPlus, FiPlusCircle,
    FiPlusSquare, FiPower, FiRefreshCcw, FiRefreshCw, FiRepeat, FiRewind,
    FiRotateCcw, FiRotateCw, FiScissors, FiSend, FiShare, FiShieldOff,
    FiShoppingBag, FiShoppingCart, FiShuffle, FiSkipBack, FiSkipForward,
    FiSlack, FiSlash, FiSmile, FiSquare, FiStopCircle, FiSunrise, FiSunset,
    FiTablet, FiTag, FiThumbsDown, FiThumbsUp, FiToggleLeft, FiTrash, FiTrash2,
    FiTrello, FiTrendingDown, FiTrendingUp, FiTriangle, FiTwitch, FiTwitter,
    FiType, FiUnderline, FiUnlock, FiUpload, FiUploadCloud, FiUser, FiUserCheck,
    FiUserMinus, FiUserPlus, FiUsers, FiVideoOff, FiVoicemail, FiVolume,
    FiVolume1, FiVolumeX, FiX, FiXCircle, FiXOctagon, FiXSquare, FiYoutube,
    FiZapOff, FiZoomIn, FiZoomOut
} from 'react-icons/fi';
import { 
    MdMilitaryTech, MdEmojiEvents, MdSchool, MdPsychology, MdScience, 
    MdTheaterComedy, MdAutoGraph, MdHistoryEdu, MdSettingsSuggest, 
    MdCastConnected, MdRecordVoiceOver, MdHub, MdSchema, MdDashboard,
    MdMemory, MdLan, MdTerminal,
    MdPolicy, MdStorage, MdSecurity, MdVisibility,
    MdAutoMode, MdConstruction, MdDevices,
    MdDonutSmall, MdEngineering, MdExtension, MdFactCheck,
    MdGavel, MdTrendingUp,
    MdHandyman, MdHighlight, MdInventory, MdLayers,
    MdLightbulb, MdNfc, MdRadar, MdRestartAlt,
    MdRouter, MdRssFeed, MdSatellite, MdSave,
    MdSdCard, MdSensorDoor, MdSettings, MdStream,
    MdTimeline, MdTrackChanges,
    MdTune, MdUpdate, MdUsb, MdWaves, MdWifi,
    MdWindow, MdWorkspaces, MdZoomIn
} from 'react-icons/md';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';

const VoteCasting = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [votingState, setVotingState] = useState('IDLE'); 
    const [txDetails, setTxDetails] = useState({ hash: '', timestamp: '' });
    const [viewState, setViewState] = useState('intro'); 

    const SECRET_KEY = "VOTEX_E2E_SECURE_KEY";

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/candidates/election/${id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCandidates(data);
                    setViewState('intro');
                }
            } catch (err) {
                toast.error("Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, [id]);

    const handleSelectCandidate = (cand) => {
        setSelectedCandidate(cand);
        setViewState('confirming');
    };

    const confirmVote = async () => {
        if (!selectedCandidate) return;
        setVotingState('PROCESSING');
        const token = localStorage.getItem('token');
        try {
            const encryptedPayload = CryptoJS.AES.encrypt(selectedCandidate._id, SECRET_KEY).toString();
            const castRes = await fetch('http://localhost:5000/api/candidates/anonymized-cast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    payload: encryptedPayload,
                    adminEmail: JSON.parse(localStorage.getItem('user'))?.email 
                })
            });
            const castData = await castRes.json();
            if (!castRes.ok) throw new Error(castData.message || "CAST_REJECTION");

            setVotingState('CONFIRMED');

            const recordRes = await fetch('http://localhost:5000/api/auth/record-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ electionId: id, role: selectedCandidate.role })
            });
            const recordData = await recordRes.json();
            if (!recordRes.ok) throw new Error(recordData.message || "RECORD_REJECTION");

            setVotingState('VERIFIED');
            const clientHash = CryptoJS.SHA256(castData.candidateId + Date.now()).toString();
            setTxDetails({ hash: clientHash.substring(0, 32).toUpperCase(), timestamp: new Date().toLocaleString() });

            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...storedUser, isVoted: recordData.isVoted, votedElections: recordData.votedElections };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setViewState('receipt');
            toast.success("BLOCKCHAIN ANCHOR SECURED");

            // AUTOMATIC REDIRECT: If fully voted, exit to home page after 5 seconds
            if (updatedUser.isVoted) {
                setTimeout(() => {
                    localStorage.clear();
                    navigate('/');
                }, 5000);
            }
        } catch (err) {
            toast.error(err.message || "NODE_TIMEOUT: Sync failed.");
            setVotingState('IDLE');
        }
    };

    const getRoleColor = (role) => {
        if (role?.includes('President')) return 'cyan';
        if (role?.includes('Deputy Secretary')) return 'pink';
        if (role?.includes('Secretary')) return 'purple';
        return 'blue';
    };

    const SYMBOL_COLLECTIONS = {
        'IT Club': {
            'President': [MdPsychology, MdMemory, FiCpu, MdSettings, FiHardDrive, FiActivity, FiZap, FiGrid],
            'Secretary': [FiTerminal, MdTerminal, FiDatabase, MdStorage, FiCodesandbox, FiCommand, FiHash, FiLayers],
            'Deputy Secretary': [MdHub, MdLan, FiShare2, FiWifi, FiGlobe, MdRouter, FiLink, FiAtSign, FiCpu, FiCloudLightning]
        },
        'Cultural Club': {
            'President': [MdTheaterComedy, MdFactCheck, FiStar, FiSun, MdHighlight, FiAward, FiImage, FiFilm],
            'Secretary': [FiFileText, MdHistoryEdu, FiPaperclip, MdInventory, FiBook, FiBookOpen, FiEdit, FiFolder],
            'Deputy Secretary': [FiStar, MdVisibility, FiEye, FiCamera, FiVideo, FiMonitor, FiMic, FiSpeaker, FiMusic, FiPlay]
        },
        'Sports Club': {
            'President': [MdEmojiEvents, MdMilitaryTech, FiShield, MdSettings, FiTarget, MdTrackChanges, FiAward, FiActivity],
            'Secretary': [FiActivity, MdFactCheck, FiTool, MdConstruction, FiBook, FiClock, FiList, FiLayout],
            'Deputy Secretary': [FiZap, FiZap, FiZap, FiSun, FiSun, FiWind, FiCloudLightning, FiPower, FiBattery, FiCrosshair]
        },
        'Science Club': {
            'President': [MdScience, MdHub, MdSettings, FiHexagon, FiZap, MdAutoMode, FiActivity, FiDribbble],
            'Secretary': [FiLayers, MdTimeline, FiDatabase, FiFilter, MdDonutSmall, FiThermometer, FiGrid, FiDatabase],
            'Deputy Secretary': [FiActivity, FiActivity, FiZap, FiDroplet, FiWind, FiSun, FiHexagon, FiCompass, FiTarget, FiThermometer]
        },
        'Robotics Club': {
            'President': [FiCpu, MdSettingsSuggest, MdAutoMode, MdConstruction, FiCommand, MdDevices, FiCpu, FiSettings],
            'Secretary': [MdSettingsSuggest, FiSettings, FiSettings, FiTool, MdEngineering, MdHandyman, FiTool, FiDatabase],
            'Deputy Secretary': [FiShare2, MdSatellite, FiRadio, FiWifi, FiWifi, FiBluetooth, FiRss, FiCast, FiCpu, FiMaximize]
        },
        'Music Club': {
            'President': [FiMusic, MdWaves, FiDisc, MdSettings, FiHeadphones, FiSpeaker, FiMic, FiRadio],
            'Secretary': [MdCastConnected, MdTune, FiSettings, MdTimeline, FiActivity, MdStream, FiSettings, FiVolume],
            'Deputy Secretary': [MdRecordVoiceOver, MdRssFeed, FiRss, FiRadio, FiMic, FiSpeaker, FiVolume1, FiSpeaker, FiHeadphones, FiDisc]
        },
        'Literature Club': {
            'President': [FiBookOpen, MdHistoryEdu, FiFeather, MdGavel, MdFactCheck, FiAward, FiBook, FiEdit],
            'Secretary': [MdHistoryEdu, FiFileText, FiFeather, MdInventory, FiBook, FiSave, FiFilePlus, FiFolder],
            'Deputy Secretary': [MdAutoGraph, MdHighlight, FiSun, FiMoon, FiMessageSquare, FiMessageSquare, FiPenTool, FiPaperclip, FiType, FiItalic]
        },
        'Management Club': {
            'President': [MdMilitaryTech, MdTrendingUp, FiShield, MdPolicy, MdVisibility, FiTarget, FiAward, FiTrendingUp],
            'Secretary': [MdDashboard, MdDonutSmall, FiPieChart, MdTimeline, FiLayers, MdTrackChanges, FiGrid, FiLayout],
            'Deputy Secretary': [MdSchema, MdWorkspaces, FiGrid, FiLink, FiPackage, MdZoomIn, FiGitBranch, FiGitCommit, FiGitMerge, FiGitPullRequest]
        },
        'College Club': {
            'President': [MdSchool, MdGavel, FiShield, MdSettings, FiAward, MdMilitaryTech, FiShield, FiFlag],
            'Secretary': [FiShield, MdSecurity, FiKey, FiKey, MdFactCheck, FiSave, FiLock, FiShieldOff],
            'Deputy Secretary': [FiGlobe, MdWifi, FiRss, MdSatellite, FiLink, FiShare2, FiUsers, FiUserCheck, FiUserPlus, FiUserMinus]
        }
    };

    const getIdentityConfig = (club, role, index) => {
        const isPresident = role?.includes('President');
        const isDeputy = role?.includes('Deputy Secretary');
        const isSecretary = !isDeputy && role?.includes('Secretary');

        const collection = SYMBOL_COLLECTIONS[club]?.[isPresident ? 'President' : isDeputy ? 'Deputy Secretary' : 'Secretary'] || [FiZap];
        const Icon = collection[index % collection.length] || FiZap;

        let effect = (
            <>
                <div className="hologram-overlay" style={{ opacity: 0.15 }}></div>
                <div className="digital-noise" style={{ opacity: 0.05 }}></div>
            </>
        );
        
        let variationStyle = {
            filter: `drop-shadow(0 0 10px currentColor)`
        };

        return { Icon, effect, variationStyle };
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-mono tracking-widest uppercase">Initializing Node Connection...</div>;

    if (viewState === 'intro') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-10 rounded-3xl max-w-2xl w-full border border-cyan-500/30 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-cyan-400/30 box-glow-cyan"><FiCpu size={40} className="text-cyan-400 animate-pulse" /></div>
                    <h2 className="text-4xl font-black text-white tracking-[0.2em] uppercase mb-4 text-glow-cyan">Identity Verified</h2>
                    <p className="text-cyan-200/70 font-mono text-sm mb-10 tracking-widest leading-relaxed">SECURE NODE ESTABLISHED. YOUR VOTE WILL BE ANONYMIZED AND ANCHORED TO THE IMMUTABLE COLLEGE LEDGER.</p>
                    <button onClick={() => setViewState('voting')} className="w-full bg-cyan-600/30 hover:bg-cyan-500/50 border border-cyan-400/50 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.4em] transition-all duration-300 box-glow-cyan">Enter Voting Chamber</button>
                </motion.div>
            </div>
        );
    }

    if (viewState === 'confirming' && selectedCandidate) {
        const color = getRoleColor(selectedCandidate.role);
        const { Icon, effect, variationStyle } = getIdentityConfig(selectedCandidate.role.split(' - ')[0], selectedCandidate.role, 0);
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`glass-panel p-12 rounded-[40px] max-w-xl w-full border-2 border-${color}-500/50 text-center relative box-glow-${color}-intense`}>
                    {votingState === 'IDLE' ? (
                        <>
                            <h2 className={`text-3xl font-black text-white tracking-[0.2em] uppercase mb-12`}>Confirm Choice</h2>
                            <div className="mb-10 relative inline-block">
                                <div className={`mx-auto rounded-3xl neon-logo-container border-2 transition-all duration-500 border-${color}-400 overflow-hidden w-36 h-36`} style={{ color: color === 'cyan' ? '#00f3ff' : color === 'purple' ? '#bc13fe' : '#ff0096', ...variationStyle }}>
                                    {effect}
                                    <Icon size={48} className="neon-logo-icon" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-2">{selectedCandidate.name}</h3>
                            <p className={`text-xs text-${color}-400 font-mono tracking-[0.3em] uppercase mb-12`}>{selectedCandidate.role}</p>
                            <div className="flex gap-4">
                                <button onClick={() => setViewState('voting')} className="flex-1 bg-gray-900/50 hover:bg-gray-800 border border-white/10 text-gray-400 font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest transition-all">Abort</button>
                                <button onClick={confirmVote} className={`flex-1 bg-${color}-600/40 hover:bg-${color}-500/60 border border-${color}-400 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest transition-all box-glow-${color}`}>Authorize Cast</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-10">
                            <div className="relative w-32 h-32 mb-10">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className={`absolute inset-0 border-4 border-t-${color}-500 border-r-transparent border-b-transparent border-l-transparent rounded-full`} />
                                <div className="absolute inset-4 flex items-center justify-center"><FiLock size={40} className={`text-${color}-400 animate-pulse`} /></div>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">
                                {votingState === 'PROCESSING' && "Vote Processing..."}
                                {votingState === 'CONFIRMED' && "Vote Confirmed..."}
                                {votingState === 'VERIFIED' && "Anchoring Secured"}
                            </h3>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    if (viewState === 'receipt') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel p-12 rounded-[40px] max-w-2xl w-full border border-green-500/30 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-400/30"><FiCheckCircle size={40} className="text-green-400" /></div>
                    <h2 className="text-3xl font-black text-white tracking-[0.3em] uppercase mb-2">Vote Verified</h2>
                    <p className="text-green-400/60 font-mono text-[10px] mb-4 tracking-widest uppercase">TRANSACTION ANCHORED TO BLOCKCHAIN</p>
                    
                    {JSON.parse(localStorage.getItem('user'))?.isVoted && (
                        <div className="mb-8 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-[10px] font-mono animate-pulse uppercase tracking-widest">
                                Protocol Complete. Session terminating in 5 seconds...
                            </p>
                        </div>
                    )}
                    <div className="bg-black/40 rounded-3xl p-8 border border-white/5 space-y-6 text-left mb-10 font-mono">
                        <div className="flex justify-between items-center pb-4 border-b border-white/5"><span className="text-gray-500 text-[10px] uppercase">Candidate ID</span><span className="text-white text-xs">{selectedCandidate?.name}</span></div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/5"><span className="text-gray-500 text-[10px] uppercase flex items-center gap-2"><FiHash /> Tx Hash</span><span className="text-cyan-400 text-[10px] break-all">{txDetails.hash}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-500 text-[10px] uppercase flex items-center gap-2"><FiClock /> Timestamp</span><span className="text-gray-300 text-[10px]">{txDetails.timestamp}</span></div>
                    </div>
                    <button 
                        onClick={() => {
                            if (JSON.parse(localStorage.getItem('user'))?.isVoted) {
                                localStorage.clear();
                                navigate('/');
                            } else {
                                navigate('/dashboard');
                            }
                        }} 
                        className="w-full bg-white text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.4em] transition-all hover:scale-[1.02]"
                    >
                        {JSON.parse(localStorage.getItem('user'))?.isVoted ? "Finalize and Exit Session" : "Return to Dashboard"}
                    </button>
                </motion.div>
            </div>
        );
    }

    const roleOrder = ['President', 'Secretary', 'Deputy Secretary'];
    const groupedCandidates = candidates.reduce((acc, cand) => {
        // Filter out roles already voted for
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const votedKeys = storedUser?.votedElections || [];
        const voteKey = `${id}-${cand.role}`;
        
        if (votedKeys.includes(voteKey) && storedUser?.role !== 'Admin') {
            return acc;
        }

        if (!acc[cand.role]) acc[cand.role] = [];
        acc[cand.role].push(cand);
        return acc;
    }, {});

    // Sort the roles based on priority
    const sortedRoles = Object.keys(groupedCandidates).sort((a, b) => {
        const priorityA = roleOrder.findIndex(r => a.includes(r));
        const priorityB = roleOrder.findIndex(r => b.includes(r));
        return priorityA - priorityB;
    });

    return (
        <div className="min-h-screen pt-12 pb-24 px-4 md:px-12 relative z-10 flex flex-col items-center">
            <header className="w-full max-w-7xl mb-16 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-[0.3em] uppercase text-glow-cyan mb-2">Node Selection</h1>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-cyan-400 tracking-[0.2em] uppercase">
                        <span className="flex items-center gap-1"><FiCpu /> Local Node: 0x82...f9</span>
                        <span className="flex items-center gap-1"><FiActivity /> Sync Rate: 12ms</span>
                        <span className="flex items-center gap-1 text-green-500 animate-pulse"><FiShield /> HIGH CONCURRENCY ACTIVE</span>
                    </div>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all text-gray-400 border border-white/10">Abort Operation</button>
            </header>

            <motion.div layout className="w-full max-w-7xl space-y-24">
                {sortedRoles.map((role) => {
                    const cands = groupedCandidates[role];
                    const color = getRoleColor(role);
                    const clubName = role.split(' - ')[0];
                    const positionName = role.split(' - ')[1];
                    return (
                        <div key={role} className="relative">
                            <div className="flex items-center gap-6 mb-12">
                                <h2 className={`text-2xl font-black text-white tracking-[0.4em] uppercase border-l-4 border-${color}-500 pl-6`}>{positionName}<span className={`block text-[10px] text-${color}-400 font-mono tracking-[0.8em] mt-1`}>{clubName} DIVISION</span></h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                            </div>
                            <div className="flex overflow-x-auto gap-8 pb-10 custom-scrollbar scroll-smooth px-4">
                                {cands.map((cand, idx) => {
                                    const { Icon, effect, variationStyle } = getIdentityConfig(clubName, role, idx);
                                    return (
                                        <motion.div key={cand._id} whileHover={{ y: -10, scale: 1.02 }} className={`glass-card p-10 rounded-[32px] flex flex-col items-center relative overflow-hidden transition-all duration-500 border-2 w-[340px] flex-shrink-0 ${selectedCandidate?._id === cand._id ? `border-${color}-400 box-glow-${color}-intense bg-${color}-500/10` : `border-${color}-500/30 bg-black/40 hover:border-${color}-400 box-glow-${color} shadow-xl`}`}>
                                            <div className="relative mb-12 mt-4">
                                                <div className={`mx-auto rounded-[32px] neon-logo-container border-2 transition-all duration-700 
                                                    ${selectedCandidate?._id === cand._id ? `border-${color}-400 symbol-glow-intense scale-110` : `border-${color}-400/50 symbol-glow-${color}`} 
                                                    ${role?.includes('President') ? 'w-44 h-44' : role?.includes('Secretary') ? 'w-36 h-36' : 'w-32 h-32'}`} 
                                                    style={{ color: color === 'cyan' ? '#00f3ff' : color === 'purple' ? '#bc13fe' : '#ff0096', ...variationStyle }}>
                                                    {effect}
                                                    <Icon size={role?.includes('President') ? 80 : role?.includes('Secretary') ? 60 : 48} className={`neon-logo-icon ${role?.includes('President') ? 'drop-shadow-[0_0_25px_currentColor]' : 'drop-shadow-[0_0_15px_currentColor]'}`} />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-1 tracking-tight text-center">{cand.name}</h3>
                                            <p className={`text-[10px] text-${color}-400 font-mono tracking-[0.3em] uppercase mb-10 text-center`}>{cand.role}</p>
                                            <button onClick={() => handleSelectCandidate(cand)} className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 bg-${color}-500/10 border border-${color}-500/30 text-${color}-400 hover:bg-${color}-500 hover:text-white hover:box-glow-${color}`}>Initiate Vote</button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default VoteCasting;
