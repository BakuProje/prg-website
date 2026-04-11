import Scene3D from './Scene3D';
import bannerUrl from '../assets/banner.jpg';
import gemboxUrl from '../assets/Gembox.png';
import logoUrl from '../assets/logonobg.png';

export default function HeroSection() {
    return (
        <section
            id="beranda"
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                {/* Desktop Background (Windows/PC) */}
                <img
                    src={bannerUrl}
                    alt="PlayStation Racing Game Desktop"
                    className="hidden md:block w-full h-full object-cover object-center"
                    loading="eager"
                />
                {/* Mobile Background (Android/Apple) */}
                <img
                    src={gemboxUrl}
                    alt="PlayStation Racing Game Mobile"
                    className="block md:hidden w-full h-full object-cover object-center"
                    loading="eager"
                />
                {/* Multi-layer overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-900/70 via-dark-900/80 to-dark-900" />
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
            </div>



            {/* 3D Scene */}
            <div className="absolute inset-0 z-[2]">
                <Scene3D />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/5 rounded-full blur-[100px] z-[1]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] z-[1]" />
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-neon-magenta/5 rounded-full blur-[80px] z-[1]" />

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
                {/* Logo Badge */}
                <div className="inline-flex items-center gap-3 glass-card px-5 py-2.5 rounded-full mb-8 animate-float">
                    <img
                        src={logoUrl}
                        alt="Logo"
                        className="h-8 w-8 object-contain"
                    />
                    <span className="text-sm font-inter font-medium text-gray-300 tracking-wider uppercase">
                        Rental PlayStation Keluar
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="font-montserrat font-black text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 tracking-tight">
                    <span className="block text-white">PLAYSTATION</span>
                    <span className="block gradient-text">RACING GAME</span>
                </h1>

                {/* Tagline */}
                <p className="font-inter text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Sewa PlayStation 3 & 4 dengan harga terjangkau. Nikmati pengalaman bermain sepuasanya
                    di rumah kamu.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                    <a
                        href="#info"
                        className="btn-neon text-xs sm:text-base px-4 sm:px-8 py-3.5 flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Produk Rental
                    </a>
                    <a
                        href="https://wa.me/6281527641306"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-xs sm:text-base px-4 sm:px-8 py-3.5 flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Whatsapp Kami
                    </a>
                </div>

                {/* Stats */}
                <div className="mt-16 flex justify-center items-center gap-8 sm:gap-16 max-w-lg mx-auto translate-x-2 sm:translate-x-0">
                    {[
                        { value: '1000+', label: 'Pelanggan' },
                        { value: '5+', label: 'Produk' },
                        { value: '24/7', label: 'Support' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center flex-1 sm:flex-none">
                            <div className="font-montserrat font-bold text-xl sm:text-2xl gradient-text">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 font-inter mt-1">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 animate-float">
                <span className="text-xs text-gray-500 font-inter tracking-widest uppercase">Scroll</span>
                <div className="w-5 h-8 rounded-full border border-gray-600 flex items-start justify-center p-1">
                    <div className="w-1 h-2 bg-gray-500 rounded-full animate-bounce" />
                </div>
            </div>
        </section>
    );
}
