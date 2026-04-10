import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { openCart } = useCartStore();
    const [itemCount, setItemCount] = useState(0);
    const [activeSection, setActiveSection] = useState('beranda');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            const sections = ['contact', 'info', 'beranda'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 3) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const unsub = useCartStore.subscribe(() => {
            setItemCount(useCartStore.getState().getItemCount());
        });
        setItemCount(useCartStore.getState().getItemCount());
        return () => unsub();
    }, []);

    // Body scroll lock for mobile menu
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileOpen]);

    const navLinks = [
        {
            label: 'Beranda',
            href: '#beranda',
            id: 'beranda',
            icon: (color: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        },
        {
            label: 'Info Produk',
            href: '#info',
            id: 'info',
            icon: (color: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
        },
        {
            label: 'Hubungi Kami',
            href: '#contact',
            id: 'contact',
            icon: (color: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
        },
    ];

    const handleNavClick = () => setMobileOpen(false);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
                    ? 'bg-dark-900/95 backdrop-blur-xl shadow-lg shadow-black/40'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <a href="#beranda" className="flex items-center gap-3 group">
                            <img
                                src="/src/assets/logonobg.png"
                                alt="Logo"
                                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="hidden sm:block">
                                <span className="font-montserrat font-black text-xs sm:text-sm tracking-[0.2em] uppercase text-white italic">
                                    PRG <span className="text-neon-blue">RENTAL</span>
                                </span>
                            </div>
                        </a>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = activeSection === link.id;
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-6 py-2 text-xs font-montserrat font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'text-neon-blue' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {link.label}
                                    </a>
                                );
                            })}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={openCart}
                                className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-neon-blue/30 transition-all duration-300 group"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-neon-blue transition-colors">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-neon-blue text-[9px] font-black rounded-full text-white shadow-[0_0_15px_rgba(0,212,255,0.6)]">
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 transition-all duration-300"
                            >
                                <div className="w-5 flex flex-col gap-1.5 items-end">
                                    <span className={`block h-0.5 bg-gray-200 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2 w-5' : 'w-5'}`} />
                                    <span className={`block h-0.5 bg-gray-200 transition-all duration-300 ${mobileOpen ? 'opacity-0' : 'w-3'}`} />
                                    <span className={`block h-0.5 bg-gray-200 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2 w-5' : 'w-4'}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar (Direct Child of Fragment for Z-index & Clipping control) */}
            <div className={`fixed inset-0 z-[120] md:hidden transition-all duration-500 ${mobileOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                {/* Solid Backdrop */}
                <div
                    className={`absolute inset-0 bg-[#07070a]/98 backdrop-blur-xl transition-opacity duration-500 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                />

                {/* Solid Drawer Content */}
                <div className={`absolute top-0 left-0 bottom-0 w-full sm:w-[320px] bg-[#0d0d12] border-r border-white/5 flex flex-col p-6 transition-transform duration-501 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Stars Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className="navbar-star" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`
                            }} />
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-12 relative z-10 p-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 flex items-center justify-center border border-white/10">
                                <img src="/src/assets/logonobg.png" className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
                            </div>
                            <span className="font-montserrat font-black text-sm tracking-[0.2em] text-white uppercase italic">PRG <span className="text-neon-blue">RENTAL</span></span>
                        </div>
                        <button onClick={() => setMobileOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 relative z-10">
                        {navLinks.map((link, i) => {
                            const isActive = activeSection === link.id;
                            const linkColor = isActive ? '#00d4ff' : '#4b5563';
                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={handleNavClick}
                                    className={`group flex items-center gap-4 px-6 py-5 rounded-[22px] transition-all duration-500 ${isActive
                                        ? 'bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                                        : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                    style={{ transitionDelay: `${i * 100}ms` }}
                                >
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${isActive
                                        ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                                        : 'bg-white/5 text-gray-500 group-hover:text-white'
                                        }`}>
                                        {link.icon(isActive ? '#fff' : 'currentColor')}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-montserrat font-black text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                            {link.label}
                                        </span>
                                        <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${isActive ? 'text-neon-blue opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-60'}`}>
                                            {isActive ? 'Kamu di sini' : 'Lihat Bagian Ini'}
                                        </span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-10 relative z-10">
                        <div className="p-6 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex items-center gap-4 mb-5 transition-all duration-500">
                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10">
                                    <img src="/src/assets/logonobg.png" className="h-7 w-7 object-contain drop-shadow-[0_0_10px_rgba(0,212,255,0.4)]" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[12px] font-montserrat font-black tracking-widest text-white italic leading-none">
                                        PRG <span className="text-neon-blue">OFFICIAL</span>
                                    </p>
                                    <p className="text-[8px] text-gray-500 font-bold tracking-widest mt-1">EST. 2017</p>
                                </div>
                            </div>
                            <p className="text-[10px] leading-relaxed uppercase tracking-[0.3em] font-montserrat font-black italic bg-gradient-to-r from-neon-blue via-neon-purple to-neon-magenta bg-clip-text text-transparent animate-pulse whitespace-normal">
                                PRG WEBSITE OFFICIAL RENTAL PLAYSTATION
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .navbar-star { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; opacity: 0; animation: twinkle 4s infinite; }
                @keyframes twinkle { 
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
            `}</style>
        </>
    );
}
