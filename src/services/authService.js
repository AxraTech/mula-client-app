import apiClient from "../api/apiClient";
import { 
    LOGIN_ENDPOINT, 
    SIGNUP_ENDPOINT, 
    OTP_VERIFY_ENDPOINT, 
    FORGET_PASSWORD_ENDPOINT, 
    RESET_PASSWORD_ENDPOINT,
    GET_PROFILE_ENDPOINT,
    UPDATE_PROFILE_ENDPOINT,
    GET_ADDRESS_ENDPOINT,
} from '@env';

export const authService = {
    //---------------------------------------------log in----------------------------------------------
    login: async (phone, password) => {
        try {
            console.log("Sending to API:", { phone, password });
            const response = await apiClient.post(LOGIN_ENDPOINT, {
                input: { phone, password }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------request OTP----------------------------------------------
    requestOTP: async (phone) => {
        try {
            const response = await apiClient.post(OTP_VERIFY_ENDPOINT, { input: { phone } });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------register----------------------------------------------
    register: async (userData) => {
        try {
            const response = await apiClient.post(SIGNUP_ENDPOINT, { input: userData });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------request Forget Password OTP----------------------------------------------
    requestForgetPasswordOTP: async (phone) => {
        try {
            const response = await apiClient.post(FORGET_PASSWORD_ENDPOINT, { 
                input: { phone } 
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------reset Password----------------------------------------------
    resetPassword: async (phone, otp, otp_id, newPassword) => {
        try {
            const response = await apiClient.post(RESET_PASSWORD_ENDPOINT, {
                input: { phone, otp, otp_id, newPassword }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------profile----------------------------------------------
    getProfile: async (token) => {
        try {
            const response = await apiClient.get(GET_PROFILE_ENDPOINT, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },

    //---------------------------------------------update profile----------------------------------------------
    updateProfile: async (token, profileData) => {
        try {
            const response = await apiClient.put(UPDATE_PROFILE_ENDPOINT, {
                input: profileData 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },
};