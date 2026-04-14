import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, openVariantModal } = useCartStore();
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [ps4Tab, setPs4Tab] = useState<'offline' | 'online'>('offline');
    const [activeTab, setActiveTab] = useState<'gameplay' | 'items'>('gameplay');
    const [enlargedMedia, setEnlargedMedia] = useState<{ type: 'image' | 'video', src: string, label: string } | null>(null);
    const [isLightboxAnimating, setIsLightboxAnimating] = useState(false);

    const openDetail = () => {
        setIsDetailOpen(true);
        setTimeout(() => setIsAnimating(true), 10);
    };

    const closeDetail = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsDetailOpen(false);
        }, 350);
    };

    const { isCartOpen, isVariantOpen } = useCartStore();

    useEffect(() => {
        if (isDetailOpen || isCartOpen || isVariantOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { };
    }, [isDetailOpen, isCartOpen, isVariantOpen]);

    useEffect(() => {
        if (enlargedMedia) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setIsLightboxAnimating(true), 10);
        } else if (!isDetailOpen) {
            document.body.style.overflow = '';
        }
        return () => { };
    }, [enlargedMedia, isDetailOpen]);

    const closeLightbox = () => {
        setIsLightboxAnimating(false);
        setTimeout(() => {
            setEnlargedMedia(null);
        }, 300);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (enlargedMedia) closeLightbox();
                else if (isDetailOpen) closeDetail();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enlargedMedia, isDetailOpen]);

    // Keep isVideoOpen as alias for backward compatibility
    const isVideoOpen = isDetailOpen;

    if (product.comingSoon) {
        return (
            <div className="relative group">
                <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500">
                    {/* Cover */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                        {product.cover ? (
                            <>
                                <img
                                    src={product.cover}
                                    alt={product.name}
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-dark-600 flex items-center justify-center">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-600">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="p-5">
                        <h3 className="font-montserrat font-bold text-lg text-gray-500 mb-2">
                            {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm font-inter">Segera hadir</p>
                    </div>
                </div>
                {/* Coming Soon Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-xs font-montserrat font-bold rounded-md border border-neon-purple/30 tracking-wider">
                        COMING SOON
                    </span>
                </div>

                {/* Rating Badge */}
                {product.rating && (
                    <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/10 shadow-lg">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neon-blue">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="font-montserrat font-bold text-sm text-white">
                                {product.rating.toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.hasVariant) {
            openVariantModal(product);
        } else {
            addItem(product);
        }
    };

    return (
        <>
            <div
                className="glass-card rounded-2xl overflow-hidden transition-all duration-500 glass-card-hover group flex flex-col cursor-pointer"
                onClick={openDetail}
            >
                {/* Cover */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                        src={product.cover}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />

                    {/* Rating Badge */}
                    {product.rating && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/10 shadow-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-neon-blue">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="font-montserrat font-bold text-sm text-white">
                                    {product.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-montserrat font-bold text-base text-white mb-1 group-hover:text-neon-blue transition-colors duration-300 line-clamp-2">
                        {product.name}
                    </h3>

                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 font-inter uppercase tracking-wider mb-0.5">Harga Sewa</span>
                            <div className="flex items-baseline gap-1">
                                <span className="font-montserrat font-black text-neon-blue text-lg">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-gray-500 font-inter">/hari</span>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart();
                            }}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-neon-blue/20 border border-white/10 hover:border-neon-blue/30 text-white transition-all duration-300 group/cart"
                            aria-label="Tambah ke keranjang"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/cart:scale-110 transition-transform">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Full-Page Detail View */}
            {isDetailOpen && (
                <div
                    className="fixed top-[65px] left-0 right-0 bottom-0 z-[100] bg-[#050816] overflow-y-auto"
                    style={{
                        opacity: isAnimating ? 1 : 0,
                        transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                >
                    {/* Two-column layout */}
                    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">

                            {/* ===== LEFT COLUMN: Image + Description ===== */}
                            <div className="flex-1 min-w-0 space-y-6">

                                {/* Kembali Button — Above image */}
                                <button
                                    onClick={closeDetail}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all duration-200 group w-fit"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform duration-200">
                                        <path d="M19 12H5" />
                                        <path d="M12 5l-7 7 7 7" />
                                    </svg>
                                    <span className="font-montserrat font-semibold text-sm">Kembali</span>
                                </button>

                                {/* Main Product Image */}
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,212,255,0.08)] group">
                                    <img
                                        src={product.cover}
                                        alt={product.name}
                                        className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ maxHeight: (product.id === 'ps3-only' || product.id === 'ps4-only') ? '320px' : '420px' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Rating badge — top-right */}
                                    {product.rating && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="text-neon-blue">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                ))}
                                                <span className="font-montserrat font-bold text-xs text-white ml-1">{product.rating?.toFixed(1)} / 5.0</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Product-specific Media */}
                                {product.id === 'tv-only' && (
                                    <div className="space-y-3">
                                        <h4 className="font-montserrat font-bold text-white text-sm tracking-wide uppercase opacity-60">Pilihan TV</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'TV Analog', src: '/src/assets/TV ANALOG.png' },
                                                { label: 'TV Android', src: '/src/assets/TV Android.jpeg' }
                                            ].map(item => (
                                                <div
                                                    key={item.label}
                                                    onClick={() => setEnlargedMedia({ type: 'image', src: item.src, label: item.label })}
                                                    className="group cursor-pointer relative rounded-xl overflow-hidden border border-white/10 aspect-video hover:border-neon-blue/40 transition-colors"
                                                >
                                                    <img src={item.src} alt={item.label} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-end p-3">
                                                        <span className="text-white font-montserrat font-bold text-xs">{item.label}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tabs for PS3 & PS4 products */}
                                {(product.id === 'ps3-tv' || product.id === 'ps3-only' || product.id === 'ps4-tv' || product.id === 'ps4-only') && (
                                    <div className="space-y-5">
                                        {/* Main Tabs Navigation */}
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-1">
                                            {[
                                                { id: 'gameplay', label: 'Gameplay' },
                                                { id: 'items', label: 'Kelengkapan' },
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveTab(tab.id as any)}
                                                    className={`pb-3 px-1 text-sm font-montserrat font-bold transition-all relative ${activeTab === tab.id ? 'text-neon-blue' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    {tab.label}
                                                    {activeTab === tab.id && (
                                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Tab Content: Gameplay */}
                                        {activeTab === 'gameplay' && (
                                            <div className="space-y-4 animate-modal-fade">
                                                {/* Sub-tabs for PS4 Gameplay */}
                                                {(product.id === 'ps4-tv' || product.id === 'ps4-only') && (
                                                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl w-fit border border-white/10">
                                                        {(['offline', 'online'] as const).map(tab => (
                                                            <button
                                                                key={tab}
                                                                onClick={() => setPs4Tab(tab)}
                                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-montserrat font-bold transition-all ${ps4Tab === tab ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/30' : 'text-gray-400 hover:text-white'}`}
                                                            >
                                                                PS 4 {tab.toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div
                                                        onClick={() => {
                                                            let videoUrl = product.videoUrl;
                                                            if (product.id === 'ps4-tv' || product.id === 'ps4-only') {
                                                                const variant = product.variants?.find(v => v.name.toLowerCase().includes(ps4Tab));
                                                                videoUrl = variant?.videoUrl;
                                                            }
                                                            setEnlargedMedia({
                                                                type: 'video',
                                                                src: videoUrl || '',
                                                                label: `Gameplay ${product.name} ${(product.id === 'ps4-tv' || product.id === 'ps4-only') ? (ps4Tab === 'online' ? 'Online' : 'Offline') : ''}`
                                                            });
                                                        }}
                                                        className="group cursor-pointer relative rounded-xl overflow-hidden bg-white/5 border border-white/10 aspect-video flex items-center justify-center hover:border-neon-blue/40 transition-colors"
                                                    >
                                                        {(() => {
                                                            let videoUrl = product.videoUrl;
                                                            if (product.id === 'ps4-tv' || product.id === 'ps4-only') {
                                                                const variant = product.variants?.find(v => v.name.toLowerCase().includes(ps4Tab));
                                                                videoUrl = variant?.videoUrl;
                                                            }
                                                            return videoUrl ? (
                                                                <video
                                                                    key={`${product.id}-${ps4Tab}`}
                                                                    src={videoUrl}
                                                                    muted
                                                                    autoPlay
                                                                    loop
                                                                    playsInline
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 group-hover:text-neon-blue transition-colors group-hover:scale-110 transform duration-300">
                                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                                </svg>
                                                            );
                                                        })()}
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 border-t border-white/5">
                                                            <span className="text-white font-montserrat font-bold text-[9px] uppercase tracking-wider block text-center">Preview Game</span>
                                                        </div>
                                                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="15 3 21 3 21 9" />
                                                                <polyline points="9 21 3 21 3 15" />
                                                                <line x1="21" y1="3" x2="14" y2="10" />
                                                                <line x1="3" y1="21" x2="10" y2="14" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab Content: Kelengkapan */}
                                        {activeTab === 'items' && (
                                            <div className="space-y-4 animate-modal-fade">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div
                                                        onClick={() => {
                                                            let itemsImg = '/src/assets/ps4.jpeg';
                                                            if (product.id === 'ps4-tv') itemsImg = '/src/assets/PS 4 SETUP LANDCAPE.png';
                                                            else if (product.id === 'ps3-tv') itemsImg = '/src/assets/PS 3 DAN TV SETUP.jpg';
                                                            else if (product.id.includes('ps3')) itemsImg = '/src/assets/ps3.jpeg';

                                                            setEnlargedMedia({
                                                                type: 'image',
                                                                src: itemsImg,
                                                                label: `${product.name} Unit & Kelengkapan`
                                                            });
                                                        }}
                                                        className="cursor-pointer relative rounded-xl overflow-hidden border border-white/10 aspect-video hover:border-neon-blue/40 transition-colors group"
                                                    >
                                                        <img
                                                            src={
                                                                product.id === 'ps4-tv' ? '/src/assets/PS 4 SETUP LANDCAPE.png' : 
                                                                product.id === 'ps3-tv' ? '/src/assets/PS 3 DAN TV SETUP.jpg' :
                                                                product.id.includes('ps3') ? '/src/assets/ps3.jpeg' : 
                                                                '/src/assets/ps4.jpeg'
                                                            }
                                                            alt="Kelengkapan"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 p-2 border-t border-white/5">
                                                            <span className="text-white font-montserrat font-bold text-[9px] uppercase tracking-wider line-clamp-1 block text-center">Unit & Kelengkapan</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-3">
                                    <h4 className="font-montserrat font-bold text-white text-sm tracking-wide uppercase opacity-60">Tentang Produk Ini</h4>
                                    <p className="text-gray-300 text-sm font-inter leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: '✓', text: 'Unit siap pakai' },
                                        { icon: '✓', text: 'Support Kendala' },
                                        { icon: '✓', text: 'Pengiriman langsung ke lokasi' },
                                        { icon: '✓', text: 'Gratis pengiriman tergantung jarak' },
                                    ].map(({ icon, text }) => (
                                        <div key={text} className="flex items-center gap-2 text-xs text-gray-400 font-inter">
                                            <span className="text-neon-blue font-bold">{icon}</span>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ===== RIGHT COLUMN: Name, Stock, Price, Actions ===== */}
                            <div className="w-full lg:w-[340px] xl:w-[380px] lg:sticky lg:top-36 lg:self-start space-y-5">

                                {/* Product Name */}
                                <div>
                                    <h1 className="font-montserrat font-black text-2xl xl:text-3xl text-white leading-tight mb-2">
                                        {product.name}
                                    </h1>
                                    {product.rating && (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.floor(product.rating ?? 0) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="text-neon-blue">
                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-400 font-inter">{product.rating.toFixed(1)} / 5.0</span>
                                        </div>
                                    )}
                                </div>

                                {/* Price & Stock Card */}
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                                    {/* Stock Badge Row */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-inter uppercase tracking-wider">Ketersediaan</span>
                                        <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-montserrat font-bold rounded-full border border-emerald-500/30">
                                            ● Tersedia
                                        </span>
                                    </div>

                                    <div className="border-t border-white/5" />

                                    {/* Price */}
                                    <div>
                                        <p className="text-xs text-gray-500 font-inter mb-1">Harga Sewa</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-montserrat font-black text-3xl text-neon-blue">
                                                Rp {product.price.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-sm text-gray-500 font-inter">/ hari</span>
                                        </div>
                                        {product.hasVariant && (
                                            <p className="text-[11px] text-neon-blue/70 mt-1.5 font-inter">* Tersedia pilihan Online / Offline</p>
                                        )}
                                    </div>

                                    <div className="border-t border-white/5" />

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        {/* Beli Sekarang */}
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                            style={{
                                                background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                                                boxShadow: '0 0 20px rgba(0,212,255,0.35)',
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                                <line x1="3" y1="6" x2="21" y2="6" />
                                                <path d="M16 10a4 4 0 01-8 0" />
                                            </svg>
                                            Sewa Sekarang
                                        </button>

                                        {/* Tambah ke Keranjang */}
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full py-3.5 rounded-xl font-montserrat font-bold text-sm text-white flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1" />
                                                <circle cx="20" cy="21" r="1" />
                                                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                                            </svg>
                                            Tambah ke Keranjang
                                        </button>
                                    </div>
                                </div>

                                {/* Info Labels */}
                                <div className="space-y-2.5">
                                    {[
                                        { icon: '🕐', text: 'Minimal sewa 1 hari' },
                                        { icon: '📦', text: 'Termasuk kabel & aksesoris lengkap' },
                                        { icon: '🎮', text: 'Unit siap main, langsung bisa digunakan' },
                                    ].map(({ icon, text }) => (
                                        <div key={text} className="flex items-start gap-3 text-xs text-gray-400 font-inter">
                                            <span className="text-base leading-none mt-0.5">{icon}</span>
                                            <span>{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Media Lightbox Modal */}
            {enlargedMedia && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8 bg-dark-950/90 backdrop-blur-xl transition-all duration-300"
                    style={{
                        opacity: isLightboxAnimating ? 1 : 0,
                        visibility: enlargedMedia ? 'visible' : 'hidden'
                    }}
                    onClick={closeLightbox}
                >
                    <div
                        className="relative w-full max-w-6xl flex flex-col items-center transition-all duration-300"
                        style={{
                            transform: isLightboxAnimating ? 'scale(1)' : 'scale(0.9)',
                            opacity: isLightboxAnimating ? 1 : 0,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Title Bar */}
                        <div className="w-full mb-6 text-center">
                            <h3 className="font-montserrat font-black text-2xl sm:text-4xl text-white tracking-tight">
                                {enlargedMedia.label}
                            </h3>
                            <div className="h-1 w-20 bg-gradient-to-r from-neon-blue to-neon-purple mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(0,212,255,0.5)]" />
                        </div>

                        {/* Media Container */}
                        <div className="relative w-full aspect-video sm:aspect-auto sm:max-h-[75vh] flex items-center justify-center rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] glass-card group">
                            {enlargedMedia.type === 'image' ? (
                                <img
                                    src={enlargedMedia.src}
                                    alt={enlargedMedia.label}
                                    className="w-full h-full object-contain sm:max-h-[75vh]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <video
                                        src={enlargedMedia.src}
                                        controls
                                        autoPlay
                                        className="max-w-full max-h-[75vh] w-auto h-auto rounded-xl"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-neon-blue/30 rounded-tl-3xl pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-neon-purple/30 rounded-br-3xl pointer-events-none" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ========== VARIANT MODAL ========== */

export function VariantModal() {
    const { isVariantOpen, selectedProduct, closeVariantModal, addItem } = useCartStore();
    const [activeVariant, setActiveVariant] = useState<string | null>(null);

    const { isCartOpen } = useCartStore();

    useEffect(() => {
        if (isVariantOpen || isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // Only clear if no other modal-like element is open
            // This is a bit tricky, but since ProductCard also manages it, 
            // they will coordinate via the body.style.overflow property.
            const anyDetailOpen = document.querySelector('[style*="transform: translateX(0)"]');
            if (!anyDetailOpen) {
                document.body.style.overflow = '';
            }
        }
    }, [isVariantOpen, isCartOpen]);

    if (!isVariantOpen || !selectedProduct) return null;

    const handleSelect = (variant: ProductVariant) => {
        setActiveVariant(variant.id);
    };

    const handleConfirm = () => {
        if (!activeVariant || !selectedProduct) return;
        const variant = selectedProduct.variants?.find((v) => v.id === activeVariant);
        if (variant) {
            addItem(selectedProduct, variant);
        }
        setActiveVariant(null);
        closeVariantModal();
    };

    const handleClose = () => {
        setActiveVariant(null);
        closeVariantModal();
    };

    const variants: ProductVariant[] = selectedProduct.variants ?? [];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-modal-fade"
            onClick={handleClose}
        >
            <div
                className="relative bg-dark-800 border border-white/10 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50 animate-modal-scale"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-dark-800/95 backdrop-blur-sm p-5 pb-4 border-b border-white/5 flex items-center justify-between z-10">
                    <div>
                        <h3 className="font-montserrat font-bold text-xl text-white">
                            {selectedProduct.name}
                        </h3>
                        <p className="text-sm text-gray-400 font-inter mt-0.5">
                            Pilih varian yang diinginkan
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Variants */}
                <div className="p-5 space-y-3">
                    {variants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => handleSelect(variant)}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${activeVariant === variant.id
                                ? 'border-neon-blue/50 bg-neon-blue/10'
                                : 'border-white/5 bg-dark-700/50 hover:border-white/10 hover:bg-dark-600/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="font-montserrat font-bold text-base text-white">
                                    {variant.name}
                                </span>
                                <span
                                    className={`font-montserrat font-bold text-sm px-3 py-1 rounded-lg ${activeVariant === variant.id
                                        ? 'bg-neon-blue/20 text-neon-blue'
                                        : 'price-tag text-neon-blue'
                                        }`}
                                >
                                    Rp {variant.price.toLocaleString('id-ID')}
                                </span>
                            </div>

                            {/* Video Preview */}
                            <div className="mb-2 rounded-lg overflow-hidden bg-dark-900/50 border border-white/5 h-28 flex items-center justify-center relative group/video">
                                {variant.videoUrl ? (
                                    <video
                                        src={variant.videoUrl}
                                        muted
                                        loop
                                        playsInline
                                        autoPlay
                                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : variant.cover ? (
                                    <img
                                        src={variant.cover}
                                        alt={variant.name}
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 mx-auto mb-1">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span className="text-xs text-gray-600 font-inter">Gameplay Preview</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-400 font-inter leading-relaxed">
                                {variant.description}
                            </p>

                            {/* Radio indicator */}
                            <div className="mt-3 flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activeVariant === variant.id
                                        ? 'border-neon-blue'
                                        : 'border-gray-600'
                                        }`}
                                >
                                    {activeVariant === variant.id && (
                                        <div className="w-2 h-2 rounded-full bg-neon-blue" />
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 font-inter">
                                    {activeVariant === variant.id ? 'Dipilih' : 'Pilih varian ini'}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Action */}
                <div className="sticky bottom-0 bg-dark-800/95 backdrop-blur-sm p-5 pt-4 border-t border-white/5">
                    <button
                        onClick={handleConfirm}
                        disabled={!activeVariant}
                        className={`w-full btn-neon py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${!activeVariant
                            ? 'opacity-40 cursor-not-allowed'
                            : ''
                            }`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                        {activeVariant
                            ? 'Tambah ke Keranjang'
                            : 'Pilih Varian Terlebih Dahulu'}
                    </button>
                </div>
            </div>
        </div>
    );
}
