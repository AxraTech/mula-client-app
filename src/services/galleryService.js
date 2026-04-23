import { get } from "react-native/Libraries/NativeComponent/NativeComponentRegistry";
import apiClient from "../api/apiClient";
import {
    GET_ARTISTS_ENDPOINT,
    GET_ARTIST_BY_ID_ENDPOINT,
    GET_TRIDITIONAL_ARTWORKS_ENDPOINT,
    GET_TRIDITIONAL_ARTWORKS_BY_ID_ENDPOINT,
    GET_DIGITAL_ARTWORKS_ENDPOINT,
    GET_DIGITAL_ARTWORKS_BY_ID_ENDPOINT,
    GET_SERIES_ENDPOINT,
} from '@env';

export const galleryService = {
//---------------------------------------------artists----------------------------------------------
    getArtists: async () =>
        apiClient.get(GET_ARTISTS_ENDPOINT).then(res => res.data),

    getArtistById: async (id) =>
        apiClient.get(`${GET_ARTIST_BY_ID_ENDPOINT}/${id}`).then(res => res.data),

//---------------------------------------------traditional artworks----------------------------------------------
    getTraditionalArtworks: async () =>
        apiClient.get(GET_TRIDITIONAL_ARTWORKS_ENDPOINT).then(res => res.data),

    getTraditionalArtworkById: async (id) =>
        apiClient.get(`${GET_TRIDITIONAL_ARTWORKS_BY_ID_ENDPOINT}/${id}`).then(res => res.data),

//---------------------------------------------digital artworks----------------------------------------------
    getDigitalArtworks: async () =>
        apiClient.get(GET_DIGITAL_ARTWORKS_ENDPOINT).then(res => res.data),

    getDigitalArtworkById: async (id) =>
        apiClient.get(`${GET_DIGITAL_ARTWORKS_BY_ID_ENDPOINT}/${id}`).then(res => res.data),

//---------------------------------------------series----------------------------------------------
    getSeries: async () =>
        apiClient.get(GET_SERIES_ENDPOINT).then(res => res.data),
};