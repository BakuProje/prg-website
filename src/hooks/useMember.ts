import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { LoyaltyCard, Profile } from '../types/member';

export function useMember() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: cardData } = await supabase
                .from('loyalty_cards')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setProfile(profileData);
            setLoyaltyCard(cardData);
            setLoading(false);
        };

        fetchUser();
    }, []);

    const slots = loyaltyCard?.slots_filled || 0;
    const discountPercentage = slots >= 8 ? 50 : slots >= 4 ? 30 : 0;

    return { profile, loyaltyCard, slots, discountPercentage, loading };
}
