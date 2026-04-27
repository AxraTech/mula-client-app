import axios from "axios";
import { BASE_URL, GET_PRODUCTS_ENDPOINT, GET_ARTISTS_ENDPOINT } from '@env';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getHomeData = async (token) => {
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        const [productsRes, artistsRes] = await Promise.all([
            apiClient.get(GET_PRODUCTS_ENDPOINT, config),
            apiClient.get(GET_ARTISTS_ENDPOINT, config)
        ]);

        const allProducts = productsRes.data;

        return {
            all: allProducts,
            traditionalArt: allProducts.filter(item => item.type === 'traditional'),
            digitalArt: allProducts.filter(item => item.type === 'digital'),
            artists: artistsRes.data
        };

    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
};

export default apiClient;