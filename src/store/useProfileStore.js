import { create } from "zustand";
import { profileService } from "../services/profileService";

const useProfileStore = create((set) => ({
    profile: null,
    addresses: [],
    loading: false,

    setProfile: (data) => set({ profile: data }),
    setAddresses: (data) => set({ addresses: data }),
    setLoading: (status) => set({ loading: status }),

    updateProfileData: async (updatePayload) => {
        set({ loading: true, error: null });
        try {
            const updatedProfile = await profileService.updateProfile(updatePayload);
            set({ profile: updateProfile, loading: false });
            return { success: true };
        }
        catch (error) {
            set ({
                error: error.message || "Failed to update profile",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },
    clearProfile: () => set({ profile: null, addresses: [], error: null }),
}))

export default useProfileStore;