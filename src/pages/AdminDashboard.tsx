import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    ShieldCheck,
    Clock,
    MapPin,
    Trash2,
    RotateCcw,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Download,
    Plus,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    LogOut,
    XCircle,
    List,
    MessageSquare,
    Camera,
    Mail,
    Lock,
    User,
    Calendar,
    ArrowRight,
    ArrowLeft,
    Check,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    ToggleLeft,
    ToggleRight,
    UserPlus,
    ShieldAlert,
    Gamepad2,
    Percent,
    Share2,
    Eye,
    EyeOff,
    Copy,
    Instagram,
    Facebook,
    MessageCircle,
    Send
} from 'lucide-react';
import ChatLoyalty from '../components/ChatLoyalty';
import { Profile } from '../types/member';
import logoUrl from '../assets/logonobg.png';
import PlayerBadge from '../assets/Player Role.png';
import MemberBadge from '../assets/Member Role.png';
import SubscriberBadge from '../assets/Subscriber Role.png';

export default function AdminDashboard() {
    const [members, setMembers] = useState<any[]>([]);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'verifications' | 'members_list' | 'chat'>('verifications');
    const [selectedChatMember, setSelectedChatMember] = useState<Profile | null>(null);
    const [showChatDetail, setShowChatDetail] = useState(false);
    const [chatSearchQuery, setChatSearchQuery] = useState('');
    const [adminProfile, setAdminProfile] = useState<Profile | null>(null);

    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadUserIds, setUnreadUserIds] = useState<string[]>([]);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info';
    }>({
        show: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });
    const [newPassForMember, setNewPassForMember] = useState('');
    const [updatingPass, setUpdatingPass] = useState(false);
    const [modal, setModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        show: false,
        title: '',
        message: '',
        type: 'success'
    });
    const [selectedUserForVerify, setSelectedUserForVerify] = useState<string | null>(null);
    const [hiddenVerifyIds, setHiddenVerifyIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_verifications');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('hidden_verifications', JSON.stringify(hiddenVerifyIds));
    }, [hiddenVerifyIds]);

    // New Member Form
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState<'player' | 'member' | 'subscriber'>('player');
    const [creating, setCreating] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [createdAccount, setCreatedAccount] = useState<{ name: string, email: string, pass: string } | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showMemberPassword, setShowMemberPassword] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
        fetchData();

        // Heartbeat for online status
        const updateLastSeen = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;
            if (user) {
                await supabase
                    .from('profiles')
                    .update({ last_seen: new Date().toISOString() })
                    .eq('id', user.id);
            }
        };

        updateLastSeen();
        const heartbeat = setInterval(updateLastSeen, 30000); // Every 30s

        // Subscribe to real-time changes
        const channel = supabase
            .channel('verifications-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'verifications' }, () => {
                fetchData();
            })
            .subscribe();

        // Subscribe to profile changes (for online status)
        const profileChannel = supabase
            .channel('admin-profiles-sync')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles'
            }, (payload) => {
                setMembers(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...(payload.new as any) } : m));
                setSelectedChatMember(prev => prev?.id === payload.new.id ? { ...prev, ...(payload.new as any) } : prev);
            })
            .subscribe();

        // Subscribe to messages globally (for chat list notification)
        const msgChannel = supabase
            .channel('admin-messages-sync')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages'
            }, () => {
                fetchData();
            })
            .subscribe();

        // Poll profiles every 10s for accurate online status
        const profilePollInterval = setInterval(async () => {
            const { data: membersData } = await supabase
                .from('profiles')
                .select('id, last_seen, full_name')
                .eq('role', 'member');
            if (membersData) {
                setMembers(prev => prev.map(m => {
                    const updated = membersData.find(u => u.id === m.id);
                    return updated ? { ...m, last_seen: updated.last_seen } : m;
                }));
            }
        }, 10000);

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(profileChannel);
            supabase.removeChannel(msgChannel);
            clearInterval(heartbeat);
            clearInterval(profilePollInterval);
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        // Artificial delay for smooth animation
        setTimeout(() => setRefreshing(false), 600);
    };

    const checkAdmin = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        setAdminProfile({ ...profile, full_name: 'PRG ADMIN' } as Profile);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: membersData } = await supabase
                .from('profiles')
                .select('*, loyalty_cards(slots_filled, total_rentals)')
                .eq('role', 'member');

            const { data: verifyData } = await supabase
                .from('verifications')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });

            // Fetch unread messages for admin
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            if (adminUser) {
                const { data: unreadData } = await supabase
                    .from('messages')
                    .select('sender_id')
                    .eq('receiver_id', adminUser.id)
                    .eq('is_read', false);

                if (unreadData) {
                    const uniqueSenders = Array.from(new Set(unreadData.map(m => m.sender_id)));
                    setUnreadUserIds(uniqueSenders);
                }
            }

            setMembers(membersData || []);
            setVerifications(verifyData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleData = (role: string) => {
        switch (role) {
            case 'subscriber': return { label: 'Subscriber', badge: SubscriberBadge, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' };
            case 'member': return { label: 'Member', badge: MemberBadge, color: 'text-neon-blue', bg: 'bg-neon-blue/20', border: 'border-neon-blue/30' };
            default: return { label: 'Player', badge: PlayerBadge, color: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10' };
        }
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            // Normalize email
            const normalizedEmail = newEmail.toLowerCase().trim();

            // NOTE: In a real app, this should be done via Edge Functions
            // to avoid logging out the current admin.
            // For now, we use standard signUp with metadata.
            // Use a temporary client that doesn't persist session to prevent logging out the admin
            const { createClient } = await import('@supabase/supabase-js');
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                { auth: { persistSession: false } }
            );

            const { data, error } = await tempClient.auth.signUp({
                email: normalizedEmail,
                password: newPassword,
                options: {
                    data: {
                        full_name: newName
                    }
                }
            });

            if (error) throw error;

            // Update membership role and store password in profile
            // Wait for Supabase trigger to create the profile row first
            if (data.user) {
                const maxRetries = 5;
                let profileUpdated = false;
                for (let i = 0; i < maxRetries; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', data.user!.id)
                        .single();
                    
                    if (existingProfile) {
                        const { error: updateErr } = await supabase
                            .from('profiles')
                            .update({ 
                                membership_role: newRole,
                                password: newPassword
                            })
                            .eq('id', data.user!.id);
                        
                        if (!updateErr) {
                            profileUpdated = true;
                            break;
                        }
                    }
                }
                if (!profileUpdated) {
                    console.warn('Profile update may not have completed — password might not be saved.');
                }
            }

            setCreatedAccount({
                name: newName,
                email: normalizedEmail,
                pass: newPassword
            });
            setShowShareModal(true);

            setModal({
                show: true,
                title: 'BERHASIL',
                message: 'Member baru telah berhasil terdaftar dengan role ' + newRole.toUpperCase(),
                type: 'success'
            });
            setNewEmail('');
            setNewPassword('');
            setNewName('');
            setNewRole('player');
            fetchData();
        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal membuat member: ' + err.message,
                type: 'error'
            });
        } finally {
            setCreating(false);
        }
    };

    const handleConfirmMember = async (userId: string) => {
        try {
            // 1. Panggil fungsi sakti RPC untuk mengaktifkan login di Supabase Auth
            const { error: authError } = await supabase.rpc('confirm_user_login', { user_id: userId });
            if (authError) throw authError;

            // 2. Tandai juga di tabel profiles agar UI terupdate
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq('id', userId);

            if (profileError) throw profileError;

            setModal({
                show: true,
                title: 'VERIFIED!',
                message: 'Akun member telah berhasil diaktifkan secara manual oleh Admin.',
                type: 'success'
            });
            fetchData();
            if (selectedMember) {
                setSelectedMember({
                    ...selectedMember,
                    email_confirmed_at: new Date().toISOString()
                });
            }
        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal verifikasi: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassForMember || !selectedMember) return;
        setUpdatingPass(true);
        try {
            const { error: rpcError } = await supabase.rpc('admin_reset_user_password', {
                target_user_id: selectedMember.id,
                new_password: newPassForMember
            });

            if (rpcError) throw rpcError;

            // Update password in profiles table for visibility
            await supabase
                .from('profiles')
                .update({ password: newPassForMember })
                .eq('id', selectedMember.id);

            setSelectedMember({ ...selectedMember, password: newPassForMember });

            setModal({
                show: true,
                title: 'PASSWORD DIRESET',
                message: `Password untuk ${selectedMember.full_name} telah berhasil diperbarui di sistem.`,
                type: 'success'
            });
            setNewPassForMember('');
        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal merubah password: ' + err.message,
                type: 'error'
            });
        } finally {
            setUpdatingPass(false);
        }
    };

    const handleUpdateMembershipRole = async (memberId: string, role: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ membership_role: role })
                .eq('id', memberId);

            if (error) throw error;

            fetchData();
            if (selectedMember) {
                setSelectedMember({ ...selectedMember, membership_role: role });
            }
            setModal({
                show: true,
                title: 'ROLE UPDATED',
                message: `Status membership member berhasil diubah menjadi ${role.toUpperCase()}.`,
                type: 'success'
            });

            // Add Notification for User
            await supabase
                .from('notifications')
                .insert({
                    user_id: memberId,
                    title: 'Pangkat Naik!',
                    message: `Selamat! Admin telah merubah pangkat/status membership kamu menjadi ${role.toUpperCase()}.`,
                    type: 'success'
                });

        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal update role: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleToggleUserStatus = async (memberId: string, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: newStatus })
                .eq('id', memberId);

            if (error) throw error;

            fetchData();
            if (selectedMember) {
                setSelectedMember({ ...selectedMember, is_active: newStatus });
            }

            setModal({
                show: true,
                title: 'STATUS UPDATED',
                message: `Akun member berhasil di${newStatus ? 'aktifkan' : 'nonaktifkan'}.`,
                type: 'success'
            });

            // Add Notification for User
            await supabase
                .from('notifications')
                .insert({
                    user_id: memberId,
                    title: 'Status Akun Berubah',
                    message: `Admin telah mengupdate status akun kamu menjadi ${newStatus ? 'AKTIF' : 'NONAKTIF'}.`,
                    type: newStatus ? 'success' : 'warning'
                });

        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal update status: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleResetSlot = async (userId: string) => {
        setConfirmConfig({
            show: true,
            title: 'Reset Slot?',
            message: 'Progress member ini akan kembali menjadi 0/8. Lanjutkan?',
            type: 'warning',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('loyalty_cards')
                        .update({ slots_filled: 0 })
                        .eq('user_id', userId);

                    if (error) throw error;

                    fetchData();
                    if (selectedMember && selectedMember.id === userId) {
                        setSelectedMember({
                            ...selectedMember,
                            loyalty_cards: Array.isArray(selectedMember.loyalty_cards)
                                ? [{ ...selectedMember.loyalty_cards[0], slots_filled: 0 }]
                                : { ...selectedMember.loyalty_cards, slots_filled: 0 }
                        });
                    }

                    // Add Notification for User
                    await supabase
                        .from('notifications')
                        .insert({
                            user_id: userId,
                            title: 'Loyalty Reset',
                            message: 'Progress loyalty card kamu telah diatur ulang oleh admin.',
                            type: 'warning'
                        });

                    setConfirmConfig(prev => ({ ...prev, show: false }));
                    setModal({
                        show: true,
                        title: 'RESET BERHASIL',
                        message: 'Progres loyalty member telah diatur ulang menjadi 0.',
                        type: 'success'
                    });
                } catch (err: any) {
                    setModal({
                        show: true,
                        title: 'ERROR',
                        message: 'Gagal reset: ' + err.message,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleDeleteMember = async (userId: string) => {
        const memberName = members.find(m => m.id === userId)?.full_name || 'Member';
        setConfirmConfig({
            show: true,
            title: 'Hapus Akun Permanen?',
            message: `Akun "${memberName}" beserta seluruh data (chat, loyalty, verifikasi) akan dihapus permanen. Tindakan ini TIDAK bisa dibatalkan.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    // 1. Delete related loyalty_cards
                    await supabase.from('loyalty_cards').delete().eq('user_id', userId);

                    // 2. Delete related messages (sent & received)
                    await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

                    // 3. Delete related verifications
                    await supabase.from('verifications').delete().eq('user_id', userId);

                    // 4. Delete related notifications
                    await supabase.from('notifications').delete().eq('user_id', userId);

                    // 5. Delete the profile
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', userId);

                    if (profileError) throw profileError;

                    // 6. Delete the auth user via RPC (if available)
                    try {
                        await supabase.rpc('delete_user_by_id', { target_user_id: userId });
                    } catch {
                        // RPC may not exist yet — profile deletion is still successful
                        console.warn('Auth user deletion RPC not available, profile already deleted.');
                    }

                    // 7. Immediately update UI — remove from list
                    setMembers(prev => prev.filter(m => m.id !== userId));
                    setSelectedMember(null);
                    setConfirmConfig(prev => ({ ...prev, show: false }));

                    setModal({
                        show: true,
                        title: 'BERHASIL',
                        message: `Akun "${memberName}" telah dihapus permanen dari sistem.`,
                        type: 'success'
                    });
                } catch (err: any) {
                    setConfirmConfig(prev => ({ ...prev, show: false }));
                    setModal({
                        show: true,
                        title: 'ERROR',
                        message: 'Gagal hapus akun: ' + err.message,
                        type: 'error'
                    });
                }
            }
        });
    };

    const handleVerify = async (id: string, userId: string, approve: boolean) => {
        try {
            const status = approve ? 'approved' : 'rejected';

            // 1. Update verification status
            const { error: vError } = await supabase
                .from('verifications')
                .update({
                    status,
                    is_read: false
                })
                .eq('id', id);

            if (vError) throw vError;

            // 2. If approved, increment loyalty card slots
            if (approve) {
                const { data: card } = await supabase
                    .from('loyalty_cards')
                    .select('slots_filled, total_rentals')
                    .eq('user_id', userId)
                    .single();

                if (card) {
                    const updateData: any = {
                        total_rentals: (card.total_rentals || 0) + 1
                    };

                    if (card.slots_filled < 8) {
                        updateData.slots_filled = card.slots_filled + 1;
                    }

                    await supabase
                        .from('loyalty_cards')
                        .update(updateData)
                        .eq('user_id', userId);
                }
            }

            setModal({
                show: true,
                title: approve ? 'BERHASIL' : 'DITOLAK',
                message: approve ? 'Permintaan verifikasi member telah disetujui!' : 'Permintaan verifikasi member telah ditolak.',
                type: approve ? 'success' : 'error'
            });
            fetchData();
        } catch (err: any) {
            setModal({
                show: true,
                title: 'ERROR',
                message: 'Gagal memproses: ' + err.message,
                type: 'error'
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

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Mobile Header - Hidden when in detail view */}
            {!selectedUserForVerify && (
                <header className={`lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0d0d14]/80 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-between px-6 animate-in fade-in duration-300 ${activeTab === 'chat' && showChatDetail ? 'hidden' : 'flex'}`}>
                    <div className="flex items-center gap-3">
                        <img src={logoUrl} className="h-8" alt="Logo" />
                        <span className="font-montserrat font-black text-xs tracking-widest italic uppercase text-white">PRG <span className="text-neon-blue">ADMIN</span></span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                    >
                        <div className="w-5 flex flex-col gap-1.5 items-end">
                            <span className="block h-0.5 w-5 bg-gray-300" />
                            <span className="block h-0.5 w-3 bg-gray-300" />
                            <span className="block h-0.5 w-4 bg-gray-300" />
                        </div>
                    </button>
                </header>
            )}

            {/* Mobile Sidebar Overlay */}
            <div className={`fixed inset-0 z-[120] lg:hidden transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
                {/* Solid Backdrop */}
                <div
                    className={`absolute inset-0 bg-[#07070a]/98 backdrop-blur-xl transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <aside className={`absolute top-0 left-0 bottom-0 w-full sm:w-[320px] bg-[#0d0d12] border-r border-white/5 flex flex-col p-6 transition-transform duration-501 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                                <img src={logoUrl} className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
                            </div>
                            <span className="font-montserrat font-black text-sm tracking-[0.2em] text-white uppercase italic">PRG <span className="text-neon-blue">ADMIN</span></span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 relative z-10">
                        <button
                            onClick={() => { setActiveTab('verifications'); setMobileMenuOpen(false); }}
                            className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 ${activeTab === 'verifications'
                                ? 'bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeTab === 'verifications'
                                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                                : 'bg-white/5 text-gray-500 group-hover:text-white'
                                }`}>
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`font-montserrat font-black text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${activeTab === 'verifications' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    Verifikasi
                                </span>
                                <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'verifications' ? 'text-neon-blue opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-60'}`}>
                                    {activeTab === 'verifications' ? 'Kamu di sini' : 'Kelola Request'}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
                            className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 ${activeTab === 'members'
                                ? 'bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeTab === 'members'
                                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                                : 'bg-white/5 text-gray-500 group-hover:text-white'
                                }`}>
                                <UserPlus size={20} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`font-montserrat font-black text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${activeTab === 'members' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    Members Data
                                </span>
                                <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'members' ? 'text-neon-blue opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-60'}`}>
                                    {activeTab === 'members' ? 'Kamu di sini' : 'Tambah Member'}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setActiveTab('members_list'); setMobileMenuOpen(false); }}
                            className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 ${activeTab === 'members_list'
                                ? 'bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeTab === 'members_list'
                                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                                : 'bg-white/5 text-gray-500 group-hover:text-white'
                                }`}>
                                <List size={20} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`font-montserrat font-black text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${activeTab === 'members_list' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    Account List
                                </span>
                                <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'members_list' ? 'text-neon-blue opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-60'}`}>
                                    {activeTab === 'members_list' ? 'Kamu di sini' : 'Daftar Member'}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
                            className={`group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 ${activeTab === 'chat'
                                ? 'bg-gradient-to-r from-neon-blue/20 via-neon-blue/10 to-transparent border border-neon-blue/20 shadow-[0_0_30px_rgba(0,212,255,0.15)]'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 ${activeTab === 'chat'
                                ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(0,212,255,0.5)]'
                                : 'bg-white/5 text-gray-500 group-hover:text-white'
                                }`}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className={`font-montserrat font-black text-sm uppercase tracking-[0.15em] transition-colors duration-300 ${activeTab === 'chat' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
                                    Loyalty Chat
                                </span>
                                <span className={`text-[9px] font-bold tracking-widest transition-opacity duration-300 ${activeTab === 'chat' ? 'text-neon-blue opacity-100' : 'text-gray-600 opacity-0 group-hover:opacity-60'}`}>
                                    {activeTab === 'chat' ? 'Kamu di sini' : 'Hubungi Member'}
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 mt-2"
                        >
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 scale-90 group-hover:scale-100 bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]">
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
                    </div>

                </aside>

                <style>{`
                    .navbar-star { position: absolute; width: 3px; height: 3px; background: white; border-radius: 50%; opacity: 0; animation: twinkle 4s infinite; }
                    @keyframes twinkle { 
                        0%, 100% { opacity: 0; transform: scale(0.5); }
                        50% { opacity: 1; transform: scale(1.2); }
                    }
                `}</style>
            </div>

            {/* Sidebar Desktop */}
            <aside className={`fixed left-0 top-0 bottom-0 bg-[#0d0d14] border-r border-white/5 hidden lg:flex flex-col p-6 transition-all duration-500 z-50 ${sidebarCollapsed ? 'w-24' : 'w-64'}`}>
                <div className={`flex items-center gap-3 mb-10 transition-all duration-500 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                    <img src={logoUrl} className="h-10" alt="Logo" />
                    {!sidebarCollapsed && (
                        <span className="font-montserrat font-black text-sm tracking-widest italic uppercase whitespace-nowrap animate-in fade-in duration-500">PRG <span className="text-neon-blue">ADMIN</span></span>
                    )}
                </div>

                <nav className="space-y-2 flex-1">
                    <button
                        onClick={() => setActiveTab('verifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'verifications' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'text-gray-500 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title="Verifikasi"
                    >
                        <CheckCircle2 size={20} className="shrink-0" />
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Verifikasi</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'members' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'text-gray-500 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title="Members Data"
                    >
                        <UserPlus size={20} className="shrink-0" />
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Members Data</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('members_list')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'members_list' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'text-gray-500 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title="Account List"
                    >
                        <List size={20} className="shrink-0" />
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Account List</span>}
                    </button>

                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20 shadow-[0_0_15px_rgba(0,212,255,0.1)]' : 'text-gray-500 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title="Chat Loyalty"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Loyalty Chat</span>}
                    </button>

                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-500 hover:text-white border border-transparent ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Buka Menu' : 'Tutup Menu'}
                    >
                        {sidebarCollapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Tutup Menu</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 group ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title="Keluar Akun"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform shrink-0" />
                        {!sidebarCollapsed && <span className="font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">Keluar Akun</span>}
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-500 ${activeTab === 'chat' ? 'p-0 sm:p-0 lg:p-0' : 'p-4 lg:p-10'} ${selectedUserForVerify ? 'pt-6' : (activeTab === 'chat' ? (showChatDetail ? 'pt-0' : 'pt-16 lg:pt-0') : 'pt-24 lg:pt-10')} ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-64'}`}>
                <div className={`${activeTab === 'chat' ? 'max-w-none' : 'max-w-[1600px]'} mx-auto h-full`}>
                    {!selectedUserForVerify && activeTab !== 'chat' && (
                        <header className="mb-10 flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-top-2 duration-300 text-center">
                            <div>
                                <h1 className="text-3xl font-montserrat font-black italic uppercase">
                                    Member <span className="text-neon-blue">{activeTab === 'verifications' ? 'Verify' : activeTab === 'members' ? 'Account' : 'List'}</span>
                                </h1>
                            </div>
                        </header>
                    )}

                    {activeTab === 'verifications' ? (
                        <div key="verifications-tab" className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            {!selectedUserForVerify ? (
                                <div key="verify-list-summary" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {Array.from(new Set(verifications
                                            .filter(v => !hiddenVerifyIds.includes(v.id))
                                            .map(v => v.user_id))).map(userId => {
                                                const userVerifies = verifications.filter(v => v.user_id === userId && !hiddenVerifyIds.includes(v.id));
                                                const profile = userVerifies[0]?.profiles;
                                                const hasPending = userVerifies.some(v => v.status === 'pending');

                                                return (
                                                    <button
                                                        key={`user-btn-${userId}`}
                                                        onClick={() => setSelectedUserForVerify(userId)}
                                                        className="bg-[#14141d] p-6 rounded-[32px] border border-white/5 hover:border-neon-blue/30 transition-all text-left flex items-center justify-between group"
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 group-hover:scale-110 transition-transform">
                                                                <User size={28} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-3">
                                                                    <h3 className="text-white font-montserrat font-black uppercase tracking-widest italic">{profile?.full_name || 'Unknown'}</h3>
                                                                    {hasPending ? (
                                                                        <div className="relative flex items-center justify-center">
                                                                            <div className="absolute inset-0 bg-neon-blue/40 blur-md rounded-full animate-pulse" />
                                                                            <ShieldAlert size={14} className="text-neon-blue relative z-10 animate-pulse" />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center text-green-400">
                                                                            <ShieldCheck size={14} className="drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{profile?.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="hidden md:flex bg-white/5 w-10 h-10 rounded-xl items-center justify-center text-gray-500 group-hover:text-neon-blue transition-colors">
                                                            <ChevronRight size={20} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                    {verifications.filter(v => !hiddenVerifyIds.includes(v.id)).length === 0 && (
                                        <div key="no-verifications" className="bg-white/5 rounded-[40px] p-20 flex flex-col items-center justify-center border border-white/5">
                                            <Clock className="text-gray-700 mb-6" size={48} />
                                            <p className="text-gray-500 font-montserrat font-black uppercase tracking-widest text-center">Belum Ada verify</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div key="verify-detail-view" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-full">
                                    <button
                                        onClick={() => setSelectedUserForVerify(null)}
                                        className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors group px-2"
                                    >
                                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-montserrat font-black uppercase tracking-widest text-xs italic">Kembali ke Daftar</span>
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                                        {verifications
                                            .filter(v => v.user_id === selectedUserForVerify && !hiddenVerifyIds.includes(v.id))
                                            .map((v) => (
                                                <div key={`verify-card-${v.id}`} className={`bg-[#14141d] rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl relative ${v.status !== 'pending' ? 'opacity-70' : ''}`}>
                                                    <div
                                                        className="aspect-video bg-black relative flex-shrink-0 group/img overflow-hidden cursor-zoom-in"
                                                        onClick={() => setSelectedImage(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/verifications/${v.photo_url}`)}
                                                    >
                                                        <img
                                                            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/verifications/${v.photo_url}`}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                            alt="Verification"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#14141d] via-transparent to-transparent" />
                                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 z-10 shadow-xl">
                                                            {v.status === 'pending' ? (
                                                                <span className="text-neon-blue animate-pulse">Menunggu</span>
                                                            ) : (
                                                                <span className={v.status === 'approved' ? 'text-green-400' : 'text-red-400'}>
                                                                    {v.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-8 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <h3 className="text-xl font-montserrat font-black uppercase tracking-widest italic text-white">{v.profiles?.full_name}</h3>
                                                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">{v.profiles?.email}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => setHiddenVerifyIds(prev => [...prev, v.id])}
                                                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-700 hover:text-red-400 transition-all"
                                                                title="Sembunyikan Visual"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                                            <div className="flex items-start gap-4">
                                                                <MapPin size={18} className="text-neon-blue mt-0.5 shrink-0" />
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-relaxed">{v.location_name || 'Lokasi tidak tersedia'}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Clock size={18} className="text-neon-blue shrink-0" />
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{new Date(v.created_at).toLocaleString('id-ID')}</p>
                                                            </div>
                                                        </div>

                                                        {v.status === 'pending' && (
                                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                                <button
                                                                    onClick={() => handleVerify(v.id, v.user_id, false)}
                                                                    className="py-4 rounded-2xl bg-white/5 border border-white/10 text-red-500 font-montserrat font-black uppercase tracking-widest italic text-[10px] hover:bg-red-500/10 transition-all active:scale-95"
                                                                >
                                                                    Tolak
                                                                </button>
                                                                <button
                                                                    onClick={() => handleVerify(v.id, v.user_id, true)}
                                                                    className="py-4 rounded-2xl bg-neon-blue text-white font-montserrat font-black uppercase tracking-widest italic text-[10px] shadow-[0_10px_20px_rgba(0,212,255,0.3)] hover:shadow-[0_15px_30px_rgba(0,212,255,0.4)] transition-all active:scale-95"
                                                                >
                                                                    Setujui
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'members' ? (
                        <div key="members-tab" className="max-w-xl mx-auto mt-10">
                            <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/5 blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10">
                                    <div className="mb-10 text-center">
                                        <h3 className="text-2xl font-montserrat font-black italic uppercase whitespace-nowrap">New Member</h3>
                                    </div>
                                    <form onSubmit={handleCreateMember} className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Nama Lengkap</label>
                                            <input
                                                required
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all text-sm font-bold"
                                                placeholder="Masukkan nama member"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Email</label>
                                            <input
                                                type="text"
                                                required
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value.toLowerCase().trim())}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all text-sm font-bold"
                                                placeholder="member@email.com"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Password</label>
                                            <div className="relative group">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    required
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-white focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all text-sm font-bold"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Select Membership Tier</label>

                                            <div className="relative group">
                                                <div className="flex items-center justify-between gap-4 p-2 bg-white/[0.02] border border-white/5 rounded-[32px] relative overflow-hidden">
                                                    {/* Navigation Arrows */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const roles: any[] = ['player', 'member', 'subscriber'];
                                                            const idx = roles.indexOf(newRole);
                                                            if (idx > 0) setNewRole(roles[idx - 1]);
                                                        }}
                                                        disabled={newRole === 'player'}
                                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all z-10"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>

                                                    {/* Role Card Display */}
                                                    <div className="flex-1 flex flex-col items-center py-4 animate-in fade-in zoom-in-95 duration-500">
                                                        <div className={`w-20 h-20 rounded-[28px] ${getRoleData(newRole).bg} flex items-center justify-center p-4 border ${getRoleData(newRole).border} shadow-2xl relative`}>
                                                            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-50" />
                                                            <img src={getRoleData(newRole).badge} className="w-full h-full object-contain relative z-10" alt={newRole} />
                                                        </div>
                                                        <div className="mt-4 text-center">
                                                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${getRoleData(newRole).color}`}>{getRoleData(newRole).label}</p>
                                                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-1">PRG Official Tier</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const roles: any[] = ['player', 'member', 'subscriber'];
                                                            const idx = roles.indexOf(newRole);
                                                            if (idx < roles.length - 1) setNewRole(roles[idx + 1]);
                                                        }}
                                                        disabled={newRole === 'subscriber'}
                                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all z-10"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>

                                                {/* Dots Indicator */}
                                                <div className="flex justify-center gap-1.5 mt-4">
                                                    {['player', 'member', 'subscriber'].map((r) => (
                                                        <div
                                                            key={r}
                                                            className={`h-1.5 rounded-full transition-all duration-300 ${newRole === r ? 'bg-neon-blue w-6' : 'bg-white/10 w-1.5'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={creating}
                                            className="w-full bg-neon-blue py-5 rounded-2xl text-white font-montserrat font-black uppercase tracking-[0.2em] shadow-xl shadow-neon-blue/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                        >
                                            {creating ? 'Sedang Memproses...' : 'Daftarkan'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'chat' ? (
                        <div key="chat-tab" className={`${showChatDetail ? 'h-screen sm:h-screen' : 'h-[calc(100vh-64px)] sm:h-screen'} flex bg-[#0a0a0f] overflow-hidden animate-in fade-in duration-500`}>
                            {/* Chat List Sidebar */}
                            <div className={`${showChatDetail ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 border-r border-white/5 flex-col bg-black/20 animate-in slide-in-from-left-4 duration-300`}>
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-xl font-montserrat font-black uppercase italic text-white mb-6 tracking-wider">Loyalty Chat</h3>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={chatSearchQuery}
                                            onChange={(e) => setChatSearchQuery(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-neon-blue transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {members
                                        .filter(m => m.full_name?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                                        .map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => {
                                                    setSelectedChatMember(m as Profile);
                                                    setShowChatDetail(true);
                                                }}
                                                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all group ${selectedChatMember?.id === m.id ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-white/5 border border-transparent'}`}
                                            >
                                                <div className="relative group-hover:scale-110 transition-transform">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-neon-blue font-black italic border border-white/5">
                                                        {m.full_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    {m.last_seen && (new Date().getTime() - new Date(m.last_seen).getTime() < 60000) && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#0a0a0f] animate-pulse" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-xs font-black uppercase tracking-wider truncate ${selectedChatMember?.id === m.id ? 'text-neon-blue' : 'text-white'}`}>{m.full_name}</p>
                                                            {unreadUserIds.includes(m.id) && selectedChatMember?.id !== m.id && (
                                                                <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.8)] animate-pulse" />
                                                            )}
                                                        </div>
                                                        <span className="text-[8px] text-gray-600 font-bold">
                                                            {m.last_seen ? new Date(m.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className={`text-[9px] font-bold truncate ${m.last_seen && (new Date().getTime() - new Date(m.last_seen).getTime() < 60000) ? 'text-green-500/70' : 'text-gray-500'}`}>
                                                            {m.last_seen && (new Date().getTime() - new Date(m.last_seen).getTime() < 60000) ? 'Active Now' : 'Click to chat...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>

                            {/* Chat Main Area */}
                            <div className={`${showChatDetail ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-black/40 animate-in slide-in-from-right-4 duration-300`}>
                                {adminProfile && (
                                    <ChatLoyalty
                                        currentUser={adminProfile as Profile}
                                        targetUser={selectedChatMember || undefined}
                                        isAdminView={true}
                                        onBack={() => setShowChatDetail(false)}
                                        targetOnline={selectedChatMember?.last_seen ? (new Date().getTime() - new Date(selectedChatMember.last_seen).getTime() < 60000) : false}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div key="members-list-tab" className="grid grid-cols-1 gap-6">
                            <div className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Account List</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map((m) => (
                                                <tr
                                                    key={m.id}
                                                    onClick={() => setSelectedMember(m)}
                                                    className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group cursor-pointer"
                                                >
                                                    <td className="p-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20 text-neon-blue font-black uppercase italic text-sm shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                                                                    {m.full_name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <p className="text-white font-black uppercase tracking-widest text-xs">{m.full_name}</p>
                                                                        {m.email_confirmed_at ? (
                                                                            <ShieldCheck size={12} className="text-green-500" />
                                                                        ) : (
                                                                            <ShieldAlert size={12} className="text-yellow-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{m.email}</p>
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${m.membership_role === 'subscriber' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                                                                            m.membership_role === 'member' ? 'bg-neon-blue/10 border-neon-blue/20 text-neon-blue' :
                                                                                'bg-gray-500/10 border-gray-500/20 text-gray-500'
                                                                            }`}>
                                                                            {m.membership_role || 'player'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-10">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setSelectedImage(null)} />
                    <div className="relative w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-0 right-0 m-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white z-50 backdrop-blur-xl transition-all"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={selectedImage}
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5"
                            alt="Full Size"
                        />
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmConfig.show && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setConfirmConfig(prev => ({ ...prev, show: false }))} />
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-[40px] p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${confirmConfig.type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                            confirmConfig.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'
                            }`}>
                            {confirmConfig.type === 'danger' ? <Trash2 size={28} /> : <RotateCcw size={28} />}
                        </div>
                        <h3 className="text-2xl font-montserrat font-black italic uppercase text-white mb-3 tracking-widest">{confirmConfig.title}</h3>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed mb-10">
                            {confirmConfig.message}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setConfirmConfig(prev => ({ ...prev, show: false }))}
                                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Tidak
                            </button>
                            <button
                                onClick={confirmConfig.onConfirm}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white shadow-lg transition-all active:scale-95 ${confirmConfig.type === 'danger' ? 'bg-red-500 shadow-red-500/20' :
                                    confirmConfig.type === 'warning' ? 'bg-yellow-500 shadow-yellow-500/20' :
                                        'bg-neon-blue shadow-neon-blue/20'
                                    }`}
                            >
                                Setuju
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Premium Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 z-[500] flex flex-col items-center justify-start overflow-y-auto bg-[#0a0a0f] sm:bg-transparent">
                    {/* Backdrop for Desktop only */}
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500 hidden sm:block" onClick={() => setSelectedMember(null)} />

                    <div className="relative bg-[#0a0a0f] w-full sm:max-w-lg sm:my-auto sm:rounded-[40px] sm:border sm:border-white/5 shadow-[0_0_100px_rgba(0,212,255,0.05)] animate-in slide-in-from-bottom-0 sm:slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col shrink-0 min-h-screen sm:min-h-0">
                        {/* Dynamic Header */}
                        <div className="h-48 sm:h-40 bg-gradient-to-br from-neon-blue/20 via-purple-500/10 to-transparent relative shrink-0">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                            {/* Profile Avatar */}
                            <div className="absolute -bottom-12 left-8 sm:left-12 flex items-end gap-6">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#14141d] border-2 border-white/5 flex items-center justify-center text-neon-blue text-4xl font-montserrat font-black italic uppercase shadow-2xl relative group">
                                    <div className="absolute inset-0 bg-neon-blue/5 rounded-3xl blur-xl group-hover:bg-neon-blue/10 transition-all" />
                                    <span className="relative z-10">{selectedMember.full_name?.charAt(0)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:rotate-90 transition-all duration-500"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 sm:p-12 pt-20">
                            {/* Name & Status */}
                            <div className="mb-10">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-2xl sm:text-3xl font-montserrat font-black italic uppercase text-white tracking-widest leading-none">
                                        {selectedMember.full_name}
                                    </h3>
                                    {selectedMember.email_confirmed_at ? (
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1.5">
                                            <ShieldCheck size={12} className="text-green-500" />
                                            <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-1.5">
                                            <ShieldAlert size={12} className="text-yellow-500" />
                                            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">Pending</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-1 rounded-[24px] bg-white/[0.02] border border-white/5 relative overflow-hidden mt-6">
                                    <button
                                        onClick={() => handleToggleUserStatus(selectedMember.id, selectedMember.is_active ?? true)}
                                        className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all duration-500 group/status ${(selectedMember.is_active ?? true)
                                            ? 'bg-green-500/5 hover:bg-green-500/10'
                                            : 'bg-red-500/5 hover:bg-red-500/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${(selectedMember.is_active ?? true)
                                                ? 'bg-green-500/10 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                                : 'bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                                                }`}>
                                                {(selectedMember.is_active ?? true) ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Status Keamanan</p>
                                                <p className={`text-xs font-black uppercase tracking-widest ${(selectedMember.is_active ?? true) ? 'text-green-500' : 'text-red-500'}`}>
                                                    {(selectedMember.is_active ?? true) ? 'Akun Aktif' : 'Akun Dinonaktifkan'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-14 h-8 rounded-full p-1 transition-all duration-500 relative ${(selectedMember.is_active ?? true) ? 'bg-green-500' : 'bg-gray-800'
                                            }`}>
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 transform ${(selectedMember.is_active ?? true) ? 'translate-x-6' : 'translate-x-0'
                                                }`} />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Loyalty Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loyalty Status</h4>
                                        <span className="text-neon-blue font-black text-xs italic tracking-widest">
                                            {(Array.isArray(selectedMember.loyalty_cards)
                                                ? selectedMember.loyalty_cards.reduce((acc: number, curr: any) => acc + (curr.slots_filled || 0), 0)
                                                : (selectedMember.loyalty_cards?.slots_filled || 0)) || 0} / 8 SLOTS
                                        </span>
                                    </div>

                                    {/* Total Rental & Status Diskon */}
                                    {(() => {
                                        const slotsFilled = (Array.isArray(selectedMember.loyalty_cards)
                                            ? selectedMember.loyalty_cards.reduce((acc: number, curr: any) => acc + (curr.slots_filled || 0), 0)
                                            : (selectedMember.loyalty_cards?.slots_filled || 0)) || 0;
                                        const totalRentals = (Array.isArray(selectedMember.loyalty_cards)
                                            ? selectedMember.loyalty_cards.reduce((acc: number, curr: any) => acc + (curr.total_rentals || 0), 0)
                                            : (selectedMember.loyalty_cards?.total_rentals || 0)) || 0;
                                        const activeReward = slotsFilled >= 8 ? 'FREE 1 HARI' : slotsFilled >= 4 ? 'DISCOUNT 10RB' : null;
                                        return (
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* Total Rental Card */}
                                                <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#0a0a0f] border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f2129] flex items-center justify-center shrink-0 border border-[#1a3845]">
                                                        <Gamepad2 size={16} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 overflow-hidden">
                                                        <p className="text-[7px] sm:text-[8px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Total Rental</p>
                                                        <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">
                                                            {totalRentals} Rental
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Diskon Card */}
                                                <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#0a0a0f] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] transition-all duration-500 ${activeReward ? 'border border-gray-400 shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border border-white/5'}`}>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                                                        <Percent size={18} className={activeReward ? "text-gray-300" : "text-gray-600"} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 sm:gap-1 overflow-hidden">
                                                        <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status Diskon</p>
                                                        <div className="flex flex-col">
                                                            {activeReward ? (
                                                                <>
                                                                    <p className="text-[8px] sm:text-[9px] font-black text-gray-200 uppercase tracking-widest leading-tight whitespace-nowrap">
                                                                        {activeReward.includes('DISCOUNT') ? 'DISCOUNT' : activeReward.includes('FREE') ? 'FREE' : activeReward}
                                                                    </p>
                                                                    <p className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest leading-tight whitespace-nowrap">
                                                                        {activeReward.includes('DISCOUNT') ? activeReward.replace('DISCOUNT ', '') + ' AKTIF' : activeReward.includes('FREE') ? activeReward.replace('FREE ', '') + ' AKTIF' : 'AKTIF'}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-[8px] sm:text-[9px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">Belum Ada</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative z-10">
                                            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/5 mb-6">
                                                <div
                                                    className="h-full bg-gradient-to-r from-neon-blue via-cyan-400 to-neon-blue bg-[length:200%_100%] animate-gradient shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-1000"
                                                    style={{
                                                        width: `${(((Array.isArray(selectedMember.loyalty_cards)
                                                            ? selectedMember.loyalty_cards.reduce((acc: number, curr: any) => acc + (curr.slots_filled || 0), 0)
                                                            : (selectedMember.loyalty_cards?.slots_filled || 0)) || 0) / 8) * 100}%`
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleResetSlot(selectedMember.id)}
                                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-neon-blue/10 text-white hover:text-neon-blue border border-white/10 hover:border-neon-blue/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                                            >
                                                <RotateCcw size={16} />
                                                Reset Progress
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Settings Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-2">Account Settings</h4>

                                    <div className="space-y-3">
                                        <div className="px-2 flex items-center justify-between">
                                            <label className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">Password Member</label>
                                            <button
                                                onClick={() => setShowMemberPassword(!showMemberPassword)}
                                                className="text-[8px] font-black text-neon-blue uppercase tracking-widest hover:underline"
                                            >
                                                {showMemberPassword ? 'Sembunyikan' : 'Lihat Password'}
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                                                <Lock size={16} />
                                            </div>
                                            <input
                                                type={showMemberPassword ? "text" : "password"}
                                                readOnly
                                                value={selectedMember.password || ''}
                                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-5 pl-14 pr-5 text-gray-400 text-sm font-bold focus:outline-none"
                                                placeholder={showMemberPassword ? "Data tidak tersedia" : "••••••••"}
                                            />
                                            {!selectedMember.password && (
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[7px] font-black text-yellow-500/40 uppercase tracking-widest text-right max-w-[80px] leading-tight">
                                                    Akun Lama / Belum Sinkron
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <label className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] px-2">Reset Password</label>
                                            <div className="relative group mt-2">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors">
                                                    <RotateCcw size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={newPassForMember}
                                                    onChange={(e) => setNewPassForMember(e.target.value)}
                                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-32 text-white text-sm font-bold focus:outline-none focus:border-neon-blue/50 focus:bg-white/[0.05] transition-all"
                                                    placeholder="Set New Password"
                                                />
                                                <button
                                                    onClick={handleUpdatePassword}
                                                    disabled={!newPassForMember}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-neon-blue text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neon-blue/20 hover:brightness-110 disabled:opacity-30 disabled:grayscale transition-all"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>

                                        {/* Membership Role Slider */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Switch Membership Tier</label>

                                            <div className="flex items-center justify-between gap-3 p-2 bg-white/[0.02] border border-white/5 rounded-[28px] relative overflow-hidden">
                                                <button
                                                    onClick={() => {
                                                        const roles: any[] = ['player', 'member', 'subscriber'];
                                                        const idx = roles.indexOf(selectedMember.membership_role || 'player');
                                                        if (idx > 0) handleUpdateMembershipRole(selectedMember.id, roles[idx - 1]);
                                                    }}
                                                    disabled={(selectedMember.membership_role || 'player') === 'player'}
                                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all z-10"
                                                >
                                                    <ChevronLeft size={18} />
                                                </button>

                                                <div className="flex-1 flex items-center gap-4 py-2 px-2 animate-in fade-in duration-300">
                                                    <div className={`w-12 h-12 rounded-2xl ${getRoleData(selectedMember.membership_role || 'player').bg} flex items-center justify-center p-2 border ${getRoleData(selectedMember.membership_role || 'player').border} shadow-lg`}>
                                                        <img src={getRoleData(selectedMember.membership_role || 'player').badge} className="w-full h-full object-contain" alt="Current Tier" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${getRoleData(selectedMember.membership_role || 'player').color}`}>{getRoleData(selectedMember.membership_role || 'player').label}</p>
                                                        <p className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Tier Active</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const roles: any[] = ['player', 'member', 'subscriber'];
                                                        const idx = roles.indexOf(selectedMember.membership_role || 'player');
                                                        if (idx < roles.length - 1) handleUpdateMembershipRole(selectedMember.id, roles[idx + 1]);
                                                    }}
                                                    disabled={(selectedMember.membership_role || 'player') === 'subscriber'}
                                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all z-10"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>

                                            <div className="flex justify-center gap-1">
                                                {['player', 'member', 'subscriber'].map((r) => (
                                                    <div
                                                        key={r}
                                                        className={`h-1 rounded-full transition-all duration-300 ${selectedMember.membership_role === r ? 'bg-neon-blue w-4' : 'bg-white/10 w-1'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {!selectedMember.email_confirmed_at && (
                                            <button
                                                onClick={() => handleConfirmMember(selectedMember.id)}
                                                className="w-full py-5 rounded-2xl bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-3"
                                            >
                                                <ShieldCheck size={18} />
                                                Confirm Account Now
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => handleDeleteMember(selectedMember.id)}
                                        className="w-full py-5 rounded-2xl bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/10 hover:border-red-500/20 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                        HAPUS AKUN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Modal Popup */}
            {modal && modal.show && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setModal({ ...modal, show: false })} />
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,212,255,0.1)] animate-in zoom-in-95 duration-500">
                        {/* Status Icon with Ring */}
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 mb-8 relative transition-colors duration-500 ${modal.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                            modal.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                'bg-neon-blue/10 border-neon-blue/20 text-neon-blue'
                            }`}>
                            <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${modal.type === 'success' ? 'border-green-500' : modal.type === 'error' ? 'border-red-500' : 'border-neon-blue'}`} />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ${modal.type === 'success' ? 'bg-green-500 shadow-green-500/40' :
                                modal.type === 'error' ? 'bg-red-500 shadow-red-500/40' :
                                    'bg-neon-blue shadow-neon-blue/40'
                                }`}>
                                {modal.type === 'success' ? <CheckCircle2 size={40} className="text-white" /> :
                                    modal.type === 'error' ? <XCircle size={40} className="text-white" /> :
                                        <Clock size={40} className="text-white" />}
                            </div>
                        </div>

                        {/* Text Content */}
                        <h3 className="text-2xl font-montserrat font-black italic uppercase text-white mb-3 tracking-widest">{modal.title}</h3>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                            {modal.message}
                        </p>

                        {/* Action Button */}
                        <button
                            onClick={() => setModal({ ...modal, show: false })}
                            className="mt-10 w-full group relative"
                        >
                            <div className={`absolute inset-0 rounded-2xl blur-lg transition-opacity group-hover:opacity-100 opacity-50 ${modal.type === 'success' ? 'bg-green-500' : modal.type === 'error' ? 'bg-red-500' : 'bg-neon-blue'}`} />
                            <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 flex items-center justify-center gap-3">
                                <span className="group-hover:translate-x-1 transition-transform">LANJUTKAN</span>
                                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
            {/* Account Share Modal */}
            {showShareModal && createdAccount && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowShareModal(false)} />
                    <div className="relative bg-[#0d0d12] border border-white/10 rounded-[40px] p-8 sm:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 rounded-3xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue mb-6">
                                <Share2 size={40} />
                            </div>
                            <h3 className="text-2xl font-montserrat font-black italic uppercase text-white tracking-widest">KIRIM AKUN</h3>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Bagikan kredensial login ke member</p>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Username</span>
                                    <span className="text-white font-bold">{createdAccount.name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Password</span>
                                    <span className="text-white font-bold">{createdAccount.pass}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Login Link</span>
                                    <span className="text-neon-blue font-bold truncate underline">{window.location.origin}/login</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    const text = `Username: ${createdAccount.name}\nPassword: ${createdAccount.pass}\nLogin: ${window.location.origin}/login`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white transition-all text-[#25D366]"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => {
                                    const text = `Username: ${createdAccount.name}\nPassword: ${createdAccount.pass}\nLogin: ${window.location.origin}/login`;
                                    window.open(`https://t.me/share/url?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc] hover:text-white transition-all text-[#0088cc]"
                            >
                                <Send size={24} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Telegram</span>
                            </button>
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => {
                                    const text = `Username: ${createdAccount.name}\nPassword: ${createdAccount.pass}\nLogin: ${window.location.origin}/login`;
                                    navigator.clipboard.writeText(text);
                                    setModal({ show: true, title: 'COPIED', message: 'Detail akun telah disalin ke clipboard.', type: 'success' });
                                }}
                                className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
                            >
                                <Copy size={20} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Copy Login Details</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setShowShareModal(false)}
                            className="mt-10 w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-all"
                        >
                            SELESAI
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
                .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
