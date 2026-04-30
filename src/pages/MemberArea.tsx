import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    Camera,
    CheckCircle2,
    AlertCircle,
    Gamepad2,
    MapPin,
    ShieldCheck,
    Bell,
    User,
    Calendar,
    ChevronRight,
    X,
    MessageSquare,
    RotateCcw,
    Trash2,
    Check,
    Percent,
    ShieldAlert
} from 'lucide-react';
import ChatLoyalty from '../components/ChatLoyalty';
import CameraVerification from '../components/CameraVerification';
import type { LoyaltyCard, Profile } from '../types/member';
import logoUrl from '../assets/logonobg.png';

// Role Badge Assets
import PlayerBadge from '../assets/Player Role.png';
import MemberBadge from '../assets/Member Role.png';
import SubscriberBadge from '../assets/Subscriber Role.png';

function NotificationItem({ v, onDelete }: { v: any, onDelete: () => void }) {
    const [startX, setStartX] = React.useState(0);
    const [offsetX, setOffsetX] = React.useState(0);
    const [isSwiping, setIsSwiping] = React.useState(false);

    // Unified handlers for both Touch and Mouse
    const handleStart = (clientX: number) => {
        setStartX(clientX);
        setIsSwiping(true);
    };

    const handleMove = (clientX: number) => {
        if (!isSwiping) return;
        const diff = clientX - startX;
        // Only allow swiping to the left
        if (diff < 0) {
            setOffsetX(diff);
        }
    };

    const handleEnd = () => {
        if (!isSwiping) return;
        setIsSwiping(false);
        if (offsetX < -120) {
            setOffsetX(-500); // Fly out
            setTimeout(onDelete, 300);
        } else {
            setOffsetX(0);
        }
    };

    const isSystemNotif = !!v.title;

    return (
        <div className="relative overflow-hidden group/notif rounded-3xl select-none cursor-grab active:cursor-grabbing">
            {/* Background Red for Delete */}
            <div className="absolute inset-0 bg-red-600 flex items-center justify-end px-8 rounded-3xl">
                <div className="flex flex-col items-center gap-1 text-white">
                    <Trash2 size={24} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Hapus</span>
                </div>
            </div>

            <div
                className="relative bg-[#0d0d12] transition-all duration-300"
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                style={{
                    transform: `translateX(${offsetX}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all pointer-events-none">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${isSystemNotif
                                ? (v.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                    v.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                        v.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                            'bg-neon-blue/10 border-neon-blue/20 text-neon-blue')
                                : (v.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                    v.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-500')
                            }`}>
                            {isSystemNotif
                                ? (v.type === 'success' ? <ShieldCheck size={24} /> : <AlertCircle size={24} />)
                                : (v.status === 'approved' ? <ShieldCheck size={24} /> :
                                    v.status === 'rejected' ? <ShieldAlert size={24} /> :
                                        <RotateCcw size={24} className="animate-spin-slow" />)}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isSystemNotif
                                            ? (v.type === 'success' ? 'text-green-500' : v.type === 'warning' ? 'text-yellow-500' : 'text-neon-blue')
                                            : (v.status === 'approved' ? 'text-green-500' : v.status === 'rejected' ? 'text-red-500' : 'text-yellow-500')
                                        }`}>
                                        {isSystemNotif ? v.title : (v.status === 'approved' ? 'Diterima' : v.status === 'rejected' ? 'Ditolak' : 'Sedang Diproses')}
                                    </p>
                                    {!v.is_read && (
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(0,212,255,0.8)] animate-pulse" />
                                    )}
                                </div>
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">
                                    {new Date(v.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-white font-bold leading-relaxed mb-2">
                                {isSystemNotif ? v.message : (v.status === 'approved' ? 'Selamat! Verifikasi kamu telah disetujui admin. Slot loyalty kamu telah bertambah.' :
                                    v.status === 'rejected' ? 'Maaf, verifikasi kamu ditolak admin. Pastikan foto dan lokasi terlihat jelas.' :
                                        'Admin sedang meninjau foto verifikasi kamu. Mohon tunggu sebentar.')}
                            </p>
                            {!isSystemNotif && (
                                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                                    <MapPin size={10} className="text-neon-blue" />
                                    <span className="truncate">{v.location_name || 'Lokasi tidak diketahui'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MemberArea() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState<'dashboard' | 'instructions' | 'profile'>('dashboard');
    const [badgeZoomOpen, setBadgeZoomOpen] = useState(false);
    const [modal, setModal] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string } | null>(null);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMenuOpen, setChatMenuOpen] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
    const [isAccountDeleted, setIsAccountDeleted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                fetchUserData();
            } else if (event === 'SIGNED_OUT') {
                navigate('/login');
            }
        });

        // Initial check if session already exists
        const checkInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                fetchUserData();
            } else {
                // Wait a bit to ensure it's not just loading
                setTimeout(async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) navigate('/login');
                }, 1000);
            }
        };

        checkInitialSession();

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!profile) return;

        // Heartbeat for last_seen
        const updateLastSeen = async () => {
            await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', profile.id);
        };
        updateLastSeen();
        const heartbeat = setInterval(updateLastSeen, 30000);

        // Subscribe to verifications
        const channel = supabase
            .channel(`user-verifications-${profile.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'verifications',
                filter: `user_id=eq.${profile.id}`
            }, () => {
                fetchUserData();
            })
            .subscribe();

        // Subscribe to notifications
        const notifChannel = supabase
            .channel(`user-notifications-${profile.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${profile.id}`
            }, () => {
                fetchUserData();
            })
            .subscribe();

        // Subscribe to loyalty card changes (Important for Reset Slot)
        const loyaltyChannel = supabase
            .channel(`user-loyalty-${profile.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'loyalty_cards',
                filter: `user_id=eq.${profile.id}`
            }, () => {
                fetchUserData();
            })
            .subscribe();

        // Subscribe to profile deletion
        const deleteChannel = supabase
            .channel(`user-delete-${profile.id}`)
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${profile.id}`
            }, () => {
                setIsAccountDeleted(true);
            })
            .subscribe();

        return () => {
            clearInterval(heartbeat);
            supabase.removeChannel(channel);
            supabase.removeChannel(notifChannel);
            supabase.removeChannel(loyaltyChannel);
            supabase.removeChannel(deleteChannel);
        };
    }, [profile]);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    const fetchUserData = async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            let currentUser: any = sessionData?.session?.user;

            if (!currentUser) {
                const { data: userData } = await supabase.auth.getUser();
                currentUser = userData?.user;
            }

            if (!currentUser) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();

            if (!profileData) {
                setIsAccountDeleted(true);
                return;
            }

            if (profileData.role === 'admin') {
                navigate('/admin');
                return;
            }

            const { data: cardData } = await supabase
                .from('loyalty_cards')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            const { data: verifData, error: verifError } = await supabase
                .from('verifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            const { data: notifData } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (verifError) console.error('Verif error:', verifError);

            setProfile(profileData);
            setLoyaltyCard(cardData);

            // Merge and sort all notifications
            const combined = [...(verifData || []), ...(notifData || [])].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setVerifications(combined);

            // Robust Unread Check (Check whole DB, not just top 10)
            const { count: unreadNotifCount } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id)
                .eq('is_read', false);

            const { count: unreadVerifCount } = await supabase
                .from('verifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id)
                .eq('is_read', false);

            setHasUnread(((unreadNotifCount || 0) + (unreadVerifCount || 0)) > 0);

            // Fetch Admin Profile and Status
            const { data: admins } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'admin')
                .limit(1);

            if (admins && admins.length > 0) {
                const admin = { ...admins[0], full_name: 'PRG ADMIN' } as Profile;
                setAdminProfile(admin);

                if (admins[0].last_seen) {
                    const lastSeen = new Date(admins[0].last_seen).getTime();
                    const now = new Date().getTime();
                    setAdminOnline(now - lastSeen < 60000); // 1 minute
                }
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            // Optimistic update
            setVerifications(prev => prev.filter(v => v.id !== id));

            const isSystemNotif = !!verifications.find(v => v.id === id)?.title;
            const table = isSystemNotif ? 'notifications' : 'verifications';

            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('DB Delete Error:', error);
                // Revert if error
                fetchUserData();
                throw error;
            }
        } catch (err: any) {
            console.error('Error deleting notification:', err);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const markNotificationsAsRead = async () => {
        if (!profile) return;

        try {
            // Update in DB
            await Promise.all([
                supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('user_id', profile.id)
                    .eq('is_read', false),
                supabase
                    .from('verifications')
                    .update({ is_read: true })
                    .eq('user_id', profile.id)
                    .eq('is_read', false)
            ]);

            // Update local state
            setVerifications(prev => prev.map(v => ({ ...v, is_read: true })));
            setHasUnread(false);
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const onCapture = async (blob: Blob, metadata: any) => {
        if (!profile) return;

        try {
            // 1. Upload photo to Supabase Storage
            const fileName = `${profile.id}/${Date.now()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('verifications')
                .upload(fileName, blob);

            if (uploadError) throw uploadError;

            // 2. Create verification request
            const { error: dbError } = await supabase
                .from('verifications')
                .insert({
                    user_id: profile.id,
                    photo_url: uploadData.path,
                    location_name: metadata.location,
                    captured_at: metadata.captured_at,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            setModal({
                show: true,
                type: 'success',
                title: 'Berhasil!',
                message: 'Foto berhasil dikirim! Tunggu verifikasi admin untuk penambahan slot.'
            });
            setShowCamera(false);
        } catch (err: any) {
            console.error('Error submitting verification:', err);
            setModal({
                show: true,
                type: 'error',
                title: 'Gagal Mengirim',
                message: err.message === 'Bucket not found'
                    ? 'Folder penyimpanan foto belum dibuat di database. Mohon hubungi admin.'
                    : err.message
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (profile && profile.is_active === false) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-8">
                    <ShieldAlert size={48} />
                </div>
                <h1 className="text-3xl font-montserrat font-black italic uppercase text-white mb-4 tracking-widest">Akun Nonaktif</h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                    Maaf, akun kamu saat ini telah dinonaktifkan oleh Admin PRG. Silahkan hubungi admin untuk informasi lebih lanjut.
                </p>
                <button
                    onClick={handleLogout}
                    className="mt-10 px-10 py-4 rounded-2xl bg-white/5 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs transition-all border border-white/10 hover:border-red-500"
                >
                    Keluar Sesi
                </button>
            </div>
        );
    }

    const renderAvatar = (id: string | undefined, size: number = 24, className: string = "") => {
        const iconProps = { size, className };
        switch (id) {
            case '1': return <User {...iconProps} />;
            case '2': return <Gamepad2 {...iconProps} />;
            case '3': return <ShieldCheck {...iconProps} />;
            case '4': return <RotateCcw {...iconProps} />;
            case '5': return <Bell {...iconProps} />;
            case 'logo': return <img src={logoUrl} className={`object-contain ${className}`} style={{ width: size, height: size }} />;
            default: return <User {...iconProps} />;
        }
    };

    const slots = Array.from({ length: 8 }, (_, i) => i < (loyaltyCard?.slots_filled || 0));
    const currentSlots = loyaltyCard?.slots_filled || 0;
    const activeReward = currentSlots >= 8 ? 'FREE 1 HARI' : currentSlots >= 4 ? 'DISCOUNT 10RB' : null;

    return (
        <div className="min-h-screen bg-dark-950 pb-8 pt-16">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-[#0d0d14]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <img src={logoUrl} className="h-8" alt="Logo" />
                    <span className="font-montserrat font-black text-xs tracking-widest italic uppercase text-white">PRG <span className="text-neon-blue">{profile?.membership_role || 'MEMBER'}</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setShowNotifications(true);
                            markNotificationsAsRead();
                        }}
                        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 active:scale-95 transition-all"
                    >
                        <Bell size={18} className={hasUnread ? 'animate-bounce text-neon-blue' : ''} />
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.8)]"></span>
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all"
                    >
                        <div className="w-5 flex flex-col gap-1.5 items-end">
                            <span className="block h-0.5 w-5 bg-gray-300" />
                            <span className="block h-0.5 w-3 bg-gray-300" />
                            <span className="block h-0.5 w-4 bg-gray-300" />
                        </div>
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            <div className={`fixed inset-0 z-[120] transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                {/* Solid Backdrop */}
                <div
                    className={`absolute inset-0 bg-[#07070a]/98 backdrop-blur-xl transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <aside className={`fixed top-0 left-0 bottom-0 w-full sm:w-[320px] bg-[#0d0d12] border-r border-white/5 transition-transform duration-501 ease-[cubic-bezier(0.16,1,0.3,1)] z-[130] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col p-6 overflow-hidden">
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

                        <div className="flex items-center justify-between mb-8 relative z-10 p-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                    <img
                                        src={
                                            profile?.membership_role === 'subscriber' ? SubscriberBadge :
                                                profile?.membership_role === 'member' ? MemberBadge :
                                                    PlayerBadge
                                        }
                                        className="w-8 h-8 object-contain"
                                        alt="Role Badge"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-montserrat font-black text-xs tracking-[0.1em] text-white uppercase italic leading-none">{profile?.full_name.split(' ')[0]}</span>
                                    <span className="text-[7px] text-neon-blue font-bold tracking-[0.2em] uppercase mt-1">PRG <span className="text-white">{profile?.membership_role || 'PLAYER'}</span></span>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90">
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2 relative z-10 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                            {/* 1. PROFIL SAYA */}
                            <button
                                onClick={() => { setActiveView('profile'); setMobileMenuOpen(false); }}
                                className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] border border-transparent transition-all duration-500 ${activeView === 'profile' ? 'bg-neon-blue/10 border-neon-blue/20' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeView === 'profile' ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={`font-montserrat font-black text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${activeView === 'profile' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                        Profil
                                    </span>
                                    <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase mt-1">Akun & Role</span>
                                </div>
                            </button>

                            {/* 2. DASHBOARD MEMBER */}
                            <button
                                onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                                className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] border border-transparent transition-all duration-500 ${activeView === 'dashboard' ? 'bg-neon-blue/10 border-neon-blue/20' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeView === 'dashboard' ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={`font-montserrat font-black text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${activeView === 'dashboard' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                        Dashboard {profile?.membership_role || 'Member'}
                                    </span>
                                    <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase mt-1">Status & Loyalty</span>
                                </div>
                            </button>

                            {/* 3. CARA Verify */}
                            <button
                                onClick={() => { setActiveView('instructions'); setMobileMenuOpen(false); }}
                                className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] border border-transparent transition-all duration-500 ${activeView === 'instructions' ? 'bg-neon-blue/10 border-neon-blue/20' : 'hover:bg-white/5'}`}
                            >
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeView === 'instructions' ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                    <AlertCircle size={20} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className={`font-montserrat font-black text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${activeView === 'instructions' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                        Cara Verify
                                    </span>
                                    <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase mt-1">Panduan & Video</span>
                                </div>
                            </button>

                            {/* 4. CHAT ADMIN */}
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => setChatMenuOpen(prev => !prev)}
                                    className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] border border-transparent transition-all duration-500 ${chatMenuOpen || showChat ? 'bg-neon-blue/10 border-neon-blue/20' : 'hover:bg-white/5'}`}
                                >
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${chatMenuOpen || showChat ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.4)]' : 'bg-white/5 text-gray-500 group-hover:text-white'}`}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="flex flex-col text-left flex-1">
                                        <span className={`font-montserrat font-black text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${chatMenuOpen || showChat ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                            Chat Admin
                                        </span>
                                        <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase mt-1">PRG Official Chat</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-gray-600 transition-transform duration-300 ${chatMenuOpen ? 'rotate-90' : ''}`} />
                                </button>

                                {/* Sub-menu */}
                                {chatMenuOpen && (
                                    <div className="ml-8 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {/* WhatsApp */}
                                        <button
                                            onClick={() => {
                                                window.open('https://wa.me/628234998631', '_blank');
                                                setMobileMenuOpen(false);
                                            }}
                                            className="group flex items-center gap-3 px-5 py-3 rounded-2xl border border-transparent hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-300"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-montserrat font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 group-hover:text-green-500 transition-colors">WhatsApp</span>
                                                <span className="text-[7px] text-gray-600 font-bold tracking-widest uppercase">Chat via WA</span>
                                            </div>
                                        </button>

                                        {/* Website Chat */}
                                        <button
                                            onClick={() => { setShowChat(true); setMobileMenuOpen(false); setChatMenuOpen(false); }}
                                            className="group flex items-center gap-3 px-5 py-3 rounded-2xl border border-transparent hover:bg-neon-blue/10 hover:border-neon-blue/20 transition-all duration-300"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-neon-blue/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue group-hover:text-white transition-all duration-300">
                                                <MessageSquare size={16} />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-montserrat font-black text-[10px] uppercase tracking-[0.15em] text-gray-400 group-hover:text-neon-blue transition-colors">Website</span>
                                                <span className="text-[7px] text-gray-600 font-bold tracking-widest uppercase">Chat di Sini</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* 5. HALAMAN UTAMA */}
                            <button
                                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                                className="group flex items-center gap-4 px-6 py-4 rounded-[22px] border border-transparent hover:bg-white/5 transition-all duration-500"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-all duration-500 scale-90 group-hover:scale-100">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-montserrat font-black text-xs uppercase tracking-[0.15em] text-gray-500 group-hover:text-white transition-colors duration-300">
                                        Halaman Utama
                                    </span>
                                    <span className="text-[8px] text-gray-600 font-bold tracking-widest uppercase mt-1">Kembali Ke Awal</span>
                                </div>
                            </button>

                            {/* 5. KELUAR AKUN */}
                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 mt-2 w-full"
                            >
                                <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-500/20">
                                    <LogOut size={20} />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-montserrat font-black text-sm uppercase tracking-[0.15em] text-red-500 group-hover:text-red-400 transition-colors duration-300">
                                        Keluar Akun
                                    </span>
                                    <span className="text-[9px] font-bold tracking-widest text-red-500/50 opacity-100 uppercase mt-1">
                                        Selesai Sesi
                                    </span>
                                </div>
                            </button>
                        </nav>

                        <div className="mt-auto pt-4 relative z-10">
                            {/* Logout button moved here for cleaner look if needed, or keep empty */}
                        </div>
                    </div>
                </aside>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                    .navbar-star { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; opacity: 0; animation: twinkle 4s infinite; }
                    @keyframes twinkle { 
                        0%, 100% { opacity: 0; transform: scale(0.5); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                `}</style>
            </div>

            {/* Notifications Panel */}
            <div className={`fixed inset-0 z-[1000] transition-all duration-500 ${showNotifications ? 'visible' : 'invisible pointer-events-none'}`}>
                <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${showNotifications ? 'opacity-100' : 'opacity-0'}`} onClick={() => setShowNotifications(false)} />
                <div className={`absolute top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[#0d0d12] border-l border-white/5 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                                <Bell size={20} className="text-neon-blue" />
                            </div>
                            <h3 className="text-lg font-montserrat font-black italic uppercase text-white tracking-widest">Notifikasi</h3>
                        </div>
                        <button onClick={() => setShowNotifications(false)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {verifications.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Bell size={48} className="mb-4 text-gray-500" />
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Belum ada aktivitas</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {verifications.map((v) => (
                                    <NotificationItem
                                        key={v.id}
                                        v={v}
                                        onDelete={() => handleDeleteNotification(v.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 mt-8 pb-10">
                {activeView === 'dashboard' ? (
                    <div key="dashboard-view" className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {/* Welcome Card Premium */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-20 blur-3xl -z-10 group-hover:opacity-30 transition-opacity duration-700" />
                            <div className="relative p-6 sm:p-8 rounded-[40px] bg-[#0d0d12]/80 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl">
                                {/* Decorative Background Patterns */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px]" />

                                {/* Stars Effect inside Welcome Card */}
                                <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                                    {[...Array(15)].map((_, i) => (
                                        <div key={i} className="navbar-star" style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 5}s`
                                        }} />
                                    ))}
                                </div>

                                { }
                                <div className="absolute top-4 right-3 w-16 h-16 sm:w-28 sm:h-28 z-20">
                                    <div className="relative w-full h-full flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="50%" cy="50%" r="42%" className="fill-none stroke-white/5 stroke-[4px] sm:stroke-[8px]" />
                                            <circle
                                                cx="50%" cy="50%" r="42%"
                                                className="fill-none stroke-neon-blue stroke-[4px] sm:stroke-[8px] transition-all duration-1000 ease-out"
                                                strokeDasharray={`${(currentSlots / 8) * 264}% 264%`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-sm sm:text-xl font-montserrat font-black text-white leading-none">
                                                {Math.round((currentSlots / 8) * 100)}<span className="text-[10px] sm:text-sm">%</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-6 bg-neon-blue rounded-full" />
                                        <h2 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">{profile?.membership_role || 'Member'} Dashboard</h2>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <p className="text-white/60 text-xs sm:text-sm font-bold">Selamat Datang,</p>
                                        <h1 className="text-2xl sm:text-4xl font-montserrat font-black text-white italic tracking-wider uppercase leading-tight pr-16 sm:pr-24">
                                            {profile?.full_name?.split(' ')[0]} <br className="sm:hidden" />
                                            <span className="text-neon-blue">{profile?.full_name?.split(' ').slice(1).join(' ')}</span>
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-white/5 backdrop-blur-md px-2.5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2 group/stat">
                                            <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex-shrink-0 flex items-center justify-center text-neon-blue group-hover/stat:scale-110 transition-transform">
                                                <Gamepad2 size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[6.5px] sm:text-[8px] text-gray-500 font-black uppercase tracking-wider whitespace-nowrap">Total Rental</p>
                                                <p className="text-[9px] sm:text-xs text-white font-black uppercase tracking-wider">{loyaltyCard?.total_rentals || 0} Rental</p>
                                            </div>
                                        </div>

                                        {activeReward ? (
                                            <div className="bg-neon-green/5 backdrop-blur-md px-2.5 py-2.5 rounded-2xl border border-neon-green/20 flex items-center gap-2 animate-pulse">
                                                <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex-shrink-0 flex items-center justify-center text-neon-green">
                                                    <Percent size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[6.5px] sm:text-[8px] text-neon-green font-black uppercase tracking-wider whitespace-nowrap">Status Diskon</p>
                                                    <p className="text-[9px] sm:text-xs text-neon-green font-black uppercase tracking-wider">{activeReward} Aktif</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 backdrop-blur-md px-2.5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2 opacity-60">
                                                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex-shrink-0 flex items-center justify-center text-gray-500">
                                                    <Percent size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[6.5px] sm:text-[8px] text-gray-500 font-black uppercase tracking-wider whitespace-nowrap">Status Diskon</p>
                                                    <p className="text-[9px] sm:text-xs text-gray-500 font-black uppercase tracking-wider">Belum Ada</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-white font-montserrat font-black text-xs sm:text-sm uppercase tracking-widest italic">Loyalty Card</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{currentSlots} / 8 Terisi</span>
                                </div>
                            </div>

                            <div className="relative group perspective-1000">
                                {/* Main Card */}
                                <div className="bg-[#0d0d12] rounded-[40px] sm:rounded-[48px] p-6 sm:p-8 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-700 group-hover:border-neon-blue/30 group-hover:shadow-[0_40px_80px_-16px_rgba(0,212,255,0.15)]">

                                    {/* Premium Background Effects */}
                                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-neon-blue/10 rounded-full blur-[100px] animate-pulse" />
                                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-neon-purple/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

                                    {/* Glassmorphism Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-scanline opacity-[0.02] pointer-events-none" />

                                    {/* Stars Effect inside Card */}
                                    <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="navbar-star" style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                                animationDelay: `${Math.random() * 5}s`
                                            }} />
                                        ))}
                                    </div>

                                    <div className="relative">
                                        {/* Center Logo Watermark - Positioned specifically behind the 8 slots grid */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                            <img
                                                src={logoUrl}
                                                className="w-full sm:w-4/5 opacity-[0.08] group-hover:scale-110 transition-all duration-1000"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-3 sm:gap-6 relative z-10">
                                            {slots.map((filled, i) => (
                                                <div
                                                    key={i}
                                                    className="relative group/slot"
                                                >
                                                    <div className={`aspect-square rounded-[20px] sm:rounded-[32px] flex items-center justify-center transition-all duration-700 transform ${filled
                                                        ? 'bg-white/5 border border-white/10 scale-100'
                                                        : 'bg-black/40 border border-white/5 hover:border-white/10 scale-95'
                                                        }`}>
                                                        {filled ? (
                                                            <div className="relative">
                                                                <img src={logoUrl} alt="Logo" className="w-12 h-12 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-700 font-montserrat font-black text-sm sm:text-2xl transition-colors duration-500 group-hover/slot:text-gray-500">{i + 1}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 relative z-10">
                                        <div className="w-full sm:w-auto space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-4 bg-neon-blue rounded-full" />
                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Reward Card</p>
                                            </div>
                                            <div className="flex justify-between sm:justify-start gap-4 sm:gap-6">
                                                <div className={`transition-all duration-500 ${currentSlots >= 4 ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                                                    <p className="text-[9px] sm:text-[10px] text-white font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        4x Rental {currentSlots >= 4 && <CheckCircle2 size={10} className="text-neon-green" />}
                                                    </p>
                                                    <p className="text-neon-blue text-xs sm:text-sm font-black italic tracking-wider">DISCOUNT 10RB</p>
                                                    <p className="text-[7px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">Terbuka setelah x4 Rental</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/5" />
                                                <div className={`transition-all duration-500 ${currentSlots >= 8 ? 'opacity-100 scale-105' : 'opacity-40'}`}>
                                                    <p className="text-[9px] sm:text-[10px] text-white font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                        8x Rental {currentSlots >= 8 && <CheckCircle2 size={10} className="text-neon-green" />}
                                                    </p>
                                                    <p className="text-neon-blue text-xs sm:text-sm font-black italic tracking-wider">FREE 1 HARI</p>
                                                    <p className="text-[7px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">Terbuka setelah x8 Rental</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative z-[60] group/btn-container">
                                            <div className="absolute inset-0 bg-neon-blue/20 blur-2xl rounded-full animate-pulse" />
                                            <button
                                                onClick={() => setShowCamera(true)}
                                                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] sm:rounded-[28px] bg-white text-black flex items-center justify-center hover:bg-neon-blue hover:text-white transition-all duration-500 active:scale-90 shadow-[0_12px_24px_-8px_rgba(255,255,255,0.4)] group/btn overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-200 group-hover/btn:from-neon-blue group-hover/btn:to-neon-purple transition-all duration-500" />
                                                <Camera size={32} className="relative z-10 group-hover/btn:scale-110 transition-transform duration-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeView === 'profile' ? (
                    <div className="animate-modal-fade space-y-8 py-4 sm:py-0">
                        <div className="relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <button
                                        onClick={() => setBadgeZoomOpen(true)}
                                        className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img
                                            src={
                                                profile?.membership_role === 'subscriber' ? SubscriberBadge :
                                                    profile?.membership_role === 'member' ? MemberBadge :
                                                        PlayerBadge
                                            }
                                            className="w-11 h-11 object-contain transition-transform group-hover:rotate-6"
                                            alt="Role Badge"
                                        />
                                    </button>
                                    <div>
                                        <h3 className="text-white font-montserrat font-black text-xl uppercase tracking-widest italic">Profil Saya</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">
                                            {profile?.membership_role === 'player' ? 'Kelola Akun Loyalty' : 'Kelola Akun PRG'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    {/* Account Info */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Informasi Akun</h4>
                                        <div className="space-y-4">
                                            {/* Name (Static) */}
                                            <div className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-gray-500">
                                                    <User size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Nama Lengkap</p>
                                                    <p className="text-xs text-white font-black uppercase tracking-wider mt-0.5">{profile?.full_name}</p>
                                                </div>
                                            </div>

                                            {/* Email (Static) */}
                                            <div className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-gray-500">
                                                    <Bell size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Email Address</p>
                                                    <p className="text-xs text-white font-black tracking-wider mt-0.5">{profile?.email}</p>
                                                </div>
                                            </div>

                                            {/* Member Since */}
                                            <div className="p-5 rounded-[28px] bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-gray-500">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Member Sejak</p>
                                                    <p className="text-xs text-white font-black uppercase tracking-wider mt-0.5">
                                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Membership Role Badge */}
                                            <div className="p-6 rounded-[32px] bg-gradient-to-br from-neon-blue/10 to-transparent border border-neon-blue/20 flex items-center justify-between group overflow-hidden relative">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="w-14 h-14 rounded-2xl bg-black/60 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                                        <img
                                                            src={
                                                                profile?.membership_role === 'subscriber' ? SubscriberBadge :
                                                                    profile?.membership_role === 'member' ? MemberBadge :
                                                                        PlayerBadge
                                                            }
                                                            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                                            alt="Role Badge"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="text-[9px] text-neon-blue font-black uppercase tracking-[0.3em]">Role Status</p>
                                                        <p className="text-sm text-white font-black uppercase tracking-widest italic mt-1 group-hover:translate-x-1 transition-transform">
                                                            {profile?.membership_role || 'Player'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="relative z-10">
                                                    <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 ${(profile?.is_active ?? true)
                                                            ? 'bg-green-500/10 border-green-500/20'
                                                            : 'bg-red-500/10 border-red-500/20'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${(profile?.is_active ?? true) ? 'bg-green-500' : 'bg-red-500'
                                                            }`} />
                                                        <span className={`text-[8px] font-black uppercase tracking-widest ${(profile?.is_active ?? true) ? 'text-green-500' : 'text-red-500'
                                                            }`}>
                                                            {(profile?.is_active ?? true) ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-modal-fade space-y-8 py-4 sm:py-0">
                        <div className="relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-montserrat font-black text-xl uppercase tracking-widest italic">Cara Verify</h3>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Panduan Verify PRG</p>
                                    </div>
                                </div>

                                {/* Video Placeholder - COMING SOON */}
                                <div className="aspect-video w-full bg-white/[0.02] rounded-[40px] border border-white/5 overflow-hidden relative group/video mb-12 shadow-inner">
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700 border border-white/5">
                                            <RotateCcw size={24} className="animate-spin-slow opacity-20" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <p className="text-[10px] text-neon-blue font-black uppercase tracking-[0.4em] animate-pulse">Coming Soon</p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">Video Tutorial PRG</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10 px-2">
                                    {[
                                        { id: '1', title: 'Mulai Rental', text: 'Rental PS di PlayStation Racing Game Makassar.', icon: <Gamepad2 size={20} /> },
                                        { id: '2', title: 'Klik Kamera', text: 'Klik tombol kamera di dashboard saat unit PlayStation sedang terpasang.', icon: <Camera size={20} /> },
                                        { id: '3', title: 'Ambil Foto', text: 'Ambil foto unit di lokasi rental. Pastikan akses lokasi (GPS) kamu aktif.', icon: <MapPin size={20} /> },
                                        { id: '4', title: 'Verifikasi', text: 'Tunggu admin verifikasi foto kamu. Slot loyalty akan terisi otomatis!', icon: <ShieldCheck size={20} /> }
                                    ].map((item) => (
                                        <div key={item.id} className="relative flex gap-6 group">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 rounded-2xl bg-neon-blue/5 flex items-center justify-center text-neon-blue border border-neon-blue/10 group-hover:scale-110 group-hover:bg-neon-blue group-hover:text-white transition-all duration-500 shadow-lg shadow-neon-blue/5">
                                                    {item.icon}
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0d0d12] border border-white/10 flex items-center justify-center text-[9px] font-black text-white shadow-xl">
                                                    {item.id}
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center">
                                                <h4 className="text-sm font-montserrat font-black uppercase tracking-widest text-white mb-1 group-hover:text-neon-blue transition-colors">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-gray-500 font-bold leading-relaxed tracking-wide group-hover:text-gray-400 transition-colors">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showCamera && (
                <CameraVerification
                    onCapture={onCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}

            {/* Modern Modal Popup */}
            {modal && modal.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#07070a]/80 backdrop-blur-md animate-fade-in" onClick={() => setModal(null)} />
                    <div className="relative w-full max-w-sm bg-[#0d0d12] rounded-[32px] border border-white/10 p-8 shadow-2xl animate-modal-up overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-16 -mt-16 ${modal.type === 'success' ? 'bg-neon-green' : 'bg-red-500'}`} />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${modal.type === 'success' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {modal.type === 'success' ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
                            </div>

                            <h3 className="text-xl font-montserrat font-black uppercase tracking-wider text-white mb-2 italic">{modal.title}</h3>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest leading-relaxed mb-8">{modal.message}</p>

                            <button
                                onClick={() => setModal(null)}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] italic transition-all duration-300 active:scale-95 ${modal.type === 'success' ? 'bg-neon-blue text-white shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Badge Zoom Modal */}
            {badgeZoomOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setBadgeZoomOpen(false)} />
                    <div className="relative animate-in zoom-in-95 duration-500 flex flex-col items-center max-w-sm w-full">
                        <button
                            onClick={() => setBadgeZoomOpen(false)}
                            className="absolute -top-16 right-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white backdrop-blur-xl transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative group w-full aspect-square">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-[100px] animate-pulse" />

                            <div className="relative w-full h-full rounded-[48px] bg-black/60 border border-white/10 flex items-center justify-center p-12 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                <img
                                    src={
                                        profile?.membership_role === 'subscriber' ? SubscriberBadge :
                                            profile?.membership_role === 'member' ? MemberBadge :
                                                PlayerBadge
                                    }
                                    className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    alt="Enlarged Role Badge"
                                />
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <h2 className="text-2xl font-montserrat font-black italic uppercase text-white tracking-[0.3em] mb-2">
                                PRG <span className="text-neon-blue">{profile?.membership_role?.toUpperCase() || 'PLAYER'}</span>
                            </h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.5em]">Official Membership Status</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modal-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-modal-up { animation: modal-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
            {/* Chat Modal */}
            {showChat && profile && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center sm:p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500" onClick={() => setShowChat(false)} />
                    <div className="relative w-full h-full sm:max-w-md sm:h-[80vh] sm:rounded-[40px] overflow-hidden border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                        {adminProfile ? (
                            <ChatLoyalty
                                currentUser={profile as Profile}
                                targetUser={adminProfile}
                                onClose={() => setShowChat(false)}
                                targetOnline={adminOnline}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0a0a0f] h-full">
                                <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Menghubungkan ke Admin...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Account Deleted Modal */}
            {isAccountDeleted && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-700" />
                    <div className="relative bg-[#0d0d12] border border-red-500/20 rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 rounded-full bg-red-500/10 border-4 border-red-500/20 text-red-500 flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20" />
                            <Trash2 size={40} />
                        </div>
                        
                        <h3 className="text-2xl font-montserrat font-black text-white uppercase italic mb-4 tracking-wider">Akun Dihapus</h3>
                        <p className="text-gray-400 font-inter text-sm leading-relaxed mb-10">
                            Maaf, akun Anda telah dihapus oleh Admin dari sistem PRG Rental. Anda tidak dapat lagi mengakses Member Area.
                        </p>

                        <button
                            onClick={handleLogout}
                            className="w-full py-5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-95"
                        >
                            Keluar Sekarang
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
