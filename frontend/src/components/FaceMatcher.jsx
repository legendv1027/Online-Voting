import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceMatcher = ({ onMatch, mode = 'capture', registeredDescriptor = null }) => {
    const videoRef = useRef();
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState("Initializing Biometric Scanner...");
    const [isLivenessPassed, setIsLivenessPassed] = useState(false);
    const [blinkCount, setBlinkCount] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
            setStatus("Webcam Access Required...");
            startVideo();
        };
        loadModels();
    }, []);

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStatus("Position your face in the frame...");
                }
            })
            .catch(err => {
                console.error(err);
                setStatus("Camera Access Denied.");
            });
    };

    const handleVideoPlay = () => {
        let frameCount = 0;
        const interval = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return;

            const detections = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
            ).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                console.log("[VOTEX BIOMETRIC] Face detected, stability frame:", frameCount);
                frameCount++;
                const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
                
                if (frameCount < 2) {
                    setStatus(`Acquiring biometric data... [${frameCount * 50}%]`);
                } else if (frameCount < 3) {
                    setStatus("Analyzing facial texture... Hold steady.");
                } else {
                    if (mode === 'capture') {
                        setStatus("Biometric Pattern Anchored!");
                        
                        // Capture the frame
                        const canvas = document.createElement('canvas');
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
                        console.log("[VOTEX BIOMETRIC] Pattern Anchored. Capturing frame.");
                        setCapturedImage(canvas.toDataURL('image/jpeg'));

                        clearInterval(interval);
                        const descriptorArray = Array.from(detections.descriptor);
                        console.log("[VOTEX BIOMETRIC] Descriptor size:", descriptorArray.length);
                        setTimeout(() => onMatch(descriptorArray), 1000);
                    } else if (mode === 'verify' && registeredDescriptor) {
                        const distance = faceapi.euclideanDistance(detections.descriptor, new Float32Array(registeredDescriptor));
                        if (distance < 0.55) {
                            setStatus("Identity Authenticated!");
                            clearInterval(interval);
                            onMatch(true);
                        } else {
                            setStatus("Identity Mismatch. Retrying...");
                            frameCount = 0; 
                        }
                    }
                }
            } else {
                frameCount = 0;
                setStatus("No face detected. Align with scanner.");
            }
        }, 100);

        return () => clearInterval(interval);
    };

    const simulateScan = () => {
        setStatus("SIMULATING BIOMETRIC PATTERN...");
        setTimeout(() => {
            if (mode === 'capture') {
                // Generate a random-ish descriptor for simulation
                const mockDescriptor = Array.from({ length: 128 }, () => Math.random());
                onMatch(mockDescriptor);
            } else {
                onMatch(true);
            }
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-cyan-500/50 box-glow shadow-[0_0_20px_#00f3ff40] bg-gray-900 flex items-center justify-center">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={handleVideoPlay}
                    className="w-full h-full object-cover grayscale"
                />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

                {capturedImage && (
                    <img 
                        src={capturedImage} 
                        alt="Captured" 
                        className="absolute inset-0 w-full h-full object-cover z-20 animate-in fade-in zoom-in duration-300"
                    />
                )}

                {/* Fallback Icon when no video */}
                {(!modelsLoaded || status.includes("Denied")) && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <svg className="w-20 h-20 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Holographic scanner overlay */}
                <div className="absolute inset-0 pointer-events-none border-[10px] border-cyan-500/10 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 opacity-20 shadow-[0_0_15px_#00ffff] animate-scan"></div>
            </div>

            <div className="text-center">
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">{status}</p>
            </div>
        </div>
    );
};

export default FaceMatcher;
