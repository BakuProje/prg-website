import Scene3D from './Scene3D';

export default function ContactSection() {
    return (
        <section id="contact" className="relative py-20 sm:py-28 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-neon-blue/3 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/3 rounded-full blur-[120px]" />

            {/* 3D Scene Effect */}
            <div className="absolute inset-0 z-[2]">
                <Scene3D />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="inline-block text-xs font-montserrat font-semibold tracking-[0.3em] uppercase text-neon-blue/70 mb-3">
                        Hubungi Kami
                    </span>
                    <h2 className="font-montserrat font-black text-3xl sm:text-4xl md:text-5xl text-white mb-4">
                        Contact
                    </h2>
                    <p className="text-gray-400 font-inter text-base sm:text-lg max-w-xl mx-auto">
                        Ada pertanyaan atau ingin langsung memesan? Hubungi kami melalui WhatsApp
                        atau kunjungi langsung lokasi kami.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info Card */}
                    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                        {/* WhatsApp */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-montserrat font-bold text-white text-base">
                                        WhatsApp
                                    </h3>
                                </div>
                            </div>
                            <a
                                href="https://wa.me/6282349918631"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl font-montserrat font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                    boxShadow: '0 0 15px rgba(37, 211, 102, 0.2)',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Chat via WhatsApp
                            </a>
                        </div>

                        {/* Instagram */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-neon-magenta/10 flex items-center justify-center flex-shrink-0">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon-magenta">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-montserrat font-bold text-white text-base">
                                        Instagram
                                    </h3>
                                </div>
                            </div>
                            <a
                                href="https://www.instagram.com/prgrental/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 rounded-xl font-montserrat font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                    boxShadow: '0 0 15px rgba(220, 39, 67, 0.2)',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                                Follow Instagram
                            </a>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neon-blue">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-montserrat font-bold text-white text-base">
                                    PS Gaming (Rental PS3 dan PS4)
                                </h3>
                                <p className="text-gray-400 font-inter text-[10px] mt-0.5 uppercase font-bold tracking-wider leading-relaxed">
                                    Jl. Sukamaju I No.2B, Tamamaung,<br />
                                    Kec. Panakkukang, Kota Makassar 90231
                                </p>
                            </div>
                        </div>

                        {/* Operating Hours */}
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-neon-purple">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-montserrat font-bold text-white text-base">
                                    Jam Operasional
                                </h3>
                                <p className="text-gray-400 font-inter text-sm mt-0.5">
                                    Setiap hari, 10:00 - 22:00 WITA
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3973.7702!2d119.4421264!3d-5.1406384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNcKwMDgnMjYuMyJTIDExOcKwMjYnMzEuNyJF!5e0!3m2!1sid!2sid!4v1714460000000!5m2!1sid!2sid"
                            width="100%"
                            height="300"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full min-h-[300px]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
