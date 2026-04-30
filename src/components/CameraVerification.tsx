import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RotateCcw, MapPin } from 'lucide-react';
import logoUrl from '../assets/logonobg.png';

interface CameraVerificationProps {
    onCapture: (blob: Blob, metadata: any) => void;
    onClose: () => void;
}

export default function CameraVerification({ onCapture, onClose }: CameraVerificationProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [location, setLocation] = useState<string>('Mencari lokasi...');
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

    useEffect(() => {
        startCamera();
        fetchLocation();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Browser Anda tidak mendukung akses kamera. Gunakan Chrome, Safari, atau Firefox versi terbaru.');
                return;
            }

            // Try back camera first with ideal constraints
            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (envErr: any) {
                console.warn('Ideal constraints failed, trying simplest:', envErr.name);
                // Final fallback: simplest possible video constraint
                const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
        }
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw Watermark
        drawWatermark(ctx, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        
        canvas.toBlob((blob) => {
            setCapturedBlob(blob);
        }, 'image/jpeg', 0.8);
        
        stopCamera();
    };

    const drawWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const dayStr = now.toLocaleDateString('id-ID', { weekday: 'long' });

        // Overlay Shadow for text readability
        const gradient = ctx.createLinearGradient(0, height, 0, height - 200);
        gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
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
        // Since image loading is async, we should ideally wait or pre-load
        // For now, if it's already in cache it might work, but let's draw it if ready
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
                currentLine = word;
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
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#07070a] flex flex-col">
            {/* Camera View Area */}
            <div className="relative flex-1 overflow-hidden">
                {!capturedImage ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Premium HUD Overlay */}
                        <div className="absolute inset-0 border-[1px] border-white/10 m-4 rounded-[40px] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-transparent h-40 pointer-events-none" />
                        
                        {/* Shutter UI Overlay */}
                        <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10">
                             <button 
                                onClick={onClose}
                                className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all shadow-2xl"
                            >
                                <X size={28} />
                            </button>
                            <button 
                                onClick={capturePhoto}
                                className="w-24 h-24 rounded-full border-[6px] border-white/20 flex items-center justify-center group active:scale-90 transition-transform"
                            >
                                <div className="w-18 h-18 rounded-full bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform" />
                            </button>
                            <div className="w-14 h-14" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0">
                        <img src={capturedImage} className="w-full h-full object-cover animate-fade-in" />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    </div>
                )}

                {/* Top System Label */}
                <div className="absolute top-8 left-0 right-0 flex justify-center z-30">
                    <div className="bg-black/40 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_12px_rgba(0,212,255,1)]" />
                        <span className="text-white font-montserrat font-black text-[9px] uppercase tracking-[0.4em] italic">PRG Verification System</span>
                    </div>
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
