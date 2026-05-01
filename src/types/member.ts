export type UserRole = 'admin' | 'member';

export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    membership_role: 'player' | 'member' | 'subscriber';
    avatar_id: string;
    is_active: boolean;
    last_seen?: string;
    created_at: string;
    password?: string;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    type: 'text' | 'image' | 'audio';
    is_read: boolean;
    created_at: string;
}

export interface LoyaltyCard {
    id: string;
    user_id: string;
    slots_filled: number; // 0 to 8
    total_rentals: number; // Lifetime count
    updated_at: string;
}

export interface VerificationRequest {
    id: string;
    user_id: string;
    photo_url: string;
    location_name: string;
    captured_at: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_comment?: string;
    is_read: boolean;
    created_at: string;
}

export interface LoyaltyReward {
    slots_required: number;
    discount_percentage: number;
}

export const LOYALTY_REWARDS: LoyaltyReward[] = [
    { slots_required: 4, discount_percentage: 30 },
    { slots_required: 8, discount_percentage: 50 },
];
