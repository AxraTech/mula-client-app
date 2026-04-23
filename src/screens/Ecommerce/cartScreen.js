import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { ecommerceService } from "../../services/ecommerceService";

const CartScreen = () => {
    const [cartItems, setCartItems] = useState([]);

    const loadCart = async () => {
        const data = await ecommerceService.getCartItems();
        setCartItems(data);
    };

    useEffect(() => {loadCart();}, []);

    const handleDelete = async (id) => {
        await ecommerceService.deleteCartItem(id);
        loadCart();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Cart</Text>
            <FlatList
                data={cartItems}
                renderItem={({ item }) => (
                    <View style={styles.cartItem}>
                        <Text>{item.product_name} (x{item.quantity})</Text>
                        <Button title="Delete" onPress={() => handleDelete(item.id)} />
                    </View>
                )}
            />
            <Button title="Check Out (create order)" onPress={() => alert("Processing order...")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
});

export default CartScreen;