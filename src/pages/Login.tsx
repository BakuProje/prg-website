import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft, XCircle, Eye, EyeOff } from 'lucide-react';
import logoUrl from '../assets/logonobg.png';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
                    .select('role, email_confirmed_at')
                    .eq('id', authData.user.id)
                    .single();

                if (profile?.role !== 'admin' && !profile?.email_confirmed_at) {
                    await supabase.auth.signOut();
                    throw new Error('Akun Anda belum dikonfirmasi oleh Admin. Silahkan hubungi admin PRG untuk mengaktifkan akun.');
                }
            }

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Gagal login. Periksa kembali data Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px]" />
            </div>

            <button
                onClick={() => navigate('/')}
                className="absolute top-8 left-8 hidden lg:flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-bold text-xs uppercase tracking-widest">Kembali</span>
            </button>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center border border-white/10 mb-6 shadow-lg shadow-neon-blue/10">
                            <img src={logoUrl} alt="PRG Logo" className="w-14 h-14 object-contain" />
                        </div>
                        <h1 className="text-3xl font-montserrat font-black text-white uppercase italic tracking-wider">
                            PRG <span className="text-neon-blue text-2xl not-italic">LOYALTY</span>
                        </h1>
                        <p className="text-gray-400 text-sm mt-2 font-medium">Masuk untuk melihat loyalty card Anda</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">USERNAME</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all font-medium"
                                    placeholder="Masukan Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neon-blue hover:bg-neon-blue-600 text-white font-montserrat font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-lg shadow-neon-blue/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Login'}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                            Hanya admin yang dapat membuat akun member.
                        </p>
                    </div>
                </div>
            </div>
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
                                error.includes('belum dikonfirmasi') ? 'BELUM VERIFY' :
                                    'LOGIN GAGAL'}
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
