import { create } from "zustand";

const useGalleryStore = create((set) => ({
    artists: [],
    traditionalArtworks: [],
    digitalArtworks: [],
    series: [],
    setLoading: false,

    setGalleryData: (data) => set((state) => ({ ...state, ...data })),

    setLoading: (status) => set({ isLoading: status }),
}));

export default useGalleryStore;