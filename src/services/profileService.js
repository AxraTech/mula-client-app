import apiClient from "../api/apiClient";
import {
    GET_PROFILE_ENDPOINT,
    UPDATE_PROFILE_ENDPOINT,
    GET_ADDRESS_ENDPOINT,
} from '@env';

export const profileService = {
//---------------------------------------------get profile----------------------------------------------
    getProfile: async () => {
        const response = await apiClient.get(GET_PROFILE_ENDPOINT);
        return response.data;
    },

//---------------------------------------------update profile----------------------------------------------
    updateProfile: async (updateData) => {
        const response = await apiClient.patch(UPDATE_PROFILE_ENDPOINT, updateData);
        return response.data;
    },

//---------------------------------------------get address----------------------------------------------
    getAddress: async (userId) => {
        const response = await apiClient.get(`${GET_ADDRESS_ENDPOINT}/?user_id=${userId}`);
        return response.data;
    },
};