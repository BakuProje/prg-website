export interface Product {
    id: string;
    name: string;
    price: number;
    cover: string;
    description: string;
    videoUrl?: string;
    rating?: number;
    comingSoon?: boolean;
    hasVariant?: boolean;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    description: string;
    videoUrl?: string;
    cover?: string;
}

export interface CartItem {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}
