import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceScanner = ({ onVerify, onCancel }) => {
    const videoRef = useRef();
    const [status, setStatus] = useState('Initializing Scanner...');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadModels = async () => {
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                ]);
                if (isMounted) {
                    setStatus('Models Loaded. Requesting Camera Access...');
                    startVideo();
                }
            } catch (error) {
                if (isMounted) {
                    setStatus(`Failed to load Face AI models: ${error.message || error}`);
                    console.error('Face API Error:', error);
                }
            }
        };
        const timer = setTimeout(loadModels, 500);

        return () => {
            isMounted = false;
            clearTimeout(timer);
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (!videoRef.current) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }
                let video = videoRef.current;
                video.srcObject = stream;
                // autoPlay handles video.play() to prevent AbortError
                setStatus('Camera active. Keep face steady.');
                setIsScanning(true);
            })
            .catch((err) => {
                setStatus('Camera access denied or unavailable.');
            });
    };

    const handleVideoPlay = async () => {
        if (!isScanning) return;

        // Simulating a scan process for demo purposes
        // In reality, this would extract face descriptor and match with backend
        const scanInterval = setInterval(async () => {
            if (videoRef.current) {
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

                if (detections) {
                    clearInterval(scanInterval);
                    setStatus('Identity Verified Successfully 🟢');

                    // Stop camera
                    const stream = videoRef.current.srcObject;
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());

                    setTimeout(() => {
                        // Pass the descriptor to the parent component
                        onVerify(true, detections.descriptor);
                    }, 1500);
                }
            }
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-lg text-center relative border border-blue-500/50 box-glow">
                <h3 className="text-2xl font-bold text-glow mb-4">Biometric Verification</h3>
                <p className="text-gray-300 mb-6 font-mono text-sm">{status}</p>

                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mb-6 border border-blue-500/30 flex items-center justify-center">
                    <video
                        ref={videoRef}
                        onPlay={handleVideoPlay}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover opacity-80"
                    />
                    {!isScanning && status !== 'Initializing Scanner...' && !status.includes('Failed') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <span className="text-white">Awaiting Video Stream...</span>
                        </div>
                    )}
                    {isScanning && (
                        <div className="absolute inset-0 border-2 border-blue-400/50 rounded-lg animate-pulse pointer-events-none">
                            {/* Scanning line animation */}
                            <div className="w-full h-1 bg-blue-400 absolute top-0 left-0 animate-[float_2s_ease-in-out_infinite]" />
                        </div>
                    )}
                </div>

                <button
                    onClick={onCancel}
                    className="w-full bg-red-600/30 hover:bg-red-500/50 border border-red-400/50 text-white font-semibold py-2 px-4 rounded transition-all duration-300"
                >
                    Abort Scan
                </button>
            </div>
        </div>
    );
};

export default FaceScanner;
