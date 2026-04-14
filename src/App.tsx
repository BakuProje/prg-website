import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductCard, { VariantModal } from './components/ProductCatalog';
import CartModal from './components/CartModal';
import ContactSection from './components/ContactSection';
import Scene3D from './components/Scene3D';
import type { Product } from './types';

// Asset Imports
import tvOnlyImg from './assets/TV ONLY LANDSCAPE.jpg';
import tvAnalogImg from './assets/TV ANALOG.png';
import tvAndroidVideo from './assets/TV ANDROID.mp4';
import ps3TvImg from './assets/PS3 DAN TV LANDSCAPE.jpg';
import ps3Video from './assets/PS 3.mp4';
import ps3OnlyImg from './assets/PS 3 ONLY LANDSCAPE.jpg';
import ps4TvImg from './assets/PS4 DAN TV LANDSCAPE.jpg';
import ps4OfflineVideo from './assets/PS 4 OFFLINE.mp4';
import ps4OnlineVideo from './assets/PS 4 ONLINE.mp4';
import ps4OnlyImg from './assets/PS4 ONLY LANDSCAPE.jpg';
import playboxImg from './assets/PLAYBOX.jpeg';
import ps5Img from './assets/PS5.jpeg';

const products: Product[] = [
    {
        id: 'tv-only',
        name: 'TV Only',
        price: 60000,
        cover: tvOnlyImg,
        description: 'Sewa TV saja, cocok untuk yang sudah punya PS atau nonton film, nonton bola',
        rating: 4.8,
        hasVariant: true,
        variants: [
            {
                id: 'tv-analog',
                name: 'TV Analog',
                price: 60000,
                description: 'TV LED standar Cocok Mengunakan Set top box',
                cover: tvAnalogImg,
            },
            {
                id: 'tv-android',
                name: 'TV Android',
                price: 60000,
                description: 'Smart TV Android dengan fitur lengkap, bisa YouTube dan Netflix.',
                videoUrl: tvAndroidVideo,
            }
        ]
    },
    {
        id: 'ps3-tv',
        name: 'PS 3 + TV',
        price: 80000,
        cover: ps3TvImg,
        videoUrl: ps3Video,
        description: ' PS3 dengan TV dan stik di berikan 4, cocok bermain dengan teman/keluarga di rumah',
        rating: 5.0,
    },
    {
        id: 'ps3-only',
        name: 'PS 3 Only',
        price: 65000,
        cover: ps3OnlyImg,
        videoUrl: ps3Video,
        description: 'PS3 saja dan stik di berikan 4, tanpa TV. Cocok jika kamu sudah punya monitor atau TV sendiri.',
        rating: 4.9,
    },
    {
        id: 'ps4-tv',
        name: 'PS 4 + TV',
        price: 135000,
        cover: ps4TvImg,
        description: 'PS4 dengan TV dan . Tersedia pilihan offline dan online. Kamu menyesuaikan dengan kebutuhanmu.',
        hasVariant: true,
        rating: 5.0,
        variants: [
            {
                id: 'ps4-tv-offline',
                name: 'PS 4 OFFLINE + TV',
                price: 135000,
                videoUrl: ps4OfflineVideo,
                description: 'Main game offline tanpa internet. Cocok untuk single player dan co-op lokal. Nikmati game-game populer tanpa perlu koneksi internet.',
            },
            {
                id: 'ps4-tv-online',
                name: 'PS 4 ONLINE + TV',
                price: 135000,
                videoUrl: ps4OnlineVideo,
                description: 'Main game online dengan pemain lain dari seluruh dunia. Membutuhkan koneksi internet yang stabil untuk bermain secara online player.',
            },
        ],
    },
    {
        id: 'ps4-only',
        name: 'PS 4 Only',
        price: 100000,
        cover: ps4OnlyImg,
        description: 'PS4 saja tanpa TV dan stik di berikan 3 . Tersedia pilihan offline dan online. Kamu menyesuaikan dengan kebutuhanmu.',
        hasVariant: true,
        rating: 4.9,
        variants: [
            {
                id: 'ps4-only-offline',
                name: 'PS 4 OFFLINE (ONLY)',
                price: 100000,
                videoUrl: ps4OfflineVideo,
                description: 'Main game offline tanpa internet. Cocok untuk single player dan co-op lokal.',
            },
            {
                id: 'ps4-only-online',
                name: 'PS 4 ONLINE (ONLY)',
                price: 100000,
                videoUrl: ps4OnlineVideo,
                description: 'Main game online dengan pemain lain. Membutuhkan koneksi internet yang stabil untuk bermain secara online player.',
            },
        ],
    },
    {
        id: 'playbox',
        name: 'Playbox',
        price: 0,
        cover: playboxImg,
        description: 'Segera hadir! Playbox.',
        comingSoon: true,
        rating: 1.0,
    },
    {
        id: 'ps5',
        name: 'PS 5',
        price: 0,
        cover: ps5Img,
        description: 'Segera hadir! PlayStation 5.',
        comingSoon: true,
        rating: 1.0,
    },
];

export default function App() {
    return (
        <div className="min-h-screen bg-dark-900">
            <Navbar />
            <HeroSection />

            {/* Info Section - Product Catalog */}
            <section id="info" className="relative py-20 sm:py-28">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />

                <div className="absolute top-1/4 right-0 w-72 h-72 bg-neon-magenta/3 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-neon-blue/3 rounded-full blur-[120px]" />

                {/* 3D Scene Effect */}
                <div className="absolute inset-0 z-[2]">
                    <Scene3D />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Section Header */}
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-montserrat font-semibold tracking-[0.3em] uppercase text-neon-purple/70 mb-3">
                            Produk Rental
                        </span>
                        <h2 className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
                            Pilih <span className="gradient-text">Produk</span> Rental
                        </h2>
                        <p className="text-gray-400 font-inter text-base sm:text-lg max-w-xl mx-auto">
                            Tersedia berbagai paket rental PlayStation mulai dari TV,PS3,PS4.
                            Semua harga sudah termasuk perlengkapan lainnya.
                        </p>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
            {/* Modals */}
            <CartModal />
            <VariantModal />
        </div>
    );
}
