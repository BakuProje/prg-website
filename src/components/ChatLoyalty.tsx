import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Image, Mic, X, Check, CheckCheck, Loader2, Phone, Camera, MoreVertical, Play, Square, ArrowLeft } from 'lucide-react';
import { Message, Profile } from '../types/member';

interface ChatLoyaltyProps {
    currentUser: Profile;
    targetUser?: Profile; // Null for admin view when no user selected
    onClose?: () => void;
    onBack?: () => void;
    isAdminView?: boolean;
    targetOnline?: boolean;
}

export default function ChatLoyalty({ currentUser, targetUser, onClose, onBack, isAdminView, targetOnline }: ChatLoyaltyProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<any>(null);
    const [playingAudio, setPlayingAudio] = useState<string | null>(null);
    const [audioProgress, setAudioProgress] = useState(0);
    const [audioTotalDuration, setAudioTotalDuration] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isTargetTyping, setIsTargetTyping] = useState(false);
    const [liveTargetOnline, setLiveTargetOnline] = useState(targetOnline || false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const typingTimeoutRef = useRef<any>(null);
    const typingChannelRef = useRef<any>(null);

    // Fetch messages
    const fetchMessages = async () => {
        if (!targetUser) return;
        
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${currentUser.id})`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
            // Mark as read when opening chat
            if (currentUser && targetUser) {
                await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('sender_id', targetUser.id)
                    .eq('receiver_id', currentUser.id)
                    .eq('is_read', false);
            }
        }
        setLoading(false);
        scrollToBottom();
    };

    useEffect(() => {
        if (targetUser) {
            fetchMessages();

            // Realtime subscription - use sorted IDs for consistent channel name for both parties
            const channelId = [currentUser.id, targetUser.id].sort().join('-');
            const channel = supabase
                .channel(`chat-conversation-${channelId}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'messages'
                }, (payload) => {
                    const newMsg = payload.new as Message;
                    // Check if message belongs to this conversation
                    const isFromTarget = newMsg.sender_id === targetUser.id && newMsg.receiver_id === currentUser.id;
                    const isFromMe = newMsg.sender_id === currentUser.id && newMsg.receiver_id === targetUser.id;
                    
                    if (isFromTarget || isFromMe) {
                        setMessages(prev => {
                            if (prev.some(m => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                        scrollToBottom();
                        
                        // Mark incoming message as read if chat is open
                        if (isFromTarget) {
                            supabase
                                .from('messages')
                                .update({ is_read: true })
                                .eq('id', newMsg.id)
                                .then();
                        }
                    }
                })
                .subscribe();

            // Polling fallback every 3 seconds for guaranteed real-time sync
            const pollInterval = setInterval(async () => {
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${targetUser.id}),and(sender_id.eq.${targetUser.id},receiver_id.eq.${currentUser.id})`)
                    .order('created_at', { ascending: true });

                if (data) {
                    setMessages(prev => {
                        if (prev.length !== data.length) {
                            // Mark new incoming messages as read
                            const newIncoming = data.filter(
                                d => d.sender_id === targetUser.id && !d.is_read
                            );
                            if (newIncoming.length > 0) {
                                supabase
                                    .from('messages')
                                    .update({ is_read: true })
                                    .eq('sender_id', targetUser.id)
                                    .eq('receiver_id', currentUser.id)
                                    .eq('is_read', false)
                                    .then();
                            }
                            scrollToBottom();
                            return data;
                        }
                        return prev;
                    });
                }
            }, 3000);

            return () => {
                supabase.removeChannel(channel);
                clearInterval(pollInterval);
            };
        }
    }, [targetUser]);

    // Typing indicator channel
    useEffect(() => {
        if (!targetUser) return;

        const channelId = [currentUser.id, targetUser.id].sort().join('-');
        const typingChannel = supabase.channel(`typing-${channelId}`);
        
        typingChannel
            .on('broadcast', { event: 'typing' }, (payload: any) => {
                if (payload.payload?.user_id === targetUser.id) {
                    setIsTargetTyping(true);
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setIsTargetTyping(false), 2500);
                }
            })
            .subscribe();

        typingChannelRef.current = typingChannel;

        return () => {
            supabase.removeChannel(typingChannel);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [targetUser]);

    // Real-time online status polling
    useEffect(() => {
        if (!targetUser) return;

        const checkOnline = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('last_seen')
                .eq('id', targetUser.id)
                .single();
            if (data?.last_seen) {
                setLiveTargetOnline(new Date().getTime() - new Date(data.last_seen).getTime() < 60000);
            } else {
                setLiveTargetOnline(false);
            }
        };

        checkOnline();
        const interval = setInterval(checkOnline, 10000);
        return () => clearInterval(interval);
    }, [targetUser]);

    const broadcastTyping = () => {
        typingChannelRef.current?.send({
            type: 'broadcast',
            event: 'typing',
            payload: { user_id: currentUser.id }
        });
    };

    const scrollToBottom = () => {
        // Scroll immediately
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        // Scroll again after short delay (for DOM updates)
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
        // Scroll again after images may have loaded
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 300);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 800);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!targetUser) return;
        
        const msgContent = newMessage;
        setNewMessage('');
        
        // Optimistic Update
        const optimisticMsg: Message = {
            id: Math.random().toString(),
            sender_id: currentUser.id,
            receiver_id: targetUser.id,
            content: msgContent,
            type: 'text',
            is_read: false,
            created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                receiver_id: targetUser.id,
                content: msgContent,
                type: 'text'
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            setNewMessage(msgContent);
        } else if (data) {
            // Replace optimistic message with actual data from DB
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        }
        setSending(false);
        scrollToBottom();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !targetUser) return;

        setSending(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `chat/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat_media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat_media')
                .getPublicUrl(filePath);

            const { data, error: insertError } = await supabase.from('messages').insert({
                sender_id: currentUser.id,
                receiver_id: targetUser.id,
                content: publicUrl,
                type: 'image'
            }).select().single();

            if (data) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            }
            
            scrollToBottom();
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setSending(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await sendAudio(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
            setRecordingDuration(0);
        }
    };

    const sendAudio = async (blob: Blob) => {
        if (!targetUser) return;
        setSending(true);
        try {
            const fileName = `${Math.random()}.webm`;
            const filePath = `chat/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat_media')
                .upload(filePath, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat_media')
                .getPublicUrl(filePath);

            const { data, error: insertError } = await supabase.from('messages').insert({
                sender_id: currentUser.id,
                receiver_id: targetUser.id,
                content: publicUrl,
                type: 'audio'
            }).select().single();

            if (data) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            }
            scrollToBottom();
        } catch (err) {
            console.error('Audio upload error:', err);
        } finally {
            setSending(false);
        }
    };
    
    const toggleAudio = (url: string) => {
        if (playingAudio === url) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            if (audioRef.current) {
                setAudioProgress(0);
                audioRef.current.src = url;
                audioRef.current.play();
                setPlayingAudio(url);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setAudioTotalDuration(audioRef.current.duration);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}.${secs.toString().padStart(2, '0')}`;
    };

    if (!targetUser && isAdminView) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-10">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Send size={32} className="opacity-20" />
                </div>
                <h3 className="text-white font-montserrat font-black uppercase tracking-widest italic mb-2">Pilih Chat</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-center max-w-xs leading-relaxed">
                    Pilih salah satu member di samping untuk mulai membalas pesan.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
            {/* Header */}
            <div className="p-3 sm:p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
                <div className="flex items-center gap-2 sm:gap-4">
                    {onBack ? (
                        <button 
                            onClick={onBack} 
                            className="flex items-center gap-2 p-1 -ml-1 hover:bg-white/5 rounded-full transition-all active:scale-95 group sm:hidden"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} className="text-gray-400 group-hover:text-white" />
                            <div className="w-10 h-10 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-black italic overflow-hidden">
                                {targetUser?.full_name?.charAt(0).toUpperCase()}
                            </div>
                        </button>
                    ) : (
                        onClose && (
                            <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:text-white sm:hidden">
                                <X size={20} />
                            </button>
                        )
                    )}
                    
                    {/* Profile on Desktop or if not using the mobile back-button unit */}
                    <div className={`${onBack ? 'hidden sm:block' : 'block'}`}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue font-black italic">
                            {targetUser?.full_name?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-white font-montserrat font-black uppercase tracking-wider text-sm sm:text-base italic leading-tight">
                            {targetUser?.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${liveTargetOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            <p className={`text-[8px] font-black uppercase tracking-widest ${isTargetTyping ? 'text-neon-blue' : liveTargetOnline ? 'text-green-500' : 'text-gray-500'}`}>
                                {isTargetTyping ? 'Typing...' : liveTargetOnline ? 'Active Now' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-neon-blue transition-all">
                        <Phone size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-neon-blue transition-all">
                        <Camera size={18} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-hide">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-neon-blue" size={24} />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Send size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Belum ada pesan</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Mulai percakapan sekarang</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMine = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] ${isMine ? 'bg-neon-blue text-black rounded-2xl rounded-tr-none' : 'bg-white/5 text-gray-200 rounded-2xl rounded-tl-none'} p-3 sm:p-4 shadow-xl border ${isMine ? 'border-neon-blue/20' : 'border-white/5'}`}>
                                    {msg.type === 'text' ? (
                                        <p className="text-[11px] sm:text-xs font-black leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    ) : msg.type === 'image' ? (
                                        <img 
                                            src={msg.content} 
                                            className="rounded-xl max-w-full hover:scale-[1.02] transition-transform cursor-zoom-in shadow-lg" 
                                            alt="Shared" 
                                            onClick={() => setSelectedImage(msg.content)} 
                                        />
                                    ) : (
                                        <div 
                                            className="flex items-center gap-3 min-w-[150px] cursor-pointer group/vn"
                                            onClick={() => toggleAudio(msg.content)}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isMine ? 'bg-white/20 group-hover/vn:bg-white/30' : 'bg-neon-blue/20 text-neon-blue group-hover/vn:bg-neon-blue/30'}`}>
                                                {playingAudio === msg.content ? (
                                                    <Square size={10} fill="currentColor" />
                                                ) : (
                                                    <Play size={14} fill="currentColor" className="ml-0.5" />
                                                )}
                                            </div>
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all duration-100" 
                                                    style={{ width: playingAudio === msg.content ? `${(audioProgress / (audioTotalDuration || 1)) * 100}%` : '0%' }} 
                                                />
                                            </div>
                                            <span className="text-[9px] font-black opacity-60 uppercase tracking-widest min-w-[32px] text-right">
                                                {playingAudio === msg.content ? formatDuration(audioProgress) : '0:00'}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex items-center justify-end gap-1.5 mt-1.5 opacity-60`}>
                                        <span className="text-[7px] font-black uppercase">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMine && (
                                            msg.is_read ? <CheckCheck size={10} className="text-black/50" /> : <Check size={10} className="text-black/50" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border-t border-white/5 z-20">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all active:scale-90"
                    >
                        <Image size={20} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <div className="flex-1 relative">
                        {isRecording ? (
                            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl py-3 px-6 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Recording {formatDuration(recordingDuration)}</span>
                                </div>
                                <button type="button" onClick={stopRecording} className="text-red-500">
                                    <Square size={16} fill="currentColor" />
                                </button>
                            </div>
                        ) : (
                            <input
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    broadcastTyping();
                                }}
                                placeholder="Tulis pesan..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 px-6 text-white text-xs font-bold focus:outline-none focus:border-neon-blue transition-all"
                            />
                        )}
                    </div>

                    {!newMessage.trim() && !isRecording ? (
                        <button 
                            type="button" 
                            onClick={startRecording}
                            className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-neon-blue transition-all active:scale-90"
                        >
                            <Mic size={20} />
                        </button>
                    ) : (
                        <button 
                            type="submit"
                            disabled={sending || (!newMessage.trim() && !isRecording)}
                            className="w-11 h-11 rounded-2xl bg-neon-blue flex items-center justify-center text-white shadow-lg shadow-neon-blue/20 hover:scale-105 active:scale-90 transition-all disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} fill="currentColor" />}
                        </button>
                    )}
                </form>
            </div>
            <audio 
                ref={audioRef} 
                className="hidden" 
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setPlayingAudio(null);
                    setAudioProgress(0);
                }}
                onPause={() => setPlayingAudio(null)}
            />

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-10">
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
        </div>
    );
}
