import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useEcommerceStore from '../../store/useEcommerceStore';
import useAuthStore from '../../store/useAuthStore';

const MyCart = ({ navigation }) => {
    // 1. Hook into the Zustand Store
    const cartItems = useEcommerceStore((state) => state.cartItems);
    const loading = useEcommerceStore((state) => state.loading);
    const fetchCart = useEcommerceStore((state) => state.fetchCart);
    const removeFromCart = useEcommerceStore((state) => state.removeFromCart);
    const user = useAuthStore((state) => state.user);

    // LOG EVERYTHING HERE
  console.log("Current cartItems type:", typeof cartItems);
  console.log('DEBUG - cartItems content:', JSON.stringify(cartItems, null, 2));

    const formatCurrency = (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
    };

    // 2. Fetch cart data when screen mounts
    useEffect(() => {
        if (user?.id && typeof fetchCart === 'function') {
            fetchCart();
        } else {
            console.error("fetchCart is not a function! Check useEcommerceStore exports.");
        }
    }, [user?.id]);

    // 3. Calculate total based on API field names (current_price)
    const total = Array.isArray(cartItems) 
    ? cartItems.reduce((sum, item) => {
        const price = parseFloat(item?.product?.current_price || 0);
        return sum + price;
    }, 0) 
    : 0;

    if (loading && cartItems.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#A68D60" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <TouchableOpacity onPress={() => {}}>
                    <Text style={styles.clearBtn}>Clear</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
                {cartItems.length === 0 ? (
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                ) : (
                    cartItems?.map(item => (
                        item?.product ? (
                        <View key={item.id} style={styles.cartCard}>
                            <Image 
                                source={{ uri: item.product_image_url }} 
                                style={styles.cartImg} 
                            />
                            <View style={styles.cartInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.itemArtist}>by {item.product?.brand_name || 'MULA'}</Text>
                                <Text style={styles.itemType}>{item.product?.artwork_year}</Text>
                                <Text style={styles.itemPrice}>
                                    {formatCurrency(item.price)} MMK
                                </Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.deleteBtn} 
                                onPress={() => removeFromCart(item.id)}
                            >
                                <Text style={styles.deleteIcon}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                        ) : null
                    ))
                )}

                {/* Summary Section */}
                {cartItems.length > 0 && (
                    <>
                        <View style={styles.summaryBox}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Items</Text>
                                <Text style={styles.summaryValue}>{cartItems.length}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery</Text>
                                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>Free</Text>
                            </View>
                            <View style={[styles.summaryRow, styles.totalRow]}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>{formatCurrency(total)} MMK</Text>
                            </View>
                        </View>

                        <View style={styles.paymentBox}>
                            <Text style={styles.paymentTitle}>Accepted Payment</Text>
                            <View style={styles.badgeRow}>
                                {['KBZPay', 'WavePay', 'Card'].map(p => (
                                    <View key={p} style={styles.pBadge}>
                                        <Text style={styles.pBadgeText}>{p}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Footer / Checkout Button */}
            <SafeAreaView style={styles.footer}>
                <TouchableOpacity 
                    disabled={cartItems.length === 0}
                    style={[styles.mainBtn, cartItems.length === 0 && { backgroundColor: '#CCC' }]} 
                    onPress={() => navigation.navigate('checkout', { total })}
                >
                    <Text style={styles.mainBtnText}>
                        {loading ? 'Processing...' : `🔒 Checkout · ${formatCurrency(total)} MMK`}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9F9F9' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: 60, 
        paddingBottom: 20, 
        backgroundColor: '#FFF' 
    },
    backBtn: { fontSize: 35, color: '#333' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    clearBtn: { color: '#888', fontSize: 14 },
    scrollBody: { padding: 20 },
    cartCard: { 
        flexDirection: 'row', 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        padding: 12, 
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    cartImg: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#EEE' },
    cartInfo: { flex: 1, marginLeft: 15 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    itemArtist: { fontSize: 13, color: '#888', marginTop: 2 },
    itemType: { fontSize: 12, color: '#AAA', marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#A68D60', marginTop: 5 },
    deleteBtn: { padding: 10 },
    deleteIcon: { fontSize: 18 },
    summaryBox: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginTop: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { color: '#888' },
    summaryValue: { fontWeight: '600' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 15, marginTop: 5 },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#A68D60' },
    paymentBox: { marginTop: 25, paddingHorizontal: 5 },
    paymentTitle: { fontSize: 14, color: '#888', fontWeight: '600', marginBottom: 15 },
    badgeRow: { flexDirection: 'row' },
    pBadge: { backgroundColor: '#EEE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 },
    pBadgeText: { fontSize: 12, color: '#666', fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
    footer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
    mainBtn: { backgroundColor: '#A68D60', margin: 20, paddingVertical: 18, borderRadius: 12, alignItems: 'center' },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default MyCart;