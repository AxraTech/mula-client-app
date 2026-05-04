import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TextInput, 
    TouchableOpacity, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuthStore from '../../store/useAuthStore';
import useEcommerceStore from '../../store/useEcommerceStore';
import axios from 'axios';

const CheckoutScreen = ({ route, navigation }) => {
    const { total } = route.params;
    const user = useAuthStore((state) => state.user);
    const cartItems = useEcommerceStore((state) => state.cartItems);
    const clearCartUI = useEcommerceStore((state) => state.clearCartUI); // Ensure you have a local state clear

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        receiver_name: '',
        receiver_phone: '',
        receiver_address: '',
        payment_method: 'Kpay' // Default
    });
    const placeOrder = useEcommerceStore((state) => state.placeOrder);

    const handleOrder = async () => {
        if (!form.receiver_name || !form.receiver_phone || !form.receiver_address) {
            Alert.alert("Error", "Please fill in all delivery details");
            return;
        }

        setLoading(true);
        try {
            const productId = cartItems[0]?.product_id || "18"; 

            const orderPayload = {
                input: {
                    user_id: user?.id || 751,
                    payment_method: form.payment_method,
                    receiver_name: form.receiver_name,
                    receiver_phone: form.receiver_phone,
                    receiver_address: form.receiver_address,
                    product_id: productId.toString()
                }
            };

            const response = await placeOrder(orderPayload);

            if (response.data) {
                Alert.alert("Success", "Your order has been placed!", [
                    { text: "OK", onPress: () => navigation.navigate('orderSuccess') }
                ]);
            }
        } catch (error) {
            console.error("Order Error:", error);
            Alert.alert("Order Failed", "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <ScrollView contentContainerStyle={styles.body}>
                <Text style={styles.sectionTitle}>Delivery Information</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Receiver Name</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="e.g. Htet Phyoo Aung"
                        value={form.receiver_name}
                        onChangeText={(t) => setForm({...form, receiver_name: t})}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="09xxxxxxxxx"
                        keyboardType="phone-pad"
                        value={form.receiver_phone}
                        onChangeText={(t) => setForm({...form, receiver_phone: t})}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput 
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="No123, Yangon"
                        multiline
                        value={form.receiver_address}
                        onChangeText={(t) => setForm({...form, receiver_address: t})}
                    />
                </View>

                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentRow}>
                    {['Kpay', 'WavePay', 'COD'].map((method) => (
                        <TouchableOpacity 
                            key={method}
                            style={[styles.payOption, form.payment_method === method && styles.activePay]}
                            onPress={() => setForm({...form, payment_method: method})}
                        >
                            <Text style={[styles.payText, form.payment_method === method && styles.activePayText]}>
                                {method}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>Order Total</Text>
                        <Text style={styles.summaryPrice}>{total.toLocaleString()} MMK</Text>
                    </View>
                </View>
            </ScrollView>

            <SafeAreaView style={styles.footer} edges={['bottom']}>
                <TouchableOpacity 
                    style={styles.confirmBtn}
                    onPress={handleOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.confirmBtnText}>Confirm Order</Text>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backBtn: { fontSize: 35, color: '#333' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    body: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginTop: 10, color: '#333' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, color: '#888', marginBottom: 8 },
    input: { 
        backgroundColor: '#F9F9F9', 
        borderRadius: 8, 
        padding: 12, 
        borderWidth: 1, 
        borderColor: '#EEE',
        fontSize: 15
    },
    paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    payOption: { 
        flex: 1, 
        paddingVertical: 12, 
        alignItems: 'center', 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#EEE',
        marginHorizontal: 5
    },
    activePay: { borderColor: '#A68D60', backgroundColor: '#A68D6010' },
    payText: { color: '#666', fontWeight: '600' },
    activePayText: { color: '#A68D60' },
    summary: { borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryText: { fontSize: 16, color: '#888' },
    summaryPrice: { fontSize: 18, fontWeight: 'bold', color: '#A68D60' },
    footer: { padding: 20 },
    confirmBtn: { backgroundColor: '#333', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default CheckoutScreen;