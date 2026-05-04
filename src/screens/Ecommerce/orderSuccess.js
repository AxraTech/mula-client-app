import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OrderSuccess = ({ navigation, route }) => {
    // We can pass the orderId from the Checkout API response
    const { orderId } = route.params || { orderId: 'MULA-777' };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Icon */}
                <View style={styles.iconCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                </View>

                <Text style={styles.title}>Order Placed!</Text>
                <Text style={styles.subtitle}>
                    Thank you for your purchase. Your order has been successfully placed and is being processed.
                </Text>

                <View style={styles.orderIdBox}>
                    <Text style={styles.orderIdLabel}>Order ID</Text>
                    <Text style={styles.orderIdValue}>#{orderId}</Text>
                </View>

                <Text style={styles.infoText}>
                    You can check the status of your order in the "Order History" section of your profile later.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.primaryBtn} 
                    onPress={() => navigation.navigate('home')}
                >
                    <Text style={styles.primaryBtnText}>Continue Shopping</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('home')} // Change to History later
                >
                    <Text style={styles.secondaryBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#A68D60',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        ...Platform.select({
            ios: { shadowColor: '#A68D60', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10 },
            android: { elevation: 10 }
        })
    },
    checkIcon: {
        fontSize: 50,
        color: '#FFF',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    orderIdBox: {
        backgroundColor: '#F9F9F9',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
        alignItems: 'center',
        marginBottom: 20,
    },
    orderIdLabel: {
        fontSize: 12,
        color: '#AAA',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    orderIdValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A68D60',
    },
    infoText: {
        fontSize: 13,
        color: '#AAA',
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 0 : 30,
    },
    primaryBtn: {
        backgroundColor: '#333',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    primaryBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryBtn: {
        paddingVertical: 15,
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#A68D60',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default OrderSuccess;