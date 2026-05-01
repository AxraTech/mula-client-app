import { create } from "zustand";
import { ecommerceService } from "../services/ecommerceService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from "./useAuthStore";

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
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        set({ loading: true });
        try {
            const response = await ecommerceService.getCartItems(userId);
            const items = response.data?.data || response.data || [];
            set({ cartItems: items, loading: false });
        } catch (error) {
            set({ loading: false });
            console.log("Cart Error:", error?.response?.data || error?.message || error);
        }
    },

    addToCart: async (productId, quantity = 1) => {
        const { user } = useAuthStore.getState();
        
        try {
            await ecommerceService.addToCart(productId, quantity, user.id); 
            await get().fetchCart();
            return { success: true };
        } catch (error) {
            console.error("DEBUG - Full Error Object:", error);
            console.log("Cart Error Message:", error.message);
            return { success: false };
        }
    },

    removeFromCart: async (id) => {
        const originalItems = get().cartItems;
        try {
            set((state) => ({
                cartItems: state.cartItems.filter(item => item.id !== id)
            }));
            await ecommerceService.deleteCartItem(id);
        } catch (error) {
            console.error("Failed to remove cart item:", error);
            set({ cartItems: originalItems });
            alert("Could not remove item. Please try again.");
        }
    },
}));

export default useEcommerceStore;