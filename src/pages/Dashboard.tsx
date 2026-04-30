import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkRole = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            let currentUser: any = sessionData?.session?.user;

            if (!currentUser) {
                const { data: userData } = await supabase.auth.getUser();
                currentUser = userData?.user;
            }

            if (!currentUser) {
                navigate('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, membership_role')
                .eq('id', currentUser.id)
                .single();

            if (profile?.role === 'admin') {
                navigate('/admin');
            } else {
                const targetRole = profile?.membership_role || 'member';
                navigate(`/${targetRole}`);
            }
        };
        checkRole();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
