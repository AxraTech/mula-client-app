import apiClient from "../api/apiClient";
import {
    GET_VIDEO_ENDPOINT,
    GET_VIDEO_BY_ID_ENDPOINT,
    GET_ARTICLE_ENDPOINT,
    GET_ARTICLE_BY_ID_ENDPOINT,
    GET_EVENT_ENDPOINT,
    GET_EVENT_BY_ID_ENDPOINT,
    CREATE_ENGAGEMENT_FOLLOW_ENDPOINT,
    GET_VIDEO_CREATOR_ENDPOINT,
    GET_VIDEO_CREATOR_BY_ID_ENDPOINT,
    CREATE_FAVORITE_ENDPOINT,
    ENGAGEMENT_FAVORITE_LIST_ENDPOINT,
} from '@env';

export const mediaService = {
//---------------------------------------------videos----------------------------------------------
    getVideos: () => apiClient.get(GET_VIDEO_ENDPOINT).then(res => res.data),
    getVideoById: (id) => apiClient.get(`${GET_VIDEO_BY_ID_ENDPOINT}${id}`).then(res => res.data),

//---------------------------------------------articles----------------------------------------------
    getArticle: () => apiClient.get(GET_ARTICLE_ENDPOINT).then(res => res.data),
    getArticleById: (id) => apiClient.get(`${GET_ARTICLE_BY_ID_ENDPOINT}${id}`).then(res => res.data),

//---------------------------------------------events----------------------------------------------
    getEvent: () => apiClient.get(GET_EVENT_ENDPOINT).then(res => res.data),
    getEventById: (id) => apiClient.get(`${GET_EVENT_BY_ID_ENDPOINT}${id}`).then(res => res.data),

//---------------------------------------------engagements----------------------------------------------
    followCreator: (creatorId, userId, isTraditional = "true") => 
        apiClient.post(CREATE_ENGAGEMENT_FOLLOW_ENDPOINT, {
            input: {
                fk_video_creator_id: creatorId,
                fk_user_id: userId,
                is_traditional: isTraditional
            }
        }).then(res => res.data),

//---------------------------------------------creators----------------------------------------------
    getCreators: () => apiClient.get(GET_VIDEO_CREATOR_ENDPOINT).then(res => res.data),
    getCreatorById: (id) => apiClient.get(`${GET_VIDEO_CREATOR_BY_ID_ENDPOINT}${id}`).then(res => res.data),

//---------------------------------------------favorites----------------------------------------------
    addFavorite: (fkUserId, fkDigitalArtworkId) => 
        apiClient.post(CREATE_FAVORITE_ENDPOINT, { 
            fk_user_id: fkUserId, fk_digital_artwork_id: fkDigitalArtworkId 
        }).then(res => res.data),
    getFavorites: () => apiClient.get(ENGAGEMENT_FAVORITE_LIST_ENDPOINT).then(res => res.data),
}