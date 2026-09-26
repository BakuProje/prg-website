import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RotateCcw, MapPin, SwitchCamera } from 'lucide-react';
import logoUrl from '../assets/logonobg.webp';

interface CameraVerificationProps {
    onCapture: (blob: Blob, metadata: any) => void;
    onClose: () => void;
}

export default function CameraVerification({ onCapture, onClose }: CameraVerificationProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [location, setLocation] = useState<string>('Mencari lokasi...');
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

    useEffect(() => {
        startCamera(facingMode);
        fetchLocation();
        return () => stopCamera();
    }, []);

    const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
        stopCamera();
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Browser Anda tidak mendukung akses kamera. Gunakan Chrome, Safari, atau Firefox versi terbaru.');
                return;
            }

            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: { ideal: mode },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (envErr: any) {
                console.warn('Ideal constraints failed, trying simplest:', envErr.name);
                // Fallback: simpler video constraint with facing mode
                const simpleStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: mode },
                    audio: false 
                });
                setStream(simpleStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = simpleStream;
                }
            }
        } catch (err: any) {
            console.error('Final camera error:', err);
            let msg = 'Gagal mengakses kamera.';
            if (err.name === 'NotAllowedError') msg = 'Izin kamera ditolak. Silakan aktifkan izin kamera di setelan browser.';
            else if (err.name === 'NotFoundError') msg = 'Kamera tidak ditemukan di perangkat Anda.';
            else if (err.name === 'NotReadableError') msg = 'Kamera sedang digunakan oleh aplikasi lain.';
            
            alert(`${msg}\n\nDetail Error: ${err.name}\n${err.message}`);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleCamera = () => {
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        startCamera(nextMode);
    };

    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setLocation('Geolocation tidak didukung');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocoding using OpenStreetMap (Nominatim) - Free and no key needed for low volume
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const data = await res.json();
                    setLocation(data.display_name || `${latitude}, ${longitude}`);
                } catch (err) {
                    setLocation(`${latitude}, ${longitude}`);
                }
            },
            () => setLocation('Gagal mendapatkan lokasi')
        );
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to video size
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        // Draw video frame without any mirroring
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw Watermark
        drawWatermark(ctx, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        
        canvas.toBlob((blob) => {
            setCapturedBlob(blob);
        }, 'image/jpeg', 0.85);
        
        stopCamera();
    };

    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const dayStr = now.toLocaleDateString('id-ID', { weekday: 'long' });

        // Overlay Shadow for text readability
        const gradient = ctx.createLinearGradient(0, height, 0, height - 200);
        gradient.addColorStop(0, 'rgba(0,0,0,0.65)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - 200, width, 200);

        // Text styling
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'bottom';
        
        // Time (Large)
        ctx.font = 'bold 80px Montserrat, sans-serif';
        ctx.fillText(timeStr, 40, height - 100);

        // Vertical Line
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(260, height - 160);
        ctx.lineTo(260, height - 100);
        ctx.stroke();

        // Date & Day
        ctx.font = '24px Montserrat, sans-serif';
        ctx.fillText(dateStr, 280, height - 135);
        ctx.font = '20px Montserrat, sans-serif';
        ctx.fillText(dayStr, 280, height - 105);

        // Location
        ctx.font = '16px Inter, sans-serif';
        const locationLines = wrapText(ctx, location, width - 80);
        locationLines.forEach((line, index) => {
            ctx.fillText(line, 40, height - 60 + (index * 20));
        });

        // Logo (Top Right)
        const img = new Image();
        img.src = logoUrl;
        if (img.complete) {
           ctx.drawImage(img, width - 120, 20, 100, 100);
        }
    };

    const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const handleConfirm = () => {
        if (capturedBlob) {
            onCapture(capturedBlob, {
                location,
                captured_at: new Date().toISOString()
            });
        }
    };

    const handleReset = () => {
        setCapturedImage(null);
        setCapturedBlob(null);
        startCamera(facingMode);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#07070a] flex flex-col">
            {/* Camera View Area */}
            <div className="relative flex-1 overflow-hidden">
                {!capturedImage ? (
                    <>
                        {/* Video Element without mirroring */}
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Premium HUD Overlay */}
                        <div className="absolute inset-0 border-[1px] border-white/10 m-4 rounded-[40px] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-40 pointer-events-none" />
                        
                        {/* Shutter & Controls UI Overlay */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8 sm:gap-10 z-30">
                            {/* Close Button */}
                            <button 
                                type="button"
                                onClick={onClose}
                                className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/15 active:scale-90 transition-all shadow-2xl"
                                title="Tutup Kamera"
                            >
                                <X size={28} />
                            </button>

                            {/* Shutter Button */}
                            <button 
                                type="button"
                                onClick={capturePhoto}
                                className="w-24 h-24 rounded-full border-[6px] border-white/30 flex items-center justify-center group active:scale-90 transition-transform shadow-2xl"
                                title="Ambil Foto"
                            >
                                <div className="w-18 h-18 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform" />
                            </button>

                            {/* Switch Front/Rear Camera Button */}
                            <button 
                                type="button"
                                onClick={toggleCamera}
                                className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/15 active:scale-90 transition-all shadow-2xl group"
                                title={facingMode === 'environment' ? 'Ganti ke Kamera Depan' : 'Ganti ke Kamera Belakang'}
                            >
                                <SwitchCamera size={26} className="text-neon-blue group-active:rotate-180 transition-transform duration-300" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0">
                        <img src={capturedImage} className="w-full h-full object-cover animate-fade-in" alt="Hasil Foto" />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    </div>
                )}

                {/* Top System Label & Mode Indicator */}
                <div className="absolute top-8 left-0 right-0 flex flex-col items-center gap-2 z-30 pointer-events-none">
                    <div className="bg-black/50 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3 shadow-lg">
                        <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_12px_rgba(0,212,255,1)]" />
                        <span className="text-white font-montserrat font-black text-[9px] uppercase tracking-[0.3em] italic">PRG Verification System</span>
                    </div>
                    {!capturedImage && (
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                            <span className="text-gray-300 text-[8px] font-bold uppercase tracking-widest">
                                {facingMode === 'environment' ? '📷 Kamera Belakang' : '🤳 Kamera Depan'} (Normal)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Interaction Panel */}
            <div className="bg-[#09090d] pt-8 pb-12 px-8 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                
                {capturedImage ? (
                    <div className="flex flex-col gap-6 animate-modal-up">
                        <div className="flex gap-4 items-center">
                            <button 
                                onClick={handleReset}
                                className="flex-1 h-14 rounded-full bg-transparent border-2 border-blue-500 text-blue-500 font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <RotateCcw size={20} />
                                <span className="text-[12px]">ULANGI</span>
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="flex-1 h-14 rounded-full bg-transparent border-2 border-blue-500 text-blue-500 font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-all"
                            >
                                <Check size={20} />
                                <span className="text-[12px]">VERIFY</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                             <MapPin size={14} className="text-neon-blue animate-pulse" />
                             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest truncate max-w-[280px]">{location}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                         <div className="flex items-center gap-5 px-6 py-5 bg-white/[0.03] rounded-[32px] border border-white/5 w-full relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-transparent flex items-center justify-center text-neon-blue shadow-inner">
                                <MapPin size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                                    <span className="w-1 h-3 bg-neon-blue rounded-full" />
                                    Detected Location
                                </p>
                                <p className="text-white text-[11px] font-bold truncate leading-none">{location}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
