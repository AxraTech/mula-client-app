import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useEcommerceStore from '../../store/useEcommerceStore';
import useAuthStore from '../../store/useAuthStore';

const OrderHistoryScreen = ({ navigation }) => {
    const orders = useEcommerceStore((state) => state.orders);
    const loading = useEcommerceStore((state) => state.loading);
    const fetchOrderHistory = useEcommerceStore((state) => state.fetchOrderHistory);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (user?.id) {
            fetchOrderHistory(user.id);
        }
    }, [user?.id]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'success': return { color: '#4CAF50', bg: '#E8F5E9' };
            case 'pending': return { color: '#FF9800', bg: '#FFF3E0' };
            default: return { color: '#757575', bg: '#F5F5F5' };
        }
    };

    const renderOrderItem = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.orderCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderNumber}>Order #{item.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.totalText}>{item.total_amount?.toLocaleString()} MMK</Text>
                </View>
                
                <TouchableOpacity style={styles.detailsBtn}>
                    <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtn}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order History</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#A68D60" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No orders found yet.</Text>
                        </View>
                    }
                />
            )}
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
        paddingTop: 50, 
        paddingBottom: 20, 
        backgroundColor: '#FFF' 
    },
    backBtn: { fontSize: 35, color: '#333' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    listContent: { padding: 20 },
    orderCard: { 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        padding: 15, 
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderNumber: { fontWeight: 'bold', fontSize: 15 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { color: '#888', fontSize: 13 },
    totalText: { fontWeight: 'bold', fontSize: 16, color: '#A68D60' },
    detailsBtn: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
    detailsBtnText: { color: '#A68D60', textAlign: 'center', fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: '#888' }
});

export default OrderHistoryScreen;