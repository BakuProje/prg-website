import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, XCircle, Eye, EyeOff, User, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import logoUrl from '../assets/logonobg.webp';
import bgDesktop from '../assets/bglogindekstop.png';
import bgMobile from '../assets/bgloginmobile.png';

export default function Login() {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    // Login Form State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Register Form State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let loginEmail = identifier.trim().toLowerCase();

            // Jika input bukan email (tidak mengandung @), cari email berdasarkan nama via RPC
            if (!loginEmail.includes('@')) {
                const { data: foundEmail, error: rpcError } = await supabase.rpc('get_email_from_name', {
                    search_name: loginEmail
                });

                if (rpcError || !foundEmail) {
                    throw new Error('Member dengan nama tersebut tidak ditemukan.');
                }
                loginEmail = foundEmail;
            }

            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            });

            if (authError) throw authError;

            // Check if account is confirmed by admin
            if (authData.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, email_confirmed_at, is_active')
                    .eq('id', authData.user.id)
                    .single();

                if (profile?.role !== 'admin' && !profile?.email_confirmed_at) {
                    await supabase.auth.signOut();
                    throw new Error('Akun Anda belum diverifikasi oleh Admin. Silakan tunggu konfirmasi admin PRG untuk mengaktifkan akun Anda.');
                }

                if (profile?.is_active === false) {
                    await supabase.auth.signOut();
                    throw new Error('Akun Anda telah dinonaktifkan oleh Admin. Hubungi pihak PRG untuk info lebih lanjut.');
                }
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Gagal login. Periksa kembali data Anda.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const trimmedName = regName.trim();
            const trimmedEmail = regEmail.trim().toLowerCase();

            if (trimmedName.length < 3) {
                throw new Error('Nama / Username minimal harus 3 karakter.');
            }

            if (regPassword.length < 6) {
                throw new Error('Password minimal harus 6 karakter.');
            }

            if (regPassword !== regConfirmPassword) {
                throw new Error('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
            }

            // Register user via Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: regPassword,
                options: {
                    data: {
                        full_name: trimmedName
                    }
                }
            });

            if (authError) throw authError;

            // Sign out immediately so unverified user doesn't stay in session
            await supabase.auth.signOut();

            setSuccessMessage('Pendaftaran akun member berhasil! Akun Anda sedang menunggu verifikasi & konfirmasi oleh Admin PRG sebelum dapat digunakan untuk login.');
            setRegName('');
            setRegEmail('');
            setRegPassword('');
            setRegConfirmPassword('');
            setActiveTab('login');
        } catch (err: any) {
            setError(err.message || 'Gagal mendaftar akun. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
            {/* Background Images for Desktop & Mobile */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <img
                    src={bgDesktop}
                    alt="Background Desktop"
                    className="hidden md:block w-full h-full object-cover object-center"
                />
                <img
                    src={bgMobile}
                    alt="Background Mobile"
                    className="block md:hidden w-full h-full object-cover object-center"
                />
            </div>

            {/* Login & Register Content without outer box container */}
            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                <div className="w-full px-2 sm:px-4">
                    {/* Header with Large Logo and Title */}
                    <div className="flex flex-col items-center mb-5">
                        <img
                            src={logoUrl}
                            alt="PRG Logo"
                            className="w-56 sm:w-64 md:w-72 h-auto object-contain -mb-2 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_30px_rgba(0,212,255,0.35)] hover:scale-105 transition-transform duration-300"
                        />
                        <h1 className="text-2xl sm:text-3xl font-montserrat font-black text-white uppercase italic tracking-wider text-center drop-shadow-md">
                            PRG <span className="text-neon-blue not-italic">LOYALTY</span>
                        </h1>
                        <p className="text-gray-300 text-xs sm:text-sm mt-1 font-medium tracking-wide text-center drop-shadow">
                            {activeTab === 'login' ? 'Masuk untuk melihat loyalty card Anda' : 'Daftarkan akun member baru Anda'}
                        </p>
                    </div>

                    {/* 2-Part Tab Switcher (Login Member / Daftar Member) */}
                    <div className="w-full bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 flex gap-1.5 mb-6 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('login'); setError(null); }}
                            className={`flex-1 py-3 px-4 rounded-xl font-montserrat font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'login'
                                ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/30 scale-[1.01]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <LogIn size={16} />
                            <span>Login Member</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('register'); setError(null); }}
                            className={`flex-1 py-3 px-4 rounded-xl font-montserrat font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'register'
                                ? 'bg-neon-blue text-white shadow-lg shadow-neon-blue/30 scale-[1.01]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <UserPlus size={16} />
                            <span>Daftar Member</span>
                        </button>
                    </div>

                    {/* FORM 1: LOGIN MEMBER */}
                    {activeTab === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4 w-full animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    USERNAME
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm sm:text-base shadow-lg"
                                        placeholder="Masukan Username atau Email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    PASSWORD
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm sm:text-base shadow-lg"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 z-10"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-neon-blue hover:bg-neon-blue-600 text-white font-montserrat font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl shadow-neon-blue/25 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'LOGIN'}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest drop-shadow">
                                    Belum punya akun? Klik <button type="button" onClick={() => setActiveTab('register')} className="text-neon-blue hover:underline">Daftar Member</button> di atas.
                                </p>
                            </div>
                        </form>
                    )}

                    {/* FORM 2: DAFTAR MEMBER */}
                    {activeTab === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4 w-full animate-in fade-in duration-300">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    USERNAME
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={regName}
                                        onChange={(e) => setRegName(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm shadow-lg"
                                        placeholder="Contoh: Kuzuroken"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    EMAIL AKTIF
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm shadow-lg"
                                        placeholder="nama@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    PASSWORD
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type={showRegPassword ? "text" : "password"}
                                        required
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm shadow-lg"
                                        placeholder="Minimal 6 karakter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegPassword(!showRegPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 z-10"
                                    >
                                        {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest ml-1 drop-shadow">
                                    KONFIRMASI PASSWORD
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-neon-blue transition-colors z-10 pointer-events-none" size={20} />
                                    <input
                                        type={showRegConfirmPassword ? "text" : "password"}
                                        required
                                        value={regConfirmPassword}
                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                        className="w-full bg-black/50 backdrop-blur-md border border-white/15 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/30 transition-all font-medium text-sm shadow-lg"
                                        placeholder="Ulangi password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 z-10"
                                    >
                                        {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-neon-blue hover:bg-neon-blue-600 text-white font-montserrat font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl shadow-neon-blue/25 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-3"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : 'DAFTAR SEKARANG'}
                            </button>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest drop-shadow">
                                    Akun baru akan diverifikasi oleh Admin sebelum dapat login.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Modern Success Modal */}
            {successMessage && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setSuccessMessage(null)} />
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-[40px] p-8 sm:p-10 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,212,255,0.15)] animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-green-500/20 bg-green-500/10 text-green-500 mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-500 shadow-2xl shadow-green-500/40">
                                <CheckCircle2 size={40} className="text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-montserrat font-black italic uppercase text-white mb-3 tracking-widest">
                            BERHASIL DAFTAR
                        </h3>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">
                            {successMessage}
                        </p>

                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="w-full group relative"
                        >
                            <div className="absolute inset-0 bg-neon-blue rounded-2xl blur-lg transition-opacity group-hover:opacity-100 opacity-50" />
                            <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 flex items-center justify-center">
                                <span>LANJUTKAN</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Modern Error Modal */}
            {error && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setError(null)} />
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-500">
                        {/* Status Icon with Ring */}
                        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-red-500/20 bg-red-500/10 text-red-500 mb-8 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20" />
                            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 shadow-2xl shadow-red-500/40">
                                <XCircle size={40} className="text-white" />
                            </div>
                        </div>

                        {/* Text Content */}
                        <h3 className="text-2xl font-montserrat font-black italic uppercase text-white mb-3 tracking-widest text-nowrap">
                            {error.includes('tidak ditemukan') ? 'NOT FOUND' :
                                error.includes('belum diverifikasi') || error.includes('belum dikonfirmasi') ? 'BELUM VERIFY' :
                                    'GAGAL'}
                        </h3>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                            {error === 'Invalid login credentials' ? 'Kredensial login tidak valid. Periksa kembali email/nama dan password Anda.' : error}
                        </p>

                        {/* Action Button */}
                        <button
                            onClick={() => setError(null)}
                            className="mt-10 w-full group relative"
                        >
                            <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg transition-opacity group-hover:opacity-100 opacity-50" />
                            <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 flex items-center justify-center">
                                <span>COBA LAGI</span>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
