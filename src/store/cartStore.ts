import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartStore {
    items: CartItem[];
    isCartOpen: boolean;
    isVariantOpen: boolean;
    selectedProduct: Product | null;
    addItem: (product: Product, variant?: ProductVariant) => void;
    removeItem: (productId: string, variantId?: string) => void;
    updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    openVariantModal: (product: Product) => void;
    closeVariantModal: () => void;
    getTotalPrice: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,
            isVariantOpen: false,
            selectedProduct: null,

            addItem: (product: Product, variant?: ProductVariant) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) =>
                            item.product.id === product.id &&
                            item.variant?.id === variant?.id
                    );

                    if (existingIndex >= 0) {
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...updatedItems[existingIndex],
                            quantity: updatedItems[existingIndex].quantity + 1,
                        };
                        return { items: updatedItems };
                    }

                    return {
                        items: [...state.items, { product, variant, quantity: 1 }],
                    };
                });
            },

            removeItem: (productId: string, variantId?: string) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) =>
                            !(
                                item.product.id === productId &&
                                item.variant?.id === variantId
                            )
                    ),
                }));
            },

            updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId && item.variant?.id === variantId
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),
            openVariantModal: (product: Product) => set({ isVariantOpen: true, selectedProduct: product }),
            closeVariantModal: () => set({ isVariantOpen: false, selectedProduct: null }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => {
                    const price = item.variant?.price ?? item.product.price;
                    return total + price * item.quantity;
                }, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'ps-rental-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
