import apiClient from "../api/apiClient";
import { 
    LOGIN_ENDPOINT, 
    SIGNUP_ENDPOINT, 
    OTP_VERIFY_ENDPOINT, 
    FORGET_PASSWORD_ENDPOINT, 
    RESET_PASSWORD_ENDPOINT 
} from '@env';

export const authService = {
//---------------------------------------------log in----------------------------------------------
    login: async (phone, password) => {
        try {
            console.log("Sending to API:", { phone, password });
            const response = await apiClient.post(LOGIN_ENDPOINT, {
                input: {
                    phone,
                    password,
                }
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
        // userData: { phone, password, fullname, otp, otp_id, dob, gender }
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
                input: {
                    phone,
                    otp,
                    otp_id,
                    newPassword,
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error.message;
        }
    },
};