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
            // Extract the array specifically from 'cart_items'
            const items = response.data?.cart_items || []; 
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
        //console.log("Attempting to remove item with ID:", item.product_id);
        const originalItems = get().cartItems;
        try {
            set((state) => ({
                cartItems: state.cartItems.filter(item => item.id !== id)
            }));
            await ecommerceService.deleteCartItem(id);
        } catch (error) {
            console.error("Full Error Config:", error.config.url);
            console.error("Failed to remove cart item:", error);
            set({ cartItems: originalItems });
            alert("Could not remove item. Please try again.");
        }
    },

    placeOrder: async (orderData) => {
        set({ loading: true });
        try {
            const result = await ecommerceService.createOrder(orderData);
            
            // If order is successful, clear the local cart items
            set({ cartItems: [], loading: false });
            
            return { success: true, data: result };
        } catch (error) {
            set({ loading: false, error: error.message });
            return { success: false, error: error.message };
        }
    },

    orders: [],
    fetchOrderHistory: async (userId) => {
        set({ loading: true });
        try {
            const data = await ecommerceService.getOrderHistory(userId);
            set({ orders: data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },
}));

export default useEcommerceStore;