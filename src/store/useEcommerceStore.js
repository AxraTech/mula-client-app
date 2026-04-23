import { create } from "zustand";
import { ecommerceService } from "../services/ecommerceService";

const useEcommerceStore = create((set, get) => ({
    products: [],
    cartItems: [],
    loading: false,

    //---------------------------------------------Setters----------------------------------------------
    setProducts: (data) => set({ products: data }),
    setCartItems: (data) => set({ cartItems: data }),
    setLoading: (status) => set({ loading: status }),

    //---------------------------------------------Actions----------------------------------------------
    fetchCart: async () => {
        set({ loading: true });
        try {
            const items = await ecommerceService.getCartItems();
            set({ cartItems: items, loading: false });
        }
        catch (error) {
            set({ loading: false });
            console.error("Failed to fetch cart items:", error);
        }
    },
    addToCart: async (productId, quantity, userId) => {
        set({ loading: true });
        try {
            await ecommerceService.addToCart(productId, quantity, userId);
            get().fetchCart();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || "Failed to add to cart" };
        }
    },
    removeFromCart: async (id) => {
        try {
            await ecommerceService.deleteCartItem(id);
            set((state) => ({
                cartItems: state.cartItems.filter(item => item.id !== id)
            }));
        }
        catch (error) {
            console.error("Failed to remove cart item:", error);
        }
    },
}));

export default useEcommerceStore;