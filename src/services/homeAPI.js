import axios from "axios";
import { BASE_URL, GET_PRODUCTS_ENDPOINT, GET_ARTISTS_ENDPOINT } from '@env';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getHomeData = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
        const [productsRes, artistsRes] = await Promise.all([
            apiClient.get(GET_PRODUCTS_ENDPOINT, config),
            apiClient.get(GET_ARTISTS_ENDPOINT, config)
        ]);

        const artworks = productsRes.data?.data || productsRes.data?.products || [];
        const artists = artistsRes.data?.artists || artistsRes.data?.data || [];

        return {
            all: artworks,
            traditionalArt: artworks.filter(item => item.type === 'Traditional'),
            digitalArt: artworks.filter(item => item.type === 'Digital'),
            artists: artists
        };
    } catch (error) {
        throw error;
    }
};

export default apiClient;