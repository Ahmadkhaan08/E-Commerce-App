import { create } from "zustand";
import { apiRequest, getAuthToken } from "@/constants/mobileApi";

type CartLine = { quantity?: number };
type CartResponse = { cart?: CartLine[] };
type WishlistResponse = { wishlist?: string[] };

type AppState = {
  cartCount: number;
  wishlistCount: number;
  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;
  incrementCartCount: (by?: number) => void;
  decrementCartCount: (by?: number) => void;
  refreshCounts: () => Promise<void>;
};

export const useStore = create<AppState>((set) => ({
  cartCount: 0,
  wishlistCount: 0,

  setCartCount: (count) => set({ cartCount: count }),
  setWishlistCount: (count) => set({ wishlistCount: count }),

  incrementCartCount: (by = 1) =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount + by) })),

  decrementCartCount: (by = 1) =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount - by) })),

  refreshCounts: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ cartCount: 0, wishlistCount: 0 });
      return;
    }

    const [cartResult, wishlistResult] = await Promise.allSettled([
      apiRequest<CartResponse>("/api/carts", undefined, token),
      apiRequest<WishlistResponse>("/api/wishlist", undefined, token),
    ]);

    let cartCount = 0;
    if (cartResult.status === "fulfilled" && Array.isArray(cartResult.value.cart)) {
      cartCount = cartResult.value.cart.reduce(
        (sum, line) => sum + (line.quantity ?? 0),
        0,
      );
    }

    let wishlistCount = 0;
    if (
      wishlistResult.status === "fulfilled" &&
      Array.isArray(wishlistResult.value.wishlist)
    ) {
      wishlistCount = wishlistResult.value.wishlist.length;
    }

    set({ cartCount, wishlistCount });
  },
}));
