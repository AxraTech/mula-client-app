import { create } from "zustand";
import { mediaService } from "../services/mediaService";
import useAuthStore from "./useAuthStore";

const useMediaStore = create((set, get) => ({
    favorites: [],
    loading: false,

//---------------------------------------------Actions----------------------------------------------
    fetchFavorites: async () => {
        try {
            const data = await mediaService.getFavorites();
            set({ favorites: data });
        } catch (error) {
            console.error("Fetch Favorites Error:", error);
        }
    },

    addFavorite: async (fkDigitalArtworkId) => {
        const userId = useAuthStore.getState().user?.id;
        
        if (!userId) return console.error("User not logged in");

        try {
            await mediaService.addFavorite(userId, fkDigitalArtworkId);
            await get().fetchFavorites(); // Refresh list
        } catch (error) {
            console.error("Favorite Error:", error);
        }
    },

    follow: async (creatorId, isTraditional = "true") => {
        const userId = useAuthStore.getState().user?.id;
        
        if (!userId) return console.error("User not logged in");

        set({ loading: true });
        try {
            await mediaService.followCreator(creatorId, userId, isTraditional);
            Alert.alert("Success", "Following!");
        } catch (error) {
            console.error("Follow Error:", error);
        } finally {
            set({ loading: false });
        }
    }
}));

export default useMediaStore;