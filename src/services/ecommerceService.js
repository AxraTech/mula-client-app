import apiClient from "../api/apiClient";
import {
    GET_PRODUCTS_ENDPOINT,
    GET_PRODUCT_BY_ID_ENDPOINT,
    CREATE_CART_ITEM_ENDPOINT,
    GET_CART_ITEM_ENDPOINT,
    DELETE_CART_ITEM_ENDPOINT,
    CREATE_ORDER_ENDPOINT,
    BUY_NOW_ENDPOINT,
    GET_ORDER_ENDPOINT,
    GET_ORDER_BY_ID_ENDPOINT,
} from '@env';

export const ecommerceService = {
//---------------------------------------------products----------------------------------------------
    getProducts: () =>
        apiClient.get(GET_PRODUCTS_ENDPOINT).then(res => res.data),

    getProductsById: (id) =>
        apiClient.get(`${GET_PRODUCT_BY_ID_ENDPOINT}/${id}`).then(res => res.data),

//---------------------------------------------cart----------------------------------------------
    getCartItems: (userId) => {
        console.log("Service sending GET request with userId:", userId);
        return apiClient.get(GET_CART_ITEM_ENDPOINT, {
            params: { user_id: userId }
        });
    },

    addToCart: (productId, quantity, userId) => {
        console.log("Service sending POST request:", { productId, quantity, userId });
        return apiClient.post(CREATE_CART_ITEM_ENDPOINT, {
            input: {
                product_id: productId,
                quantity: quantity,
                user_id: userId
            }
        });
    },

    deleteCartItem: (cartItemId) =>
        apiClient.delete(`${DELETE_CART_ITEM_ENDPOINT}/${cartItemId}`).then(res => res.data),

//---------------------------------------------order----------------------------------------------
    createOrder: (orderData) =>
        apiClient.post(CREATE_ORDER_ENDPOINT, orderData).then(res => res.data),

    buyNow: (orderData) =>
        apiClient.post(BUY_NOW_ENDPOINT, orderData).then(res => res.data),

    getOrders: () =>
        apiClient.get(GET_ORDER_ENDPOINT).then(res => res.data),

    getOrderById: (orderId) =>
        apiClient.get(`${GET_ORDER_BY_ID_ENDPOINT}/${orderId}`).then(res => res.data),
};