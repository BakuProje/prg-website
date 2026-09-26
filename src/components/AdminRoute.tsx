import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'>('loading');
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const verifyAdmin = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    if (isMounted) setStatus('unauthenticated');
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id, role, is_active')
                    .eq('id', session.user.id)
                    .single();

                if (error || !profile) {
                    if (isMounted) setStatus('unauthenticated');
                    return;
                }

                if (profile.role !== 'admin' || profile.is_active === false) {
                    if (isMounted) setStatus('unauthorized');
                    return;
                }

                if (isMounted) setStatus('authorized');
            } catch (err) {
                console.error('Admin route verification error:', err);
                if (isMounted) setStatus('unauthenticated');
            }
        };

        verifyAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                if (isMounted) setStatus('unauthenticated');
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [location.pathname]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-3 border-neon-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memverifikasi Hak Akses Admin...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (status === 'unauthorized') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
