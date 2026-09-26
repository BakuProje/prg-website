import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'unverified' | 'inactive'>('loading');
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const verifyAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    if (isMounted) setStatus('unauthenticated');
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id, role, email_confirmed_at, is_active')
                    .eq('id', session.user.id)
                    .single();

                if (error || !profile) {
                    if (isMounted) setStatus('unauthenticated');
                    return;
                }

                if (profile.role !== 'admin' && !profile.email_confirmed_at) {
                    await supabase.auth.signOut();
                    if (isMounted) setStatus('unverified');
                    return;
                }

                if (profile.is_active === false) {
                    await supabase.auth.signOut();
                    if (isMounted) setStatus('inactive');
                    return;
                }

                if (isMounted) setStatus('authenticated');
            } catch (err) {
                console.error('Auth verification error:', err);
                if (isMounted) setStatus('unauthenticated');
            }
        };

        verifyAuth();

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
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Memverifikasi Sesi...</p>
            </div>
        );
    }

    if (status === 'unauthenticated' || status === 'unverified' || status === 'inactive') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}
