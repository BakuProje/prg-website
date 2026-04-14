import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore';

const WHATSAPP_NUMBER = '6282349918631';

export default function CartModal() {
    const {
        isCartOpen,
        closeCart,
        items,
        removeItem,
        updateQuantity,
        getTotalPrice,
        clearCart,
    } = useCartStore();

    const [address, setAddress] = useState('');
    const [deliveryTime, setDeliveryTime] = useState<'sekarang' | 'nanti' | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | ''>('');
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
    const [isDeliveryDropdownOpen, setIsDeliveryDropdownOpen] = useState(false);
    const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [showLocationModal, setShowLocationModal] = useState(false);

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic Leaflet Map Implementation
    useEffect(() => {
        if (!coords || isManualAddress || !mapContainerRef.current || !(window as any).L) return;

        const L = (window as any).L;
        if (mapRef.current) mapRef.current.remove();

        const map = L.map(mapContainerRef.current, {
            center: [coords.lat, coords.lng],
            zoom: 17,
            zoomControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
            attribution: '©OpenStreetMap ©CartoDB'
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(map);

        marker.on('dragend', async () => {
            const newPos = marker.getLatLng();
            setCoords({ lat: newPos.lat, lng: newPos.lng });
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${newPos.lat}&lon=${newPos.lng}`);
                const data = await response.json();
                if (data.display_name) setAddress(data.display_name);
            } catch (err) { console.error(err); }
        });

        mapRef.current = map;
        return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    }, [coords, isManualAddress, isCartOpen]);

    // Body scroll lock for cart drawer
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isCartOpen]);

    useEffect(() => {
        if (!isCartOpen) return;
        setAddress('');
        setDeliveryTime('');
        setPaymentMethod('');
        setIsManualAddress(false);
        setCoords(null);
    }, [isCartOpen]);

    const totalPrice = getTotalPrice();

    const handleWhatsApp = () => {
        if (items.length === 0) return;
        let message = `Halo Admin, saya ingin memesan:\n\n`;
        items.forEach((item, index) => {
            const name = item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name;
            const price = (item.variant?.price ?? item.product.price) * item.quantity;
            message += `${index + 1}. ${name} x${item.quantity}\n   Harga: Rp ${price.toLocaleString('id-ID')}\n\n`;
        });

        // Generate Maps link based on coords or address text
        const mapsUrl = coords
            ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
            : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;

        message += `Total: Rp ${totalPrice.toLocaleString('id-ID')}\n\n`;
        message += `Alamat: ${address || '-'}\n`;
        message += `Klik untuk Lokasi: ${mapsUrl}\n\n`;
        message += `Waktu antar: ${deliveryTime === 'sekarang' ? 'Sekarang' : 'Nanti'}\n`;
        message += `Metode pembayaran: ${paymentMethod.toUpperCase() || '-'}\n\n`;
        message += `Terima kasih.`;

        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        clearCart(); closeCart();
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert('GPS tidak didukung');
        setShowLocationModal(true);
    };

    const triggerGeolocation = () => {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                setAddress(data.display_name || `Koor: ${latitude}, ${longitude}`);
                setIsManualAddress(false);
            } catch { setAddress(`Koor: ${latitude}, ${longitude}`); }
            finally {
                setIsLocating(false);
                setShowLocationModal(false);
            }
        }, () => {
            alert('Gagal deteksi lokasi atau akses lokasi dilarang browser');
            setIsLocating(false);
            setShowLocationModal(false);
        }, { enableHighAccuracy: true });
    };

    return (
        <div className={`fixed inset-0 z-[200] flex justify-end transition-all duration-500 ${isCartOpen ? 'visible' : 'invisible pointer-events-none'}`} onClick={closeCart}>
            {/* Backdrop Overlay with Blur */}
            <div className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} />

            {/* Drawer Container */}
            <div
                className={`relative w-full sm:w-[450px] h-full bg-[#0d0d12] border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCartOpen ? 'translate-x-0' : 'translate-x-full opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Particle Stars Effect Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                    <div className="stars-container">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="star" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                transform: `scale(${Math.random()})`
                            }} />
                        ))}
                    </div>
                </div>

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center border border-white/10 shadow-inner">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neon-blue">
                                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-montserrat font-black text-white tracking-tight uppercase italic">Keranjang</h2>
                            <p className="text-[10px] text-gray-500 font-montserrat font-bold uppercase tracking-widest leading-none mt-1">{items.length} Pesanan Aktif</p>
                        </div>
                    </div>
                    <button onClick={closeCart} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 group">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 relative z-10 scrollbar-hide">
                    {/* Item List */}
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <div className="text-center py-20 opacity-40">
                                <div className="text-6xl mb-4">🛒</div>
                                <p className="font-inter font-bold uppercase tracking-widest text-xs">Keranjang belanja kosong</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={`${item.product.id}-${item.variant?.id}`} className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-neon-blue/20 transition-all flex gap-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-neon-blue/40 transition-colors">
                                        <img src={item.product.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-montserrat font-bold text-sm text-white truncate group-hover:text-neon-blue transition-colors">
                                                {item.variant ? `${item.product.name} (${item.variant.name})` : item.product.name}
                                            </h4>
                                            <p className="text-neon-blue font-montserrat font-black text-xs mt-1">Rp {(item.variant?.price ?? item.product.price).toLocaleString('id-ID')} / Day</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                                                <button onClick={() => item.quantity <= 1 ? removeItem(item.product.id, item.variant?.id) : updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                                                    {item.quantity <= 1 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg> : '−'}
                                                </button>
                                                <span className="w-8 text-center text-xs font-montserrat font-black text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white transition-colors">+</button>
                                            </div>
                                            <p className="text-white font-montserrat font-black text-xs">Rp {((item.variant?.price ?? item.product.price) * item.quantity).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {items.length > 0 && (
                        <>
                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            {/* Section: Checkout Detail */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-montserrat font-bold text-gray-500 uppercase tracking-[0.2em]">Data Pengiriman</h3>
                                    <p className="text-[10px] text-neon-blue font-bold uppercase tracking-widest px-2 py-1 bg-neon-blue/5 rounded-md border border-neon-blue/10">Wajib Diisi</p>
                                </div>

                                {/* Address Block */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-montserrat font-black text-gray-600 uppercase tracking-widest ml-1">Lokasi Antar</label>
                                    <button
                                        onClick={() => { if (!address) setIsAddressDropdownOpen(!isAddressDropdownOpen); }}
                                        className={`w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between transition-all ${!address ? 'hover:bg-white/10 hover:border-white/20 active:scale-98' : 'pointer-events-none opacity-80'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                                            <span className={`text-sm font-inter truncate ${address ? 'text-white font-semibold' : 'text-gray-500 italic'}`}>{address || 'Tap untuk pilih lokasi...'}</span>
                                        </div>
                                        {!address && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-600 transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>}
                                    </button>

                                    {isAddressDropdownOpen && (
                                        <div className="p-2 rounded-2xl bg-black/40 border border-white/5 scale-up-center space-y-1">
                                            <button onClick={() => { handleGetLocation(); setIsAddressDropdownOpen(false); }} className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center gap-4 transition-all">
                                                <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
                                                    {isLocating ? (
                                                        <div className="w-4 h-4 border-2 border-t-transparent border-neon-blue rounded-full animate-spin" />
                                                    ) : (
                                                        <img src="/src/assets/maps.png" alt="Detect" className="w-6 h-6 object-contain" />
                                                    )}
                                                </div>
                                                <div className="text-left"><p className="text-sm font-montserrat font-bold text-white">Deteksi Otomatis</p><p className="text-[10px] text-gray-500">Akurasi GPS & Peta Terang</p></div>
                                            </button>
                                            <button onClick={() => { setIsManualAddress(true); setIsAddressDropdownOpen(false); }} className="w-full p-3 rounded-xl hover:bg-white/5 flex items-center gap-4 transition-all">
                                                <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-gray-500">✍️</div>
                                                <div className="text-left"><p className="text-sm font-montserrat font-bold text-white">Ketik Manual</p><p className="text-[10px] text-gray-500">Tulis alamat secara manual</p></div>
                                            </button>
                                        </div>
                                    )}

                                    {coords && !isManualAddress && (
                                        <div className="space-y-4 animate-fade-in pl-1">
                                            <div className="flex items-center justify-between text-[10px] font-bold tracking-widest uppercase">
                                                <span className="text-green-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Sinyal Kuat</span>
                                                <button onClick={handleGetLocation} className="text-gray-500 hover:text-white">Refresh</button>
                                            </div>
                                            <div className="w-full h-48 rounded-2xl border border-white/10 overflow-hidden relative group">
                                                <div ref={mapContainerRef} className="w-full h-full" />
                                                <button onClick={() => window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank')} className="absolute top-2 right-2 z-20 p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-800 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg></button>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/5"><p className="text-xs text-white leading-relaxed font-inter">{address}</p></div>
                                        </div>
                                    )}

                                    {isManualAddress && (
                                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Jl. Contoh No. 123..." className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-sm text-white focus:outline-none focus:border-neon-blue/30 resize-none font-inter animate-fade-in" />
                                    )}

                                    {(address) && (
                                        <button onClick={() => { setAddress(''); setIsManualAddress(false); setCoords(null); }} className="w-full py-2 text-[10px] font-montserrat font-black text-gray-600 hover:text-red-500 tracking-[0.3em] uppercase transition-colors">× Batalkan & Hapus Alamat ×</button>
                                    )}
                                </div>

                                {/* Nested Dropdowns: Time & Payment */}
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Time */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-montserrat font-black text-gray-600 uppercase tracking-widest ml-1">Waktu Antar</label>
                                        <button onClick={() => { setIsDeliveryDropdownOpen(!isDeliveryDropdownOpen); setIsPaymentDropdownOpen(false); setIsAddressDropdownOpen(false); }} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between transition-all hover:bg-white/10 active:scale-98 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center text-neon-purple group-hover:scale-110 transition-transform">
                                                    {deliveryTime === 'sekarang' ? <img src="/src/assets/sekarang.png" className="h-6 object-contain" /> : deliveryTime === 'nanti' ? '📅' : '⏰'}
                                                </div>
                                                <span className={`text-sm font-montserrat font-bold uppercase tracking-wider ${deliveryTime ? 'text-white' : 'text-gray-500 italic'}`}>{deliveryTime || 'Pilih Waktu...'}</span>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-600 transition-transform ${isDeliveryDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                                        </button>
                                        {isDeliveryDropdownOpen && (
                                            <div className="p-2 rounded-2xl bg-black/40 border border-white/5 scale-up-center space-y-1">
                                                <button onClick={() => { setDeliveryTime('sekarang'); setIsDeliveryDropdownOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${deliveryTime === 'sekarang' ? 'bg-neon-purple/20 border-neon-purple/30' : 'hover:bg-white/5'}`}>
                                                    <div className="w-10 h-10 rounded-full bg-neon-purple/10 flex items-center justify-center">
                                                        <img src="/src/assets/sekarang.png" alt="Now" className="h-6 object-contain" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-montserrat font-bold text-white uppercase italic">Sekarang</p>
                                                        <p className="text-[10px] text-gray-500">Antar pesanan saat ini juga</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => { setDeliveryTime('nanti'); setIsDeliveryDropdownOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${deliveryTime === 'nanti' ? 'bg-neon-purple/20 border-neon-purple/30' : 'hover:bg-white/5'}`}>
                                                    <div className="w-10 h-10 rounded-full bg-gray-500/10 flex items-center justify-center text-xl">📅</div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-montserrat font-bold text-white uppercase italic">Nanti</p>
                                                        <p className="text-[10px] text-gray-500">Jadwalkan waktu pengantaran</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-montserrat font-black text-gray-600 uppercase tracking-widest ml-1">Bayar Via</label>
                                        <button onClick={() => { setIsPaymentDropdownOpen(!isPaymentDropdownOpen); setIsDeliveryDropdownOpen(false); setIsAddressDropdownOpen(false); }} className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between transition-all hover:bg-white/10 active:scale-98 group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {paymentMethod ? <img src={`/src/assets/${paymentMethod}.png`} className="h-6 object-contain" /> : <span className="text-green-400">💵</span>}
                                                </div>
                                                <span className={`text-sm font-montserrat font-bold uppercase tracking-wider ${paymentMethod ? 'text-white' : 'text-gray-500 italic'}`}>{paymentMethod || 'Metode Bayar...'}</span>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-gray-600 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                                        </button>
                                        {isPaymentDropdownOpen && (
                                            <div className="p-2 rounded-2xl bg-black/40 border border-white/5 scale-up-center space-y-1">
                                                <button onClick={() => { setPaymentMethod('cash'); setIsPaymentDropdownOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'cash' ? 'bg-green-500/20 border-green-500/30' : 'hover:bg-white/5'}`}>
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <img src="/src/assets/cash.png" className="h-6 object-contain" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-montserrat font-bold text-white uppercase italic">Cash / COD</p>
                                                        <p className="text-[10px] text-gray-500">Bayar tunai di tempat Anda</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => { setPaymentMethod('qris'); setIsPaymentDropdownOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'qris' ? 'bg-green-500/20 border-green-500/30' : 'hover:bg-white/5'}`}>
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <img src="/src/assets/qris.png" className="h-6 object-contain" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-montserrat font-bold text-white uppercase italic">QRIS / E-Wallet</p>
                                                        <p className="text-[10px] text-gray-500">Scan QR via DANA, OVO, dll</p>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Action */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/5 bg-[#0d0d12] relative z-10">
                        <div className="flex items-center justify-between mb-6 px-1">
                            <p className="text-[10px] font-montserrat font-black text-gray-400 uppercase tracking-widest">Total Bayar</p>
                            <p className="text-2xl font-montserrat font-black text-white italic">Rp {totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                        <button
                            onClick={handleWhatsApp}
                            disabled={!address || !deliveryTime || !paymentMethod}
                            className={`w-full py-5 rounded-2xl font-montserrat font-black text-xs uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_15px_30px_-10px_rgba(37,211,102,0.4)] ${(!address || !deliveryTime || !paymentMethod) ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_20px_40px_-5px_rgba(37,211,102,0.5)]'}`}
                            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            GAS PESAN SEKARANG
                        </button>
                    </div>
                )}
            </div>

            {/* Modern Location Permission Modal */}
            {showLocationModal && (
                <div
                    className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLocationModal(false)} />

                    <div
                        className="relative w-full max-w-sm bg-[#12121a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] p-8 text-center animate-modal-scale"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Neon Glow Corner */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-blue/20 rounded-full blur-[40px] pointer-events-none" />

                        {/* Icon */}
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-lg relative">
                            <img src="/src/assets/maps.png" alt="Location" className="w-10 h-10 object-contain relative z-10" />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neon-blue/30 to-transparent blur-sm rounded-b-3xl" />
                        </div>

                        <h3 className="text-2xl font-montserrat font-black text-white italic uppercase tracking-tight mb-3">
                            Aktifkan <span className="text-neon-blue">Lokasi?</span>
                        </h3>

                        <p className="text-gray-400 text-sm font-inter leading-relaxed mb-8">
                            Kami butuh lokasi Anda untuk menentukan alamat pengantaran secara otomatis agar lebih akurat dan mempercepat pengiriman pesanan Anda.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={triggerGeolocation}
                                disabled={isLocating}
                                className={`w-full py-4 rounded-2xl font-montserrat font-black text-xs uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 transition-all shadow-[0_15px_30px_-10px_rgba(0,212,255,0.4)] ${isLocating ? 'opacity-70 scale-98 shadow-none' : 'hover:-translate-y-1 active:scale-95'}`}
                                style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)' }}
                            >
                                {isLocating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        TUNGGU SEBENTAR...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                        IZINKAN SEKARANG
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="w-full py-4 rounded-2xl font-montserrat font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                            >
                                NANTI SAJA
                            </button>
                        </div>

                        {/* Bottom Decor */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-neon-blue/40 rounded-full" />
                                Privasi Anda Prioritas Kami
                                <span className="w-1.5 h-1.5 bg-neon-blue/40 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .star { position: absolute; width: 4px; height: 4px; background: white; border-radius: 50%; opacity: 0; animation: twinkle 5s infinite; }
                @keyframes twinkle { 
                    0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
                    50% { opacity: 0.8; transform: translateY(-20px) scale(1.2); }
                }

                .leaflet-container { width: 100%; height: 100%; background: #f8f9fa !important; border-radius: 1rem; }
                .leaflet-tile { filter: none !important; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes scaleUpCenter { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .scale-up-center { animation: scaleUpCenter 0.2s cubic-bezier(0.39, 0.575, 0.565, 1.000) both; }

                @keyframes modalScale {
                    from { transform: scale(0.9) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-modal-scale { animation: modalScale 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
            `}</style>
        </div>
    );
}
